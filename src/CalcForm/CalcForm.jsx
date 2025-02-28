import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import confetti from "canvas-confetti";
import { useNavigate } from "react-router-dom";

function CalcForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    height: "",
    weight: "",
    activityLevel: "",
    age: "",
    gender: "male",
    userId: "user123",
    weightGoal: 0, // Default weight goal (0 means maintain weight)
  });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch("http://localhost:5000/api/calculateGoal", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(formData),
//       });

//       const data = await response.json();
//       if (data.success) {
//         console.log(data);
//         toast.success("Data saved successfully! 🎉", {
//           position: "top-right",
//           autoClose: 3000,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//           progress: undefined,
//         });

//         // Trigger confetti effect
//         confetti({
//           particleCount: 100,
//           spread: 70,
//           origin: { y: 0.6 },
//         });
//       } else {
//         toast.error("Error saving data. Please try again. 😢", {
//           position: "top-right",
//           autoClose: 3000,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//           progress: undefined,
//         });
//       }

//       setTimeout(() => {
//         navigate("/");
//       }, 4000);
//     } catch (error) {
//       console.error("Error:", error);
//       toast.error("Something went wrong. Please try again. 😢", {
//         position: "top-right",
//         autoClose: 3000,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         progress: undefined,
//       });
//     }
//   };




const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/calculate-goals", {
        method: "POST",
        headers: {
            "Authorization":`Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
  
      const text = await response.text(); // Log raw response
      console.log("Raw response:", text);
  
      try {
        const data = JSON.parse(text); // Convert to JSON
        console.log("Parsed JSON:", data);
  
        if (data.success) {
          toast.success("Data saved successfully! 🎉", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
  
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } else {
          toast.error("Error saving data. Please try again. 😢", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
        }
  
        setTimeout(() => {
          navigate("/home");
        }, 4000);
      } catch (jsonError) {
        console.error("JSON Parsing Error:", jsonError);
        console.error("Response received:", text); // Log full response
        toast.error("Invalid server response. Please try again.", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      toast.error("Something went wrong. Please try again. 😢", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };
  





  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSliderChange = (e) => {
    setFormData({ ...formData, weightGoal: parseFloat(e.target.value) });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <div className="bg-gray-900 rounded-lg shadow-2xl p-8 max-w-md w-full border-2 border-green-500 transform transition-transform hover:scale-105">
        <h1 className="text-3xl font-bold text-green-500 mb-6 text-center">
          Welcome to Nourish! 🌱
        </h1>
        <p className="text-gray-400 text-center mb-8">
          Let's get started by setting up your profile.
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Height */}
          <div className="relative">
            <label className="block text-gray-400 text-sm mb-2">Height (cm)</label>
            <input
              name="height"
              type="number"
              value={formData.height}
              onChange={handleChange}
              required
              className="w-full bg-gray-800 text-white rounded-lg py-3 px-4 border-2 border-green-500 focus:border-green-300 focus:outline-none transition-colors"
              placeholder="Enter your height"
            />
          </div>

          {/* Weight */}
          <div className="relative">
            <label className="block text-gray-400 text-sm mb-2">Weight (kg)</label>
            <input
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleChange}
              required
              className="w-full bg-gray-800 text-white rounded-lg py-3 px-4 border-2 border-green-500 focus:border-green-300 focus:outline-none transition-colors"
              placeholder="Enter your weight"
            />
          </div>

          {/* Activity Level */}
          <div className="relative">
            <label className="block text-gray-400 text-sm mb-2">Activity Level</label>
            <select
              name="activityLevel"
              value={formData.activityLevel}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white rounded-lg py-3 px-4 border-2 border-green-500 focus:border-green-300 focus:outline-none transition-colors"
            >
              <option value="1.2">Sedentary (Little to no exercise)</option>
              <option value="1.375">Lightly Active (1-3 days/week exercise)</option>
              <option value="1.55">Moderately Active (3-5 days/week exercise)</option>
              <option value="1.725">Very Active (6-7 days/week exercise)</option>
              <option value="1.9">Super Active (Athlete, intense training)</option>
            </select>
          </div>

          {/* Age */}
          <div className="relative">
            <label className="block text-gray-400 text-sm mb-2">Age</label>
            <input
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              required
              className="w-full bg-gray-800 text-white rounded-lg py-3 px-4 border-2 border-green-500 focus:border-green-300 focus:outline-none transition-colors"
              placeholder="Enter your age"
            />
          </div>

          {/* Gender */}
          <div className="relative">
            <label className="block text-gray-400 text-sm mb-2">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full bg-gray-800 text-white rounded-lg py-3 px-4 border-2 border-green-500 focus:border-green-300 focus:outline-none transition-colors"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Weight Goal Slider */}
          <div className="relative">
            <label className="block text-gray-400 text-sm mb-2">
              Weekly Weight Goal (kg/week)
            </label>
            <input
              name="weightGoal"
              type="range"
              min="-0.5"
              max="0.5"
              step="0.25"
              value={formData.weightGoal}
              onChange={handleSliderChange}
              className="w-full bg-gray-800 text-white rounded-lg py-3 px-4 border-2 border-green-500 focus:border-green-300 focus:outline-none transition-colors"
            />
            <div className="text-gray-400 text-sm mt-2">
              {formData.weightGoal === 0
                ? "Maintain Weight"
                : formData.weightGoal > 0
                ? `Gain ${formData.weightGoal} kg/week`
                : `Lose ${Math.abs(formData.weightGoal)} kg/week`}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-green-500 text-black font-bold py-3 px-4 rounded-lg hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-green-300 transition-colors"
          >
            Calculate My Goals 🚀
          </button>
        </form>
      </div>
    </div>
  );
}

export default CalcForm;