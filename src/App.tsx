import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Wifi, 
  MapPin, 
  Calendar, 
  Clock, 
  TrendingUp, 
  Navigation, 
  Zap, 
  Activity,
  Layers,
  Settings,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fix Leaflet icon issue
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// --- Types ---
interface Prediction {
  location_name?: string;
  lat: number;
  lon: number;
  predicted_speed: number;
}

interface UserLocation {
  lat: number;
  lon: number;
}

// --- Components ---

const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

const LandingPage = ({ onStart }: { onStart: () => void }) => {
  return (
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 blur-[120px] rounded-full" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center z-10 max-w-4xl"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-8">
            <Activity className="w-3 h-3" />
            <span>ML-POWERED NETWORK ANALYTICS</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
            NETPULSE
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Predict campus network speeds with precision. Our Random Forest model analyzes location, time, and event context to find your best connection.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={onStart}
              className="group relative px-8 py-4 bg-white text-black font-semibold rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                Launch Dashboard <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
            <button className="px-8 py-4 bg-zinc-900 text-white font-semibold rounded-full border border-zinc-800 transition-all hover:bg-zinc-800">
              View Methodology
            </button>
          </div>
        </motion.div>

        {/* Floating Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full max-w-5xl">
          {[
            { label: 'Accuracy', value: '94.2%', icon: TrendingUp },
            { label: 'Data Points', value: '12k+', icon: Layers },
            { label: 'Latency', value: '< 50ms', icon: Zap },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 backdrop-blur-sm"
            >
              <stat.icon className="w-5 h-5 text-emerald-500 mb-4" />
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="p-8 border-t border-zinc-900 text-center text-zinc-600 text-sm">
        © 2026 NetPulse Analytics. Built for the modern campus.
      </footer>
    </div>
  );
};

const Dashboard = () => {
  const controllerRef = useRef<AbortController | null>(null);
  const [userLoc, setUserLoc] = useState<UserLocation | null>(null);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [bestNearby, setBestNearby] = useState<Prediction[]>([]);
  const [dayType, setDayType] = useState('Weekday');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());


const fetchPrediction = async (lat: number, lon: number, selectedDay?: string) => {
  const activeDay = selectedDay || dayType;
  const hour = currentTime.getHours();

  // Cancel previous request
  if (controllerRef.current) {
    controllerRef.current.abort();
  }

  const controller = new AbortController();
  controllerRef.current = controller;

  setIsLoading(true);

  try {
    const [predRes, bestRes] = await Promise.all([
      fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lon, hour, dayType: activeDay }),
        signal: controller.signal
      }),
      fetch(`/api/best-nearby?lat=${lat}&lon=${lon}&hour=${hour}&dayType=${activeDay}`, {
        signal: controller.signal
      })
    ]);

    if (!predRes.ok || !bestRes.ok) return;

    const data = await predRes.json();
    const bestData = await bestRes.json();

    setPrediction(data.speed);
    setBestNearby(bestData);

  } catch (err: any) {
    if (err.name !== "AbortError") {
      console.error("Fetch error:", err);
    }
  } finally {
    setIsLoading(false);
  }
};

  const handleTrackLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const newLoc = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      setUserLoc(newLoc);
      fetchPrediction(newLoc.lat, newLoc.lon);
    });
  };

  // Default to VIT Chennai if no location
  const mapCenter: [number, number] = userLoc ? [userLoc.lat, userLoc.lon] : [12.8406, 80.1534];

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col md:flex-row overflow-hidden">
      {/* Sidebar */}
      <aside className="w-full md:w-80 border-r border-zinc-800 flex flex-col bg-zinc-900/30 backdrop-blur-xl z-20">
        <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Wifi className="w-5 h-5 text-black" />
            </div>
            <span className="font-bold tracking-tight">NETPULSE</span>
          </div>
          <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <Settings className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Status Card */}
          <section className="space-y-4">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Current Context</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                <Clock className="w-4 h-4 text-emerald-500 mb-2" />
                <div className="text-sm font-medium">{format(currentTime, 'HH:mm')}</div>
                <div className="text-[10px] text-zinc-500">Local Time</div>
              </div>
              <div className="p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                <Calendar className="w-4 h-4 text-blue-500 mb-2" />
                <div className="text-sm font-medium">{dayType}</div>
                <div className="text-[10px] text-zinc-500">Day Type</div>
              </div>
            </div>
          </section>

          {/* Controls */}
          <section className="space-y-4">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Simulation Controls</label>
            <div className="flex flex-wrap gap-2">
              {['Weekday', 'Weekend', 'Event'].map((type) => (
              <button
                key={type}
                onClick={() => {
                  setDayType(type);

                  if (userLoc) {
                    fetchPrediction(userLoc.lat, userLoc.lon, type);
                  } else {
                    alert("Please track location first.");
                  }
                }}
                className={cn(
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                  dayType === type 
                    ? "bg-emerald-500 text-black" 
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                )}
              >
                {type}
              </button>
            ))}
            </div>
          </section>

          {/* Prediction Result */}
          <section className="space-y-4">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Live Prediction</label>
            <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-white/10 relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-4xl font-bold tracking-tighter mb-1">
                  {isLoading ? '...' : (prediction ? prediction.toFixed(1) : '--.-')}
                  <span className="text-sm font-normal text-zinc-400 ml-2">Mbps</span>
                </div>
                <div className="text-xs text-emerald-400 flex items-center gap-1">
                  <Activity className="w-3 h-3" />
                  Real-time estimate
                </div>
              </div>
              <div className="absolute top-0 right-0 p-4 opacity-20">
                <TrendingUp className="w-12 h-12" />
              </div>
            </div>
          </section>

          {/* Best Nearby */}
          <section className="space-y-4">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Best Nearby Hotspots</label>
            <div className="space-y-2">
              {bestNearby.slice(0, 3).map((loc, i) => (
                <div key={loc.location_name} className="flex items-center justify-between p-3 rounded-xl bg-zinc-800/30 border border-zinc-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                      0{i + 1}
                    </div>
                    <div>
                      <div className="text-xs font-semibold">{loc.location_name}</div>
                      <div className="text-[10px] text-zinc-500">Predicted Hotspot</div>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-emerald-400">{loc.predicted_speed.toFixed(1)}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="p-6 border-t border-zinc-800">
          <button 
            onClick={handleTrackLocation}
            className="w-full py-3 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors"
          >
            <Navigation className="w-4 h-4" />
            Track My Location
          </button>
        </div>
      </aside>

      {/* Main Content / Map */}
      <main className="flex-1 relative">
        <div className="absolute top-6 left-6 z-[1000] flex gap-2">
          <div className="px-4 py-2 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-full flex items-center gap-3 shadow-2xl">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-zinc-300">System Online</span>
            </div>
            <div className="w-px h-4 bg-zinc-800" />
            <div className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-zinc-500" />
              <span className="text-xs font-medium text-zinc-300">
                {userLoc ? `${userLoc.lat.toFixed(4)}, ${userLoc.lon.toFixed(4)}` : 'Waiting for location...'}
              </span>
            </div>
          </div>
        </div>

        <MapContainer 
          center={mapCenter} 
          zoom={17} 
          className="h-full w-full grayscale-[0.8] invert-[0.9] hue-rotate-[180deg]"
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapUpdater center={mapCenter} />
          
          {userLoc && (
            <>
              <Marker position={[userLoc.lat, userLoc.lon]}>
                <Popup>
                  <div className="text-black p-2">
                    <div className="font-bold text-sm mb-1">Your Location</div>
                    <div className="text-xs text-zinc-600">Predicting speed for this point...</div>
                  </div>
                </Popup>
              </Marker>
              <Circle 
                center={[userLoc.lat, userLoc.lon]} 
                radius={50} 
                pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.1 }} 
              />
            </>
          )}

          {bestNearby.map((loc) => (
            <Marker key={loc.location_name} position={[loc.lat, loc.lon]}>
              <Popup>
                <div className="text-black p-3 min-w-[150px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm">{loc.location_name}</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">HOTSPOT</span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <Wifi className="w-4 h-4 text-zinc-400" />
                    <span className="text-lg font-bold">{loc.predicted_speed.toFixed(1)} Mbps</span>
                  </div>
                  <button className="w-full py-1.5 bg-zinc-900 text-white text-[10px] font-bold rounded uppercase tracking-wider">
                    Navigate Here
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Floating Legend */}
        <div className="absolute bottom-6 right-6 z-[1000] p-4 bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-2xl shadow-2xl space-y-3">
          <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Map Legend</div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-xs text-zinc-300">Your Position</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-xs text-zinc-300">Network Hotspot</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-zinc-700" />
            <span className="text-xs text-zinc-300">Training Node</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default function App() {
  const [showDashboard, setShowDashboard] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {!showDashboard ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.5 }}
        >
          <LandingPage onStart={() => setShowDashboard(true)} />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="h-screen"
        >
          <Dashboard />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
