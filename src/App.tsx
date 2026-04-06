import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, useMapEvents } from 'react-leaflet';
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
  ChevronRight,
  Users,
  Search,
  ArrowRight,
  Info,
  RefreshCw,
  Gauge,
  Cpu,
  Brain,
  Radio,
  Signal,
  Target,
  CloudRain,
  Ruler
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';

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

// Custom Neon Marker
const createNeonIcon = (color: string) => L.divIcon({
  className: 'custom-neon-icon',
  html: `<div style="background-color: ${color}; box-shadow: 0 0 15px ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
  iconSize: [12, 12],
  iconAnchor: [6, 6],
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
    <div className="min-h-screen bg-[#050505] text-white overflow-hidden flex flex-col font-sans">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
            x: [0, 50, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/20 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.15, 0.1],
            x: [0, -30, 0],
            y: [0, 40, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-500/20 blur-[150px] rounded-full" 
        />
      </div>

      {/* Navigation */}
      <nav className="z-50 px-8 py-6 flex justify-between items-center border-b border-white/5 backdrop-blur-md bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Brain className="w-6 h-6 text-black" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black tracking-tighter leading-none uppercase">Neuronet</span>
            <span className="text-[10px] font-bold text-cyan-500 tracking-widest uppercase">VIT Chennai</span>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-zinc-400">
          <a href="#" className="hover:text-cyan-400 transition-colors">Neural Grid</a>
          <a href="#" className="hover:text-cyan-400 transition-colors">ML Core</a>
          <button onClick={onStart} className="px-6 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all font-bold">
            INITIATE
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center max-w-5xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-black mb-8 tracking-widest uppercase">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Neural Campus Network</span>
          </div>
          
          <h1 className="text-7xl md:text-[10rem] font-black tracking-tighter mb-8 leading-[0.85] uppercase">
            Predict <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-600">
              The Flow.
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-3xl mx-auto leading-relaxed font-medium uppercase tracking-tight">
            Advanced neural regression for campus-wide network speed forecasting. 
            Real-time diagnostics. Predictive hotspots.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button 
              onClick={onStart}
              className="group relative px-12 py-6 bg-cyan-500 text-black font-black rounded-xl overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-cyan-500/30 uppercase tracking-widest"
            >
              <span className="relative z-10 flex items-center gap-3 text-lg">
                Access Grid <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
          </div>
        </motion.div>
      </main>

      <footer className="p-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em]">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4" />
          <span>NEURONET CORE v2.0.4</span>
        </div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white transition-colors">Protocol</a>
          <a href="#" className="hover:text-white transition-colors">Security</a>
          <a href="#" className="hover:text-white transition-colors">Neural Link</a>
        </div>
      </footer>
    </div>
  );
};

const Dashboard = () => {
  const controllerRef = useRef<AbortController | null>(null);
  const [userLoc, setUserLoc] = useState<UserLocation | null>(null);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [uploadPrediction, setUploadPrediction] = useState<number | null>(null);
  const [bestNearby, setBestNearby] = useState<Prediction[]>([]);
  const [dayType, setDayType] = useState('Weekday');
  const [userCount, setUserCount] = useState(50);
  const [signalStrength, setSignalStrength] = useState(-50);
  const [networkTraffic, setNetworkTraffic] = useState(0.5);
  const [isRainy, setIsRainy] = useState(false);
  const [weather, setWeather] = useState('Sunny');
  const [isHoliday, setIsHoliday] = useState(false);
  const [distanceToRouter, setDistanceToRouter] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());
  const [isSpeedTesting, setIsSpeedTesting] = useState(false);
  const [realTimeSpeed, setRealTimeSpeed] = useState<number | null>(null);
  const [isNowMode, setIsNowMode] = useState(true);

  const campusNodes = [
    { name: 'AB1', lat: 12.8406, lon: 80.1534, id: 'N001' },
    { name: 'AB2', lat: 12.8408, lon: 80.1538, id: 'N002' },
    { name: 'AB3', lat: 12.8415, lon: 80.1545, id: 'N003' },
    { name: 'B1 Block', lat: 12.8425, lon: 80.1550, id: 'N004' },
    { name: 'D2 Block', lat: 12.8435, lon: 80.1560, id: 'N005' },
    { name: 'Library', lat: 12.8420, lon: 80.1525, id: 'N006' },
    { name: 'C Block', lat: 12.8410, lon: 80.1520, id: 'N007' },
  ];

  const fetchPrediction = async (lat: number, lon: number, options?: any) => {
    const activeDay = options?.day || dayType;
    const hour = isNowMode ? new Date().getHours() : (options?.hour !== undefined ? options.hour : selectedHour);
    const users = options?.users !== undefined ? options.users : userCount;
    const activeWeather = options?.weather || weather;

    if (controllerRef.current) {
      controllerRef.current.abort();
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    setIsLoading(true);

    try {
      const params = {
        location: options?.location || 'Custom Point',
        lat,
        lon,
        hour,
        day_of_week: activeDay === 'Weekend' ? 'Sunday' : 'Monday',
        is_weekend: activeDay === 'Weekend' ? 1 : 0,
        is_holiday: isHoliday ? 1 : 0,
        is_event: activeDay === 'Event' ? 1 : 0,
        weather: activeWeather,
        distance_to_tower: distanceToRouter,
        num_connected_users: users,
        signal_strength: signalStrength,
        network_traffic: networkTraffic
      };

      const [predRes, bestRes] = await Promise.all([
        fetch('/api/predict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
          signal: controller.signal
        }),
        fetch(`/api/best-nearby`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
          signal: controller.signal
        })
      ]);

      if (!predRes.ok || !bestRes.ok) {
        console.error("API Error:", predRes.status, bestRes.status);
        return;
      }

      const data = await predRes.json();
      const bestData = await bestRes.json();

      if (data.download_speed !== undefined) {
        setPrediction(data.download_speed);
        setUploadPrediction(data.upload_speed);
      }
      
      if (Array.isArray(bestData)) {
        setBestNearby(bestData);
      }

    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Fetch error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapClick = (e: any) => {
    const { lat, lng } = e.latlng;
    const newLoc = { lat, lon: lng, name: 'Target Node' };
    setUserLoc(newLoc);
    fetchPrediction(lat, lng);
  };

  const runSpeedTest = () => {
    setIsSpeedTesting(true);
    setRealTimeSpeed(null);
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        clearInterval(interval);
        const finalSpeed = 15 + Math.random() * 40;
        setRealTimeSpeed(finalSpeed);
        setIsSpeedTesting(false);
        if (userLoc) fetchPrediction(userLoc.lat, userLoc.lon);
      }
    }, 150);
  };

  const handleTrackLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const newLoc = { lat: pos.coords.latitude, lon: pos.coords.longitude, name: 'Current GPS' };
      setUserLoc(newLoc);
      fetchPrediction(pos.coords.latitude, pos.coords.longitude);
    });
  };

  const selectNode = (node: any) => {
    const newLoc = { lat: node.lat, lon: node.lon, name: node.name };
    setUserLoc(newLoc);
    fetchPrediction(newLoc.lat, newLoc.lon, { location: node.name });
  };

  const MapEvents = () => {
    useMapEvents({
      click: handleMapClick,
    });
    return null;
  };

  const mapCenter: [number, number] = userLoc ? [userLoc.lat, userLoc.lon] : [12.8406, 80.1534];

  // Mock data for analytics
  const timeSeriesData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    speed: 20 + Math.sin(i / 3) * 15 + Math.random() * 5,
    users: 50 + Math.cos(i / 4) * 40 + Math.random() * 10
  }));

  const locationComparisonData = campusNodes.map(node => ({
    name: node.name,
    speed: 10 + Math.random() * 40,
    congestion: Math.random() * 100
  })).sort((a, b) => b.speed - a.speed);

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col overflow-hidden font-sans">
      {/* Top Bar */}
      <header className="h-20 border-b border-white/10 bg-black/40 backdrop-blur-xl flex items-center justify-between px-8 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Brain className="w-7 h-7 text-black" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">Neuronet</h1>
            <span className="text-[10px] font-bold text-cyan-500 tracking-[0.3em] uppercase">VIT Chennai</span>
          </div>
        </div>

        <div className="flex items-center gap-12">
          <div className="flex gap-8">
            <div className="flex flex-col items-end">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tighter tabular-nums text-cyan-400">
                  {isSpeedTesting ? '...' : (realTimeSpeed ? realTimeSpeed.toFixed(1) : (prediction ? prediction.toFixed(1) : '00.0'))}
                </span>
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">DL Mbps</span>
              </div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="flex flex-col items-end">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black tracking-tighter tabular-nums text-purple-400">
                  {isSpeedTesting ? '...' : (realTimeSpeed ? (realTimeSpeed * 0.5).toFixed(1) : (uploadPrediction ? uploadPrediction.toFixed(1) : '00.0'))}
                </span>
                <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">UL Mbps</span>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:flex flex-col items-end">
            <div className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Neural Throughput</div>
            <button className="px-6 py-2 bg-zinc-900 border border-white/10 rounded-lg text-[10px] font-black tracking-[0.2em] uppercase hover:bg-zinc-800 transition-all mt-1">
              READY
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Sidebar: Controls */}
        <aside className="w-80 border-r border-white/10 bg-black/40 backdrop-blur-3xl flex flex-col z-40">
          <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
            {/* Controls */}
            <section className="space-y-8">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-cyan-500" />
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-cyan-500">Controls</h2>
              </div>
              
              <div className="grid grid-cols-1 gap-6">
                <div className="flex flex-col gap-2">
                  <button 
                    onClick={() => setIsNowMode(true)}
                    className={cn(
                      "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                      isNowMode ? "bg-cyan-500 text-black border-cyan-500" : "bg-transparent text-zinc-500 border-white/10"
                    )}
                  >
                    Real-time Mode
                  </button>
                  <button 
                    onClick={() => setIsNowMode(false)}
                    className={cn(
                      "py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                      !isNowMode ? "bg-purple-500 text-white border-purple-500" : "bg-transparent text-zinc-500 border-white/10"
                    )}
                  >
                    Predictive Mode
                  </button>
                </div>

                {!isNowMode && (
                  <div className="space-y-6 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Time Projection</span>
                      <span className="text-sm font-black text-cyan-400">{selectedHour}:00</span>
                    </div>
                    <input 
                      type="range" min="0" max="23" value={selectedHour}
                      onChange={(e) => {
                        const h = parseInt(e.target.value);
                        setSelectedHour(h);
                        if (userLoc) fetchPrediction(userLoc.lat, userLoc.lon, { hour: h });
                      }}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={runSpeedTest}
                  disabled={isSpeedTesting}
                  className="w-full py-5 bg-cyan-500 text-black font-black rounded-xl flex items-center justify-center gap-3 hover:bg-cyan-400 transition-all disabled:opacity-50 shadow-xl shadow-cyan-500/20 uppercase tracking-widest text-sm"
                >
                  {isSpeedTesting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
                  Neural Scan
                </button>
                <button 
                  onClick={handleTrackLocation}
                  className="w-full py-5 bg-transparent border border-cyan-500/50 text-cyan-400 font-black rounded-xl flex items-center justify-center gap-3 hover:bg-cyan-500/10 transition-all uppercase tracking-widest text-sm"
                >
                  <Navigation className="w-5 h-5" />
                  GPS Lock
                </button>
              </div>
            </section>

            {/* Neural Configuration */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-purple-500" />
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-purple-500">Neural Config</h2>
              </div>

              <div className="space-y-8 p-6 rounded-3xl bg-zinc-900/50 border border-white/5">
                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Day Protocol</label>
                  <div className="grid grid-cols-1 gap-2">
                    {['Weekday', 'Weekend', 'Event'].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setDayType(type);
                          if (userLoc) fetchPrediction(userLoc.lat, userLoc.lon, { day: type });
                        }}
                        className={cn(
                          "py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                          dayType === type 
                            ? "bg-purple-500 text-white border-purple-500" 
                            : "bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10"
                        )}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Weather Protocol</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Sunny', 'Rainy', 'Cloudy'].map((w) => (
                      <button
                        key={w}
                        onClick={() => {
                          setWeather(w);
                          if (userLoc) fetchPrediction(userLoc.lat, userLoc.lon, { weather: w });
                        }}
                        className={cn(
                          "py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all border",
                          weather === w 
                            ? "bg-blue-500 text-white border-blue-500" 
                            : "bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10"
                        )}
                      >
                        {w}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 text-zinc-500" />
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Density</label>
                      </div>
                      <span className="text-xs font-black text-cyan-400 tabular-nums">{userCount}</span>
                    </div>
                    <input 
                      type="range" min="1" max="500" value={userCount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setUserCount(val);
                        if (userLoc) fetchPrediction(userLoc.lat, userLoc.lon, { users: val });
                      }}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Signal className="w-3 h-3 text-zinc-500" />
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Signal</label>
                      </div>
                      <span className="text-xs font-black text-purple-400 tabular-nums">{signalStrength}</span>
                    </div>
                    <input 
                      type="range" min="-90" max="-30" value={signalStrength}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        setSignalStrength(val);
                        if (userLoc) fetchPrediction(userLoc.lat, userLoc.lon);
                      }}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-zinc-500" />
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Traffic</label>
                      </div>
                      <span className="text-xs font-black text-pink-400 tabular-nums">{(networkTraffic * 100).toFixed(0)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.1" value={networkTraffic}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setNetworkTraffic(val);
                        if (userLoc) fetchPrediction(userLoc.lat, userLoc.lon);
                      }}
                      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <button
                    onClick={() => {
                      setIsHoliday(!isHoliday);
                      if (userLoc) fetchPrediction(userLoc.lat, userLoc.lon);
                    }}
                    className={cn(
                      "flex items-center justify-center gap-3 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                      isHoliday ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" : "bg-white/5 text-zinc-500 border-white/5"
                    )}
                  >
                    <Calendar className="w-4 h-4" />
                    Holiday Protocol
                  </button>
                </div>
              </div>
            </section>
          </div>
        </aside>

        {/* Center Area: Map */}
        <main className="flex-1 relative">
          <MapContainer 
            center={mapCenter} 
            zoom={17} 
            className="h-full w-full grayscale-[0.9] invert-[0.95] hue-rotate-[180deg] brightness-[0.9] contrast-[1.1]"
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapUpdater center={mapCenter} />
            <MapEvents />
            
            {/* User Location */}
            {userLoc && (
              <>
                <Marker position={[userLoc.lat, userLoc.lon]} icon={createNeonIcon('#f43f5e')}>
                  <Popup className="custom-popup">
                    <div className="p-4 bg-zinc-900 text-white rounded-xl border border-white/10">
                      <div className="font-black text-[9px] uppercase tracking-widest text-zinc-500 mb-2">User Node</div>
                      <div className="text-sm font-bold">Active Connection</div>
                    </div>
                  </Popup>
                </Marker>
                <Circle 
                  center={[userLoc.lat, userLoc.lon]} 
                  radius={100} 
                  pathOptions={{ color: '#f43f5e', fillColor: '#f43f5e', fillOpacity: 0.1, weight: 2 }} 
                />
              </>
            )}

            {/* Campus Nodes */}
            {campusNodes.map((node) => (
              <Marker 
                key={node.id} 
                position={[node.lat, node.lon]} 
                icon={createNeonIcon('#06b6d4')}
                eventHandlers={{
                  click: () => selectNode(node)
                }}
              >
                <Popup className="custom-popup">
                  <div className="p-4 bg-zinc-900 text-white rounded-xl border border-white/10 min-w-[150px]">
                    <div className="font-black text-[9px] uppercase tracking-widest text-zinc-500 mb-2">{node.id}</div>
                    <div className="text-sm font-bold mb-3">{node.name}</div>
                    <button 
                      onClick={() => selectNode(node)}
                      className="w-full py-2 bg-cyan-500 text-black text-[9px] font-black rounded uppercase tracking-widest"
                    >
                      Scan Node
                    </button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Best Hotspot Highlight */}
            {bestNearby.length > 0 && (
              <Circle 
                center={[bestNearby[0].lat, bestNearby[0].lon]} 
                radius={120} 
                pathOptions={{ color: '#d946ef', fillColor: '#d946ef', fillOpacity: 0.1, weight: 2 }} 
              />
            )}
          </MapContainer>

          {/* Floating Map Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 bg-black/60 backdrop-blur-xl p-2 rounded-2xl border border-white/10">
            {campusNodes.map(node => (
              <button
                key={node.id}
                onClick={() => selectNode(node)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                  userLoc?.lat === node.lat ? "bg-cyan-500 text-black" : "hover:bg-white/5 text-zinc-400"
                )}
              >
                {node.name}
              </button>
            ))}
          </div>
        </main>

        {/* Right Panel: Analytics */}
        <aside className="w-96 border-l border-white/10 bg-black/40 backdrop-blur-3xl flex flex-col z-40">
          <div className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar">
            {/* Neural Insight */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-cyan-500" />
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-cyan-500">Neural Insight</h2>
              </div>
              
              <div className="p-6 rounded-3xl bg-zinc-900/50 border border-white/5 relative overflow-hidden group">
                <div className="relative z-10 flex flex-col gap-6">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-4 h-4 rounded-full animate-pulse shadow-[0_0_15px]",
                      prediction && prediction > 30 ? "bg-cyan-500 shadow-cyan-500/50" : "bg-purple-500 shadow-purple-500/50"
                    )} />
                    <span className="text-xs font-black italic tracking-widest uppercase">
                      {prediction && prediction > 30 ? 'High Throughput Zone' : 'Standard Signal Zone'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Best Nearby</div>
                      <div className="text-xs font-black truncate text-cyan-400">
                        {bestNearby[0]?.location_name || 'Scanning...'}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Peak Speed</div>
                      <div className="text-xl font-black tabular-nums">
                        {bestNearby[0]?.predicted_speed?.toFixed(1) || '00.0'}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Congestion</div>
                      <div className="text-xs font-black text-purple-400">
                        {networkTraffic > 0.7 ? 'CRITICAL' : networkTraffic > 0.4 ? 'MODERATE' : 'OPTIMAL'}
                      </div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                      <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Crowd Level</div>
                      <div className="text-xs font-black text-pink-400">
                        {userCount > 300 ? 'DENSE' : userCount > 100 ? 'MEDIUM' : 'LOW'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Analytics Graphs */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-purple-500" />
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-purple-500">Analytics</h2>
              </div>

              {/* Speed Projection Chart */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">24H Speed Projection</h3>
                <div className="h-48 w-full bg-zinc-900/50 rounded-2xl border border-white/5 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeSeriesData}>
                      <defs>
                        <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis 
                        dataKey="hour" 
                        hide 
                      />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                        itemStyle={{ color: '#22d3ee', fontWeight: 'bold' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="speed" 
                        stroke="#22d3ee" 
                        fillOpacity={1} 
                        fill="url(#colorSpeed)" 
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Location Comparison */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Node Comparison</h3>
                <div className="space-y-3">
                  {locationComparisonData.slice(0, 4).map((item, idx) => (
                    <div key={item.name} className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-500">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="text-[10px] font-black uppercase tracking-widest">{item.name}</div>
                        <div className="w-full h-1 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(item.speed / 60) * 100}%` }}
                            className="h-full bg-cyan-500"
                          />
                        </div>
                      </div>
                      <div className="text-xs font-black tabular-nums text-cyan-400">{item.speed.toFixed(1)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </aside>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 4px;
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-popup-tip {
          background: #18181b !important;
        }
        .leaflet-container {
          font-family: inherit;
        }
        .custom-neon-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
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
          exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          <LandingPage onStart={() => setShowDashboard(true)} />
        </motion.div>
      ) : (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          className="h-screen"
        >
          <Dashboard />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
