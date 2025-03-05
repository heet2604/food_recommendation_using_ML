import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format } from "date-fns";
import { toast } from "sonner";
import { Activity, Droplet, Scale, ChevronUp, ChevronDown, Home as HomeIcon, User, Coffee, Zap } from "lucide-react";

function Vitals() {
  const [sugarReading, setSugarReading] = useState(90);
  const [weightReading, setWeightReading] = useState(85);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sugarReadings, setSugarReadings] = useState([]);
  const [weightReadings, setWeightReadings] = useState([]);

  const fetchVitals = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/vitals", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const vitals = response.data.vitals;
      setSugarReadings(vitals.map(v => ({ value: v.sugarReading, timestamp: v.timestamp })));
      setWeightReadings(vitals.map(v => ({ value: v.weightReading, timestamp: v.timestamp })));
    } catch (error) {
      console.error("Error fetching vitals:", error);
      toast.error("Failed to fetch vitals");
    }
  };

  const addVitalsReading = async () => {
    try {
      await axios.post(
        "http://localhost:5000/api/vitals",
        { sugarReading, weightReading },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Vitals reading added successfully");
      
      // Update local state
      const newReading = { 
        value: weightReading, 
        timestamp: new Date().toISOString() 
      };
      setWeightReadings(prev => [newReading, ...prev]);

      const newSugarReading = { 
        value: sugarReading, 
        timestamp: new Date().toISOString() 
      };
      setSugarReadings(prev => [newSugarReading, ...prev]);
    } catch (error) {
      console.error("Error adding vitals:", error);
      toast.error("Failed to add vitals reading");
    }
  };

 

  useEffect(() => {
    fetchVitals();
  }, []);

  
  const sugarIncrement = () => setSugarReading((prev) => Math.max(prev + 1, 0));
  const sugarDecrement = () => setSugarReading((prev) => Math.max(prev - 1, 0));

  const weightIncrement = () => setWeightReading((prev) => Math.max(prev + 0.1, 0));
  const weightDecrement = () => setWeightReading((prev) => Math.max(prev - 0.1, 0));

  const addSugarReading = () => {
    setSugarReadings((prev) => [
      ...prev,
      { value: sugarReading, timestamp: new Date() },
    ]);
    toast.success("Blood sugar reading added successfully");
    addVitalsReading();
  };

  const addWeightReading = () => {
    setWeightReadings((prev) => [
      ...prev,
      { value: weightReading, timestamp: new Date() },
    ]);
    toast.success("Weight reading added successfully");
    addVitalsReading();
  };

  const BloodSugarGraphInline = ({ readings }) => {
    const data = readings.map((reading) => ({
      value: reading.value,
      time: format(new Date(reading.timestamp), "HH:mm"),
    }));

    return (
      <div className="w-full h-[350px]">
        {readings.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 border border-gray-800 rounded-lg bg-gray-900/50">
            <Droplet className="w-12 h-12 text-green-500 mb-3 opacity-60" />
            <p>No blood sugar readings yet.</p>
            <p className="text-sm mt-2">Add your first reading above to start tracking.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.5)" tickLine={false} axisLine={false} unit=" mg/dL" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(22, 22, 26, 0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#fff",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                }}
                labelStyle={{ color: "#aaa" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#00c4ff"
                strokeWidth={3}
                dot={{ fill: "#00c4ff", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 7, fill: "#fff", stroke: "#00c4ff", strokeWidth: 2 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  };

  const WeightGraph = ({ readings }) => {
    const data = readings.map((reading) => ({
      value: reading.value,
      time: format(new Date(reading.timestamp), "HH:mm"),
    }));

    return (
      <div className="w-full h-[350px]">
        {readings.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 border border-gray-800 rounded-lg bg-gray-900/50">
            <Scale className="w-12 h-12 text-green-500 mb-3 opacity-60" />
            <p>No weight readings yet.</p>
            <p className="text-sm mt-2">Add your first reading above to start tracking.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.5)" tickLine={false} axisLine={false} unit=" kg" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(22, 22, 26, 0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#fff",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                }}
                labelStyle={{ color: "#aaa" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#22c55e"
                strokeWidth={3}
                dot={{ fill: "#22c55e", r: 4, strokeWidth: 0 }}
                activeDot={{ r: 7, fill: "#fff", stroke: "#22c55e", strokeWidth: 2 }}
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      <nav className="w-full bg-gray-900 px-6 py-4 border-b border-green-500/20 shadow-lg shadow-green-500/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="/home" className="text-xl font-bold flex items-center gap-2">
            <span className="text-green-500">N</span>ourish
          </a>
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
          <div className="hidden lg:flex items-center gap-8">
            <a href="/home" className="nav-link flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors">
              <HomeIcon className="w-4 h-4" />
              <span>Home</span>
            </a>
            <a href="/food_details" className="nav-link flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors">
              <Coffee className="w-4 h-4" />
              <span>Food Details</span>
            </a>
            <a href="/vitals" className="nav-link flex items-center gap-2 text-green-500 font-medium">
              <Activity className="w-4 h-4" />
              <span>Track Vitals</span>
            </a>
            <a href="/premium" className="nav-link flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors">
              <Zap className="w-4 h-4" />
              <span>Premium</span>
            </a>
            <a href="/profile" className="nav-link flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors">
              <User className="w-4 h-4" />
              <span>Profile</span>
            </a>
          </div>
        </div>
      </nav>
      {isMenuOpen && (
        <div className="lg:hidden bg-gray-900/95 backdrop-blur-sm border-b border-green-500/20 shadow-xl fixed w-full z-40">
          <div className="flex flex-col space-y-4 p-4">
            <a href="/home" className="py-2 px-4 rounded-lg hover:bg-gray-800 flex items-center gap-3 text-gray-300">
              <HomeIcon className="w-5 h-5" />
              <span>Home</span>
            </a>
            <a href="/food_details" className="py-2 px-4 rounded-lg hover:bg-gray-800 flex items-center gap-3 text-gray-300">
              <Coffee className="w-5 h-5" />
              <span>Food Details</span>
            </a>
            <a href="/vitals" className="py-2 px-4 rounded-lg bg-green-500/10 flex items-center gap-3 text-green-500">
              <Activity className="w-5 h-5" />
              <span>Track Vitals</span>
            </a>
            <a href="/premium" className="py-2 px-4 rounded-lg hover:bg-gray-800 flex items-center gap-3 text-gray-300">
              <Zap className="w-5 h-5" />
              <span>Premium</span>
            </a>
            <a href="/profile" className="py-2 px-4 rounded-lg hover:bg-gray-800 flex items-center gap-3 text-gray-300">
              <User className="w-5 h-5" />
              <span>Profile</span>
            </a>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto w-full px-4 pt-10 pb-6">
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
          <Activity className="w-8 h-8 text-green-500" />
          <span>Track Your Vitals</span>
        </h1>
        <p className="text-gray-400 mt-2 max-w-2xl">
          Monitor your health metrics over time to better understand your body and make informed decisions.
        </p>
      </div>
      <div className="max-w-7xl mx-auto w-full px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-xl p-6 shadow-lg bg-gray-900/60 border border-gray-800 hover:border-green-500/20 transition-colors">
            <div className="flex items-center mb-5">
              <Droplet className="w-5 h-5 text-green-500 mr-2" />
              <h2 className="text-lg font-semibold">Blood Sugar Level</h2>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-white">{sugarReading}</span>
                <span className="text-gray-400 text-sm">mg/dL</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={sugarIncrement}
                    className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-green-600 transition-colors"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>
                  <button
                    onClick={sugarDecrement}
                    className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-green-600 transition-colors"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
                <input
                  type="number"
                  value={sugarReading}
                  onChange={(e) => setSugarReading(Number(e.target.value))}
                  className="bg-gray-800 border border-gray-700 text-white p-2 rounded-lg text-center w-20 h-16 text-xl"
                />
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={addSugarReading}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-3 rounded-lg hover:from-green-500 hover:to-green-400 transition-all duration-300 font-medium flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
              >
                <span>Add Reading</span>
              </button>
            </div>
          </div>
          <div className="rounded-xl p-6 shadow-lg bg-gray-900/60 border border-gray-800 hover:border-green-500/20 transition-colors">
            <div className="flex items-center mb-5">
              <Scale className="w-5 h-5 text-green-500 mr-2" />
              <h2 className="text-lg font-semibold">Body Weight</h2>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-white">{weightReading.toFixed(1)}</span>
                <span className="text-gray-400 text-sm">kg</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-2">
                  <button
                    onClick={weightIncrement}
                    className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-green-600 transition-colors"
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>
                  <button
                    onClick={weightDecrement}
                    className="w-10 h-10 rounded-full bg-gray-800 text-white flex items-center justify-center hover:bg-green-600 transition-colors"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
                <input
                  type="number"
                  value={weightReading.toFixed(1)}
                  onChange={(e) => setWeightReading(Number(e.target.value))}
                  className="bg-gray-800 border border-gray-700 text-white p-2 rounded-lg text-center w-20 h-16 text-xl"
                  step="0.1"
                />
              </div>
            </div>
            <div className="mt-6">
              <button
                onClick={addWeightReading}
                className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-3 rounded-lg hover:from-green-500 hover:to-green-400 transition-all duration-300 font-medium flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
              >
                <span>Add Reading</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto w-full px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl p-6 shadow-lg bg-gray-900/60 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Droplet className="w-5 h-5 text-blue-400 mr-2" />
                <h2 className="text-lg font-semibold">Blood Sugar History</h2>
              </div>
              <span className="text-xs px-3 py-1 bg-blue-400/10 text-blue-400 rounded-full">
                {sugarReadings.length} readings
              </span>
            </div>
            <BloodSugarGraphInline readings={sugarReadings} />
          </div>
          <div className="rounded-xl p-6 shadow-lg bg-gray-900/60 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <Scale className="w-5 h-5 text-green-400 mr-2" />
                <h2 className="text-lg font-semibold">Weight History</h2>
              </div>
              <span className="text-xs px-3 py-1 bg-green-400/10 text-green-400 rounded-full">
                {weightReadings.length} readings
              </span>
            </div>
            <WeightGraph readings={weightReadings} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Vitals;