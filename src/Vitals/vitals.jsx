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

function Vitals() {
  

  // State for current input readings
  const [sugarReading, setSugarReading] = useState(90);
  const [weightReading, setWeightReading] = useState(85);

  // Arrays to store the history of readings
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sugarReadings, setSugarReadings] = useState([]);
  const [weightReadings, setWeightReadings] = useState([]);

  // Fetch vitals from backend (if needed)
  // useEffect(() => {
  //   axios
  //     .get("http://localhost:3000/vitals")
  //     .then((response) => {
  //       console.log("Data fetched from backend:", response.data);
  //       // Optionally update state with fetched data here.
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching data:", error);
  //     });
  // }, []);






// Inside the Vitals component

// Fetch vitals from backend
useEffect(() => {
  axios
    .get("http://localhost:5000/api/vitals", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    })
    .then((response) => {
      const vitals = response.data.vitals;
      setSugarReadings(vitals.map(v => ({ value: v.sugarReading, timestamp: v.timestamp })));
      setWeightReadings(vitals.map(v => ({ value: v.weightReading, timestamp: v.timestamp })));
    })
    .catch((error) => {
      console.error("Error fetching vitals:", error);
    });
}, []);

// Add new vitals reading
const addVitalsReading = () => {
  axios
    .post(
      "http://localhost:5000/api/vitals",
      { sugarReading, weightReading },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    )
    .then((response) => {
      toast.success("Vitals reading added successfully");
      // Optionally refetch vitals or update state directly
    })
    .catch((error) => {
      console.error("Error adding vitals:", error);
      toast.error("Failed to add vitals reading");
    });
};



  // Increment/Decrement functions for blood sugar
  const sugarIncrement = () =>
    setSugarReading((prev) => Math.max(prev + 1, 0));
  const sugarDecrement = () =>
    setSugarReading((prev) => Math.max(prev - 1, 0));

  // Increment/Decrement functions for weight
  const weightIncrement = () =>
    setWeightReading((prev) => Math.max(prev + 1, 0));
  const weightDecrement = () =>
    setWeightReading((prev) => Math.max(prev - 1, 0));

  // Functions to add readings
  const addSugarReading = () => {
    setSugarReadings((prev) => [
      ...prev,
      { value: sugarReading, timestamp: new Date() },
    ]);
    toast.success("Blood sugar reading added successfully");
  };

  const addWeightReading = () => {
    setWeightReadings((prev) => [
      ...prev,
      { value: weightReading, timestamp: new Date() },
    ]);
    toast.success("Weight reading added successfully");
  };

  // Blood Sugar Graph defined inline in Vitals
  // const BloodSugarGraphInline = ({ readings }) => {
  //   const data = readings.map((reading) => ({
  //     value: reading.value,
  //     time: format(new Date(reading.timestamp), "HH:mm"),
  //   }));

  //   return (
  //     <div className="w-full h-[400px]">
  //       {readings.length === 0 ? (
  //         <div className="h-full flex items-center justify-center text-muted-foreground">
  //           No readings yet. Add your first reading above.
  //         </div>
  //       ) : (
  //         <ResponsiveContainer width="100%" height="100%">
  //           <LineChart data={data}>
  //             <CartesianGrid
  //               strokeDasharray="3 3"
  //               stroke="rgba(255,255,255,0.1)"
  //             />
  //             <XAxis
  //               dataKey="time"
  //               stroke="rgba(255,255,255,0.5)"
  //               tickLine={false}
  //               axisLine={false}
  //             />
  //             <YAxis
  //               stroke="rgba(255,255,255,0.5)"
  //               tickLine={false}
  //               axisLine={false}
  //               unit=" mg/dL"
  //             />
  //             <Tooltip
  //               contentStyle={{
  //                 backgroundColor: "rgba(0,0,0,0.8)",
  //                 border: "1px solid rgba(255,255,255,0.1)",
  //                 borderRadius: "8px",
  //                 color: "#fff",
  //               }}
  //             />
  //             <Line
  //               type="monotone"
  //               dataKey="value"
  //               stroke="hsl(var(--primary))"
  //               strokeWidth={2}
  //               dot={{ fill: "hsl(var(--primary))" }}
  //               animationDuration={1000}
  //             />
  //           </LineChart>
  //         </ResponsiveContainer>
  //       )}
  //     </div>
  //   );
  // };



  const BloodSugarGraphInline = ({ readings }) => {
    const data = readings.map((reading) => ({
      value: reading.value,
      time: format(new Date(reading.timestamp), "HH:mm"),
    }));
  
    return (
      <div className="w-full h-[400px]">
        {readings.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No readings yet. Add your first reading above.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.5)" tickLine={false} axisLine={false} />
              <YAxis stroke="rgba(255,255,255,0.5)" tickLine={false} axisLine={false} unit=" mg/dL" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#ff0000"   // Temporary red color for testing
                strokeWidth={2}
                dot={{ fill: "#ff0000" }}   // Temporary red color for testing
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  };
  

  // Weight Graph defined inline in Vitals
  const WeightGraph = ({ readings }) => {
    const data = readings.map((reading) => ({
      value: reading.value,
      time: format(new Date(reading.timestamp), "HH:mm"),
    }));

    return (
      <div className="w-full h-[400px]">
        {readings.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            No weight readings yet. Add your first reading above.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.1)"
              />
              <XAxis
                dataKey="time"
                stroke="rgba(255,255,255,0.5)"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="rgba(255,255,255,0.5)"
                tickLine={false}
                axisLine={false}
                unit=" kg"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ fill: "#22c55e" }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    );
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items--center p-4 w-full">
      {/* NAVBAR */}
      <nav className="w-full fixed top-0 left-0 bg-gray-800 px-6 py-4 flex justify-between items-center">
        <a href="/home" className="text-lg font-bold">Nourish</a>
        <div className="lg:hidden">
          <button onClick={()=>setIsMenuOpen(isMenuOpen)} className="text-white focus:outline-none">☰</button>
        </div>
        <div className="hidden lg:flex flex-row items-center gap-8">
          <a href="/home" className="cursor-pointer hover:text-gray-400">Home</a>
          <a href="/food_details" className="cursor-pointer hover:text-gray-400">Food Details</a>
          <a href="/vitals" className="cursor-pointer hover:text-gray-400">Track Vitals</a>
          <a href="/premium" className="cursor-pointer hover:text-gray-400">Explore Premium</a>
          <span className="cursor-pointer hover:text-gray-400">Profile</span>
        </div>
      </nav>
      {/* Vitals Controls */}
      <div className="flex flex-col md:flex-row gap-10 justify-center mt-20 p-5 items-center">
        {/* Blood Sugar Input */}
        <div className="rounded-lg w-96 text-center p-5 shadow-lg bg-gray-800 border border-white">
          <h2 className="mb-4 text-lg font-semibold">
            🩸 Blood Sugar Level (mg/dL)
          </h2>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={sugarDecrement}
              className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center"
            >
              -
            </button>
            <input
              type="number"
              value={sugarReading}
              onChange={(e) => setSugarReading(Number(e.target.value))}
              className="bg-transparent border border-white text-white p-2 rounded text-center w-20"
            />
            <button
              onClick={sugarIncrement}
              className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center"
            >
              +
            </button>
          </div>
          <button
            onClick={addSugarReading}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Add Reading
          </button>
        </div>

        {/* Weight Input */}
        <div className="rounded-lg w-96 text-center p-5 shadow-lg bg-gray-800 border border-white">
          <h2 className="mb-4 text-lg font-semibold">📈 Weight (kg)</h2>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={weightDecrement}
              className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center"
            >
              -
            </button>
            <input
              type="number"
              value={weightReading}
              onChange={(e) => setWeightReading(Number(e.target.value))}
              className="bg-transparent border border-white text-white p-2 rounded text-center w-20"
            />
            <button
              onClick={weightIncrement}
              className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center"
            >
              +
            </button>
          </div>
          <button
            onClick={addWeightReading}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            Add Reading
          </button>
        </div>
      </div>

      {/* Graphs Section */}
      <div className="w-full max-w-4xl mx-auto px-4 mt-8 space-y-6">
        {/* Blood Sugar Graph */}
        <div className="rounded-lg p-6 shadow-lg bg-gray-800 border border-white">
          <h2 className="text-lg font-semibold mb-4">
            Blood Sugar History 📅
          </h2>
          <BloodSugarGraphInline readings={sugarReadings} />
        </div>

        {/* Weight Graph */}
        <div className="rounded-lg p-6 shadow-lg bg-gray-800 border border-white">
          <h2 className="text-lg font-semibold mb-4">Weight History 📅</h2>
          <WeightGraph readings={weightReadings} />
        </div>
      </div>
    </div>
  );
}

export default Vitals;
