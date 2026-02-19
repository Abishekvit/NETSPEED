import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";

const app = express();
const PORT = 3000;
const db = new Database("network_data.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS training_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    location_name TEXT,
    lat REAL,
    lon REAL,
    hour INTEGER,
    day_type TEXT,
    speed REAL
  );

  CREATE TABLE IF NOT EXISTS user_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lat REAL,
    lon REAL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    actual_speed REAL,
    predicted_speed REAL
  );
`);

// Seed initial data if empty
const count = db.prepare("SELECT COUNT(*) as count FROM training_data").get() as { count: number };
if (count.count === 0) {
  const insert = db.prepare("INSERT INTO training_data (location_name, lat, lon, hour, day_type, speed) VALUES (?, ?, ?, ?, ?, ?)");
  
  // VIT Chennai approximate locations
  const data = [
    // AB1
    ["AB1", 12.8406, 80.1534, 9, "Weekday", 45.5],
    ["AB1", 12.8406, 80.1534, 15, "Weekday", 32.0],
    ["AB1", 12.8406, 80.1534, 20, "Event", 12.5],
    
    // AB3
    ["AB3", 12.8415, 80.1545, 9, "Weekday", 40.17],
    ["AB3", 12.8415, 80.1545, 15, "Event", 8.39],
    ["AB3", 12.8415, 80.1545, 22, "Weekend", 15.0],

    // D2 Hostel
    ["D2 Hostel", 12.8435, 80.1560, 14, "Weekend", 5.65],
    ["D2 Hostel", 12.8435, 80.1560, 2, "Weekend", 55.0],
    ["D2 Hostel", 12.8435, 80.1560, 10, "Weekday", 25.0],

    // Library
    ["Library", 12.8420, 80.1525, 11, "Weekday", 85.0],
    ["Library", 12.8420, 80.1525, 16, "Weekday", 45.0],
  ];

  data.forEach(row => insert.run(...row));
}

app.use(express.json());

import { spawn } from "child_process";

// ... (Database initialization remains the same for logging)

// ML Prediction Logic - Calling the Python Bridge
function predictSpeed(lat: number, lon: number, hour: number, dayType: string): Promise<number> {
  return new Promise((resolve, reject) => {
    // Call the python script
    const pythonProcess = spawn('python3', [
      'predict.py', 
      lat.toString(), 
      lon.toString(), 
      hour.toString(), 
      dayType
    ]);

    let dataString = '';

    pythonProcess.stdout.on('data', (data) => {
      dataString += data.toString();
    });

    pythonProcess.on('close', (code) => {
      try {
        const result = JSON.parse(dataString);
        if (result.error) {
          console.error("ML Model Error:", result.error);
          resolve(20); // Fallback speed
        } else {
          resolve(result.speed);
        }
      } catch (e) {
        console.error("Failed to parse ML output:", dataString);
        resolve(20); // Fallback
      }
    });

    pythonProcess.on('error', (err) => {
      console.error("Failed to start Python process:", err);
      resolve(20); // Fallback
    });
  });
}

// API Routes
app.post("/api/predict", async (req, res) => {
  const { lat, lon, hour, dayType } = req.body;
  const prediction = await predictSpeed(lat, lon, hour, dayType);
  res.json({ speed: prediction });
});

app.get("/api/best-nearby", async (req, res) => {
  const { lat, lon, hour, dayType } = req.query;
  const l = parseFloat(lat as string);
  const n = parseFloat(lon as string);
  const h = parseInt(hour as string);
  const d = dayType as string;

  // Find best speeds at known locations by querying the ML model for each
  const locations = db.prepare("SELECT DISTINCT location_name, lat, lon FROM training_data").all() as any[];
  
  const predictions = await Promise.all(locations.map(async loc => ({
    ...loc,
    predicted_speed: await predictSpeed(loc.lat, loc.lon, h, d)
  })));

  predictions.sort((a, b) => b.predicted_speed - a.predicted_speed);
  res.json(predictions);
});

app.get("/api/training-data", (req, res) => {
  const data = db.prepare("SELECT * FROM training_data").all();
  res.json(data);
});

// Vite middleware for development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
