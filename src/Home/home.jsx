import React, { useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function App() {
  const navigate = useNavigate();

  // State for fetched goals
  const [dailyGoals, setDailyGoals] = useState({
    dailyGoalCalories: 2600, // Default value
    dailyGoalProtein: 100,
    dailyGoalCarbs: 170,
    dailyGoalFats: 80,
    dailyGoalFiber: 15,
  });

  const [calories, setCalories] = useState(1800); // Current calories consumed
  const [nutrients, setNutrients] = useState({
    Protein: 60, // In grams
    Fiber: 15,
    Carbs: 170,
    Fats: 20,
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Fetch goals from the backend
  useEffect(() => {
    const fetchGoal = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/fetchGoal", {
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

    fetchGoal();
  }, []);

  // Convert nutrients into data for the pie chart
  const nutrientData = Object.entries(nutrients).map(([key, value]) => ({
    name: key,
    value,
    maxValue: dailyGoals[`dailyGoal${key}`], // Dynamically get the max value for each nutrient
  }));

  // Calculate the percentage of calories consumed
  const caloriePercentage = (calories / dailyGoals.dailyGoalCalories) * 100;

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="w-full bg-gray-800 px-6 py-4 flex justify-between items-center">
        <a href="/home" className="text-lg font-bold">Nourish</a>
        <div className="lg:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white focus:outline-none"
          >
            ☰
          </button>
        </div>
        <div className="hidden lg:flex flex-row items-center gap-8">
          <a href="/home" className="cursor-pointer hover:text-gray-400">Home</a>
          <a href="/food_details" className="cursor-pointer hover:text-gray-400">
            Food Details
          </a>
          <a href="/vitals" className="cursor-pointer hover:text-gray-400">
            Track Vitals
          </a>
          <a href="/premium" className="cursor-pointer hover:text-gray-400">
            Explore Premium
          </a>
          <a href="/profile" className="cursor-pointer hover:text-gray-400">Profile</a>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="w-full bg-gray-800 px-6 py-4 flex flex-col items-center lg:hidden fixed top-16 left-0 z-50">
          <a href="/home" className="cursor-pointer hover:text-gray-400 py-2">Home</a>
          <a href="/food_details" className="cursor-pointer hover:text-gray-400 py-2">
            Food Details
          </a>
          <a href="/vitals" className="cursor-pointer hover:text-gray-400 py-2">
            Track Vitals
          </a>
          <a href="" className="cursor-pointer hover:text-gray-400 py-2">
            Explore Premium
          </a>
          <a href="/profile" className="cursor-pointer hover:text-gray-400 py-2">Profile</a>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:flex-row lg:items-start lg:justify-center p-4 gap-8">
        {/* Left Section: Calories Tracker */}
        <div className="flex flex-col items-center lg:items-start w-full lg:max-w-md mt-10 lg:mt-20">
          {/* Calories Circular Progress Bar */}
          <div className="w-40 h-40 mb-8 mx-auto">
            <CircularProgressbar
              value={caloriePercentage}
              text={`${Math.round(caloriePercentage)}%`}
              styles={buildStyles({
                textColor: "#fff",
                pathColor: calories > dailyGoals.dailyGoalCalories ? "#FF0000" : "#32CD32", // Red if exceeded
                trailColor: "#d6d6d6",
              })}
            />
            <div className="text-center mt-2">
              Calories: {calories} / {dailyGoals.dailyGoalCalories}
            </div>
          </div>
          <br />
          <br />

          {/* Bar graphs for Nutrients */}
          <div className="w-full flex flex-col items-center">
            {nutrientData.map((nutrient, index) => (
              <div key={index} className="w-full mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span>{nutrient.name}</span>
                  <span>
                    {nutrient.value}g / {nutrient.maxValue}g
                  </span>
                </div>
                <div className="w-full bg-gray-700 h-5 rounded-full relative overflow-hidden">
                  <div
                    className="h-5 rounded-full absolute top-0 left-0 transition-all duration-500"
                    style={{
                      width: `${(nutrient.value / nutrient.maxValue) * 100}%`,
                      backgroundColor:
                        nutrient.value > nutrient.maxValue ? "#FF0000" : "#32CD32", // Red if exceeded
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Food Item Button */}
          <button
            onClick={() => navigate("/search")}
            className="bg-white text-black px-6 py-2 rounded-full font-semibold mx-auto mt-4"
          >
            Add Food Item
          </button>
        </div>

        {/* Right Section: Tiles */}
        <div className="flex flex-col flex-1 gap-6 mt-10 lg:mt-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center">
              <div className="text-4xl mb-2">📈</div>
              <h2 className="text-sm font-semibold mb-2">Sugar Levels</h2>
              <button onClick={() => navigate("/vitals")} className="bg-white text-black px-3 py-1 text-sm rounded-full">
                Add new Reading
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center">
              <div className="text-4xl mb-2">📅</div>
              <h2 className="text-sm font-semibold mb-2">Body Weight</h2>
              <button onClick={() => navigate("/vitals")} className="bg-white text-black px-3 py-1 text-sm rounded-full">
                Add new Reading
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center">
              <div className="text-4xl mb-2">🎯</div>
              <h2 className="text-sm font-semibold mb-2">Recommendations</h2>
              <button onClick={() => navigate("/food_details")} className="bg-white text-black px-3 py-1 text-sm rounded-full">
                Review
              </button>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center">
              <div className="text-4xl mb-2">😶‍🌫️</div>
              <h2 className="text-sm font-semibold mb-2">Something else</h2>
              <button className="bg-white text-black px-3 py-1 text-sm rounded-full">
                Button
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}