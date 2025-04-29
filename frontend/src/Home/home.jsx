import React, { useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import { Activity, Home as HomeIcon, User, Coffee, Zap, BarChart3, Scale, Target, Droplet, FileText ,Camera} from "lucide-react";

export default function DashboardHome() {
  const navigate = useNavigate();

  const [waterGlasses, setWaterGlasses] = useState(0)
  const [waterGoal, setWaterGoal] = useState(8)
  const [isWaterModalOpen, setIsWaterModalOpen] = useState(false)
  const [tempGoal, setTempGoal] = useState(waterGoal);

  useEffect(() => {
    const storedWaterIntake = localStorage.getItem("dailyWaterIntake");
    const storedWaterGoal = localStorage.getItem("dailyWaterGoal");

    const today = new Date().toDateString();

    if (storedWaterIntake) {
      try {
        const { glasses, date } = JSON.parse(storedWaterIntake);

        if (date !== today) {
          setWaterGlasses(0); // Reset for a new day
          localStorage.removeItem("dailyWaterIntake");
        } else {
          setWaterGlasses(glasses);
        }
      } catch (error) {
        console.error("Error parsing dailyWaterIntake:", error);
        localStorage.removeItem("dailyWaterIntake"); // Remove invalid data
      }
    }

    if (storedWaterGoal) {
      try {
        setWaterGoal(JSON.parse(storedWaterGoal));
      } catch (error) {
        console.error("Error parsing dailyWaterGoal:", error);
        setWaterGoal(8); // Set a default goal if parsing fails
      }
    } else {
      setWaterGoal(8); // Default goal if not found
    }
  }, []);



  //Add water
  const addWaterGlass = () => {
    if (waterGlasses < 20) {
      const newWater = Math.min(20,waterGlasses+1)
      setWaterGlasses(newWater)
      const today = new Date().toDateString()
      localStorage.setItem("dailyWaterIntake",JSON.stringify({glasses : newWater,date:today}))
      toast({
        title: "Water Intake",
        description: "Glass of water added!"
      })
    }
    else{
      toast({description:"Take care of overhydration"})
    }
  }

  //remove water
  const removeWaterGlass = () => {
    const newWater = Math.max(0,waterGlasses-1)
      setWaterGlasses(newWater)
      const today = new Date().toDateString()
      localStorage.setItem("dailyWaterIntake",JSON.stringify({glasses : newWater,date:today}))
    toast({
      title: "Water Intake",
      description: "Glass of water removed!"
    })
  }

  //Handler to water goal
  const handleSetWaterGoal = (e) => {
    e.preventDefault(); // Prevent any default form submission
  
    // Ensure tempGoal is a valid number
    if (!tempGoal || isNaN(tempGoal) || tempGoal <= 0) {
      alert("Please enter a valid number greater than 0!");
      return;
    }
  
    setWaterGoal(tempGoal);
    setIsWaterModalOpen(false);
  };
  

  // State for fetched goals
  const [dailyGoals, setDailyGoals] = useState({
    dailyGoalCalories: 2600, // Default value
    dailyGoalProtein: 100,
    dailyGoalCarbs: 170,
    dailyGoalFats: 80,
    dailyGoalFiber: 15,
  });

  const [calories, setCalories] = useState(0); // Current calories consumed
  const [nutrients, setNutrients] = useState({
    Protein: 0, // In grams
    Fiber: 0,
    Carbs: 0,
    Fats: 0,
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fetch goals from the backend
  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const response = await axios.get("ec2-3-110-83-161.ap-south-1.compute.amazonaws.com/api/fetchGoal", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Send JWT if required
          },
        });

        if (response.data.success) {
          const { maintenanceCalories, dailyMacros } = response.data.userDetails;
          setDailyGoals({
            dailyGoalCalories: maintenanceCalories,
            dailyGoalProtein: dailyMacros.protein,
            dailyGoalCarbs: dailyMacros.carbs,
            dailyGoalFats: dailyMacros.fats,
            dailyGoalFiber: dailyMacros.fiber,
          });
        }
        console.log("Fetched Goal Data:", response.data); // Log the response
      } catch (err) {
        console.error("Error fetching goal:", err);
      }
    };

    const fetchDashboardData = async () => {
      try {
        const response = await axios.get("ec2-3-110-83-161.ap-south-1.compute.amazonaws.com/api/dashboard-data", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (response.data.success) {
          setCalories(response.data.calories);

          // Map backend keys to frontend keys
          setNutrients({
            Protein: response.data.nutrients.protein || 0,
            Carbs: response.data.nutrients.carbs || 0,
            Fats: response.data.nutrients.fats || 0,
            Fiber: response.data.nutrients.fiber || 0,
          });
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchGoal();
    fetchDashboardData();
  }, []);

  // Convert nutrients into data for the pie chart
  const nutrientData = [
    { name: "Protein", value: nutrients.Protein, maxValue: dailyGoals.dailyGoalProtein },
    { name: "Carbs", value: nutrients.Carbs, maxValue: dailyGoals.dailyGoalCarbs },
    { name: "Fats", value: nutrients.Fats, maxValue: dailyGoals.dailyGoalFats },
    { name: "Fiber", value: nutrients.Fiber, maxValue: dailyGoals.dailyGoalFiber },
  ];

  // Calculate the percentage of calories consumed
  const caloriePercentage = (calories / dailyGoals.dailyGoalCalories) * 100;

  // Color handling function
  const getProgressColor = (value, maxValue) => {
    const percentage = (value / maxValue) * 100;
    if (percentage > 100) return "#ef4444"; // Red
    if (percentage > 85) return "#f97316"; // Orange
    return "#22c55e"; // Green
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      {/* Navbar */}
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
            <a href="/home" className="nav-link flex items-center gap-2 text-green-500 font-medium">
              <HomeIcon className="w-4 h-4" />
              <span>Home</span>
            </a>
            <a href="/food_details" className="nav-link flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors">
              <Coffee className="w-4 h-4" />
              <span>Food Details</span>
            </a>
            <a href="/vitals" className="nav-link flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors">
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

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-gray-900/95 backdrop-blur-sm border-b border-green-500/20 shadow-xl fixed w-full z-40">
          <div className="flex flex-col space-y-4 p-4">
            <a href="/home" className="py-2 px-4 rounded-lg bg-green-500/10 flex items-center gap-3 text-green-500">
              <HomeIcon className="w-5 h-5" />
              <span>Home</span>
            </a>
            <a href="/food_details" className="py-2 px-4 rounded-lg hover:bg-gray-800 flex items-center gap-3 text-gray-300">
              <Coffee className="w-5 h-5" />
              <span>Food Details</span>
            </a>
            <a href="/vitals" className="py-2 px-4 rounded-lg hover:bg-gray-800 flex items-center gap-3 text-gray-300">
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

      {/* Main Content */}
      <div className="flex-1 px-4 py-8 max-w-7xl mx-auto w-full">

        {/* Water Tracking Section */}
        <div className="mb-8 bg-gray-900 rounded-xl p-6 border border-green-500/20 shadow-lg shadow-green-500/5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Droplet
            className={`h-6 w-6 ${waterGlasses >= waterGoal ? "text-green-500" : "text-blue-400"}`}
          />
          <h2 className="text-xl font-semibold">Water Intake</h2>
        </div>
        <button 
          onClick={() => setIsWaterModalOpen(true)} 
          className="text-green-500 hover:text-green-400 transition-colors"
        >
          Manage
        </button>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-bold">
            {waterGlasses} / {waterGoal}
          </div>
          <div className="text-gray-400 mt-1">Glasses of Water</div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={removeWaterGlass}
            className="bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700 w-10 h-10 flex items-center justify-center"
          >
            -
          </button>
          <button
            onClick={addWaterGlass}
            className="bg-green-500 text-black p-2 rounded-full hover:bg-green-600 w-10 h-10 flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>

      {/* Water Goal Modal */}
      {isWaterModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" 
          onClick={() => setIsWaterModalOpen(false)}
        >
          <div 
            className="bg-gray-800 p-6 rounded-lg shadow-lg w-80"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <h2 className="text-xl font-semibold mb-4">Set Water Goal</h2>
            <input
              type="number"
              className="bg-gray-700 text-white p-2 rounded w-full"
              placeholder="Enter goal (glasses)"
              value={tempGoal}
              onChange={(e) => setTempGoal(Number(e.target.value))}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button 
                onClick={() => setIsWaterModalOpen(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={handleSetWaterGoal}
                className="bg-green-500 text-black px-4 py-2 rounded hover:bg-green-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>


        <h1 className="text-2xl font-bold mb-8 text-center lg:text-left">Today's Overview</h1>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Section: Calories & Nutrients Tracker */}
          <div className="lg:w-2/5 space-y-8 animate-fade-in">
            <div className="bg-gray-900 rounded-xl p-6 border border-green-500/20 shadow-lg shadow-green-500/5">
              <h2 className="text-xl font-semibold mb-6 text-center">Daily Intake</h2>

              {/* Calories Progress */}
              <div className="flex items-center justify-center mb-8">
                <div className="w-44 h-44">
                  <CircularProgressbar
                    value={Math.min(caloriePercentage, 100)}
                    text={`${Math.round(caloriePercentage)}%`}
                    styles={buildStyles({
                      textSize: '20px',
                      textColor: "#fff",
                      pathColor: getProgressColor(calories, dailyGoals.dailyGoalCalories),
                      trailColor: "rgba(255, 255, 255, 0.1)",
                      pathTransition: "stroke-dashoffset 0.5s ease 0s",
                    })}
                  />
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-sm text-gray-400">Calories</h3>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <span className="text-2xl font-bold">{calories}</span>
                  <span className="text-gray-500">/ {dailyGoals.dailyGoalCalories}</span>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-6 space-y-4">
                {nutrientData.map((nutrient, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-300">{nutrient.name}</span>
                      <span className="text-gray-400">
                        <span className="font-medium">{Math.round(nutrient.value)}g</span>
                        <span className="text-gray-500"> / {nutrient.maxValue}g</span>
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min((nutrient.value / nutrient.maxValue) * 100, 100)}%`,
                          backgroundColor: getProgressColor(nutrient.value, nutrient.maxValue),
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <button
                  onClick={() => navigate("/search")}
                  className="bg-green-500 hover:bg-green-600 text-black font-medium px-6 py-2.5 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20 inline-flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Add Food Item
                </button>
              </div>
            </div>
          </div>

          {/* Right Section: Health Tiles */}
          <div className="lg:w-3/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              {/* Health Tiles */}
              {/* ... (same as your original code) ... */}
              <div className="bg-gray-900 rounded-xl p-6 border border-green-500/20 shadow-lg shadow-green-500/5 flex flex-col items-center hover:border-green-500/40 transition-all duration-300">
                <div className="rounded-full bg-green-500/10 p-4 mb-4">
                  <BarChart3 className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Sugar Levels</h3>
                <p className="text-gray-400 text-sm text-center mb-4">Track your blood glucose levels over time</p>
                <button onClick={() => navigate("/vitals")} className="mt-auto bg-transparent hover:bg-green-500/10 text-green-500 border border-green-500/50 font-medium px-4 py-2 rounded-lg transition-all duration-200">
                  Add Reading
                </button>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-green-500/20 shadow-lg shadow-green-500/5 flex flex-col items-center hover:border-green-500/40 transition-all duration-300">
                <div className="rounded-full bg-green-500/10 p-4 mb-4">                  <Scale className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Body Weight</h3>
                <p className="text-gray-400 text-sm text-center mb-4">Log your weight to track progress over time</p>
                <button onClick={() => navigate("/vitals")} className="mt-auto bg-transparent hover:bg-green-500/10 text-green-500 border border-green-500/50 font-medium px-4 py-2 rounded-lg transition-all duration-200">
                  Add Reading
                </button>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-green-500/20 shadow-lg shadow-green-500/5 flex flex-col items-center hover:border-green-500/40 transition-all duration-300">
                <div className="rounded-full bg-green-500/10 p-4 mb-4">
                  <Target className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
                <p className="text-gray-400 text-sm text-center mb-4">Personalized nutrition tips based on your goals</p>
                <button onClick={() => navigate("/recommendations")} className="mt-auto bg-transparent hover:bg-green-500/10 text-green-500 border border-green-500/50 font-medium px-4 py-2 rounded-lg transition-all duration-200">
                  View Insights
                </button>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-green-500/20 shadow-lg shadow-green-500/5 flex flex-col items-center hover:border-green-500/40 transition-all duration-300">
                <div className="rounded-full bg-green-500/10 p-4 mb-4">
                  <Activity className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Personalized Chatbot</h3>
                <p className="text-gray-400 text-sm text-center mb-4">Subscribe to Premium for access</p>
                <a href="https://wa.me/15551810144" className="mt-auto bg-transparent hover:bg-green-500/10 text-green-500 border border-green-500/50 font-medium px-4 py-2 rounded-lg transition-all duration-200">
                  Chat now
                </a>
              </div>

              <div className="bg-gray-900 rounded-xl p-6 border border-green-500/20 shadow-lg shadow-green-500/5 flex flex-col items-center hover:border-green-500/40 transition-all duration-300">
                <div className="rounded-full bg-green-500/10 p-4 mb-4">
                  <FileText className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Summarize Medical Reports</h3>
                <p className="text-gray-400 text-sm text-center mb-4">Provides a simple summary about your complex medical reports</p>
                <a href="/medical" className="mt-auto bg-transparent hover:bg-green-500/10 text-green-500 border border-green-500/50 font-medium px-4 py-2 rounded-lg transition-all duration-200">
                  Explore
                </a>
              </div>
              <div className="bg-gray-900 rounded-xl p-6 border border-green-500/20 shadow-lg shadow-green-500/5 flex flex-col items-center hover:border-green-500/40 transition-all duration-300">
                <div className="rounded-full bg-green-500/10 p-4 mb-4">
                  <Camera className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Food Image Detection</h3>
                <p className="text-gray-400 text-sm text-center mb-4">We get it, don't want to add manually ? We've got you!</p>
                <a href="/foodImage" className="mt-auto bg-transparent hover:bg-green-500/10 text-green-500 border border-green-500/50 font-medium px-4 py-2 rounded-lg transition-all duration-200">
                  Upload
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}