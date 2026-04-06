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
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    hour INTEGER,
    day_of_week TEXT,
    is_weekend INTEGER,
    is_holiday INTEGER,
    is_event_day INTEGER,
    lat REAL,
    lon REAL,
    building TEXT,
    distance_to_router REAL,
    num_access_points INTEGER,
    signal_strength REAL,
    num_connected_users INTEGER,
    network_traffic REAL,
    latency REAL,
    packet_loss REAL,
    temperature REAL,
    humidity REAL,
    rain INTEGER,
    download_speed REAL,
    upload_speed REAL
  );
`);

// Seed initial data if empty
const count = db.prepare("SELECT COUNT(*) as count FROM training_data").get() as { count: number };
if (count.count === 0) {
  const insert = db.prepare(`
    INSERT INTO training_data (
      hour, day_of_week, is_weekend, is_holiday, is_event_day, 
      lat, lon, building, distance_to_router, num_access_points, 
      signal_strength, num_connected_users, network_traffic, latency, 
      packet_loss, temperature, humidity, rain, download_speed, upload_speed
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  // VIT Chennai approximate locations with expanded parameters
  const data = [
    // AB1
    [9, "Monday", 0, 0, 0, 12.8406, 80.1534, "AB1", 15.5, 4, -45, 120, 0.8, 12, 0.01, 32, 65, 0, 45.5, 22.0],
    [15, "Monday", 0, 0, 0, 12.8406, 80.1534, "AB1", 15.5, 4, -50, 250, 0.95, 25, 0.05, 35, 60, 0, 12.5, 5.0],
    
    // AB2
    [10, "Tuesday", 0, 0, 0, 12.8408, 80.1538, "AB2", 10.2, 5, -40, 80, 0.6, 10, 0.0, 31, 70, 0, 55.0, 30.0],
    [14, "Tuesday", 0, 0, 0, 12.8408, 80.1538, "AB2", 10.2, 5, -42, 150, 0.75, 15, 0.01, 34, 65, 0, 42.0, 20.0],

    // AB3
    [9, "Wednesday", 0, 0, 0, 12.8415, 80.1545, "AB3", 20.0, 3, -55, 200, 0.85, 20, 0.02, 32, 65, 0, 40.17, 18.0],
    [15, "Wednesday", 0, 0, 1, 12.8415, 80.1545, "AB3", 20.0, 3, -65, 450, 0.99, 80, 0.15, 33, 68, 0, 8.39, 2.1],

    // Library
    [11, "Thursday", 0, 0, 0, 12.8420, 80.1525, "Library", 5.0, 8, -35, 50, 0.4, 8, 0.0, 28, 50, 0, 85.0, 45.0],
    [16, "Thursday", 0, 0, 0, 12.8420, 80.1525, "Library", 5.0, 8, -38, 120, 0.6, 12, 0.01, 30, 55, 0, 45.0, 25.0],

    // Rain scenario
    [10, "Friday", 0, 0, 0, 12.8420, 80.1525, "Library", 5.0, 8, -55, 100, 0.7, 45, 0.08, 25, 95, 1, 25.0, 10.0],
  ];

  data.forEach(row => insert.run(...row));
}

app.use(express.json());

import { spawn } from "child_process";

// ML Prediction Logic - Calling the Python Bridge
function predictSpeed(params: any): Promise<{ download: number, upload: number }> {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python3', [
      'predict.py', 
      JSON.stringify(params)
    ]);

    let dataString = '';
    pythonProcess.stdout.on('data', (data) => { dataString += data.toString(); });

    pythonProcess.on('close', (code) => {
      try {
        const result = JSON.parse(dataString);
        if (result.error) {
          console.error("ML Model Error:", result.error);
          resolve({ download: 20, upload: 10 });
        } else {
          resolve({ download: result.download_speed, upload: result.upload_speed });
        }
      } catch (e) {
        console.error("Failed to parse ML output:", dataString);
        resolve({ download: 20, upload: 10 });
      }
    });
  });
}

// API Routes
app.post("/api/predict", async (req, res) => {
  const prediction = await predictSpeed(req.body);
  res.json({
    download_speed: prediction.download,
    upload_speed: prediction.upload
  });
});

app.post("/api/best-nearby", async (req, res) => {
  const params = req.body;
  const locations = db.prepare("SELECT DISTINCT building as location_name, lat, lon FROM training_data").all() as any[];
  
  const predictions = await Promise.all(locations.map(async loc => {
    const pred = await predictSpeed({ ...params, lat: loc.lat, lon: loc.lon, building: loc.location_name });
    return { ...loc, predicted_speed: pred.download };
  }));

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
