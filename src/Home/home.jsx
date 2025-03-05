// import React, { useState, useEffect } from "react";
// import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
// import "react-circular-progressbar/dist/styles.css";
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// export default function App() {
//   const navigate = useNavigate();

//   // State for fetched goals
//   const [dailyGoals, setDailyGoals] = useState({
//     dailyGoalCalories: 2600, // Default value
//     dailyGoalProtein: 100,
//     dailyGoalCarbs: 170,
//     dailyGoalFats: 80,
//     dailyGoalFiber: 15,
//   });

//   const [calories, setCalories] = useState(1800); // Current calories consumed
//   const [nutrients, setNutrients] = useState({
//     Protein: 60, // In grams
//     Fiber: 15,
//     Carbs: 170,
//     Fats: 20,
//   });

//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   // Fetch goals from the backend
//   useEffect(() => {
//     const fetchGoal = async () => {
//       try {
//         const response = await axios.get("http://localhost:5000/api/fetchGoal", {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`, // Send JWT if required
//           },
//         });

//         if (response.data.success) {
//           const { maintenanceCalories, dailyMacros } = response.data.userDetails;
//           setDailyGoals({
//             dailyGoalCalories: maintenanceCalories,
//             dailyGoalProtein: dailyMacros.protein,
//             dailyGoalCarbs: dailyMacros.carbs,
//             dailyGoalFats: dailyMacros.fats,
//             dailyGoalFiber: dailyMacros.fiber,
//           });
//         }
//         console.log("Fetched Goal Data:", response.data); // Log the response
//       } catch (err) {
//         console.error("Error fetching goal:", err);
//       }
//     };

//     fetchGoal();
//   }, []);

//   // Convert nutrients into data for the pie chart
//   const nutrientData = Object.entries(nutrients).map(([key, value]) => ({
//     name: key,
//     value,
//     maxValue: dailyGoals[`dailyGoal${key}`], // Dynamically get the max value for each nutrient
//   }));

//   // Calculate the percentage of calories consumed
//   const caloriePercentage = (calories / dailyGoals.dailyGoalCalories) * 100;

//   return (
//     <div className="bg-black text-white min-h-screen flex flex-col">
//       {/* Navbar */}
//       <nav className="w-full bg-gray-800 px-6 py-4 flex justify-between items-center">
//         <a href="/home" className="text-lg font-bold">Nourish</a>
//         <div className="lg:hidden">
//           <button
//             onClick={() => setIsMenuOpen(!isMenuOpen)}
//             className="text-white focus:outline-none"
//           >
//             ☰
//           </button>
//         </div>
//         <div className="hidden lg:flex flex-row items-center gap-8">
//           <a href="/home" className="cursor-pointer hover:text-gray-400">Home</a>
//           <a href="/food_details" className="cursor-pointer hover:text-gray-400">
//             Food Details
//           </a>
//           <a href="/vitals" className="cursor-pointer hover:text-gray-400">
//             Track Vitals
//           </a>
//           <a href="/premium" className="cursor-pointer hover:text-gray-400">
//             Explore Premium
//           </a>
//           <a href="/profile" className="cursor-pointer hover:text-gray-400">Profile</a>
//         </div>
//       </nav>

//       {isMenuOpen && (
//         <div className="w-full bg-gray-800 px-6 py-4 flex flex-col items-center lg:hidden fixed top-16 left-0 z-50">
//           <a href="/home" className="cursor-pointer hover:text-gray-400 py-2">Home</a>
//           <a href="/food_details" className="cursor-pointer hover:text-gray-400 py-2">
//             Food Details
//           </a>
//           <a href="/vitals" className="cursor-pointer hover:text-gray-400 py-2">
//             Track Vitals
//           </a>
//           <a href="" className="cursor-pointer hover:text-gray-400 py-2">
//             Explore Premium
//           </a>
//           <a href="/profile" className="cursor-pointer hover:text-gray-400 py-2">Profile</a>
//         </div>
//       )}

//       {/* Main Content */}
//       <div className="flex flex-1 flex-col lg:flex-row lg:items-start lg:justify-center p-4 gap-8">
//         {/* Left Section: Calories Tracker */}
//         <div className="flex flex-col items-center lg:items-start w-full lg:max-w-md mt-10 lg:mt-20">
//           {/* Calories Circular Progress Bar */}
//           <div className="w-40 h-40 mb-8 mx-auto">
//             <CircularProgressbar
//               value={caloriePercentage}
//               text={`${Math.round(caloriePercentage)}%`}
//               styles={buildStyles({
//                 textColor: "#fff",
//                 pathColor: calories > dailyGoals.dailyGoalCalories ? "#FF0000" : "#32CD32", // Red if exceeded
//                 trailColor: "#d6d6d6",
//               })}
//             />
//             <div className="text-center mt-2">
//               Calories: {calories} / {dailyGoals.dailyGoalCalories}
//             </div>
//           </div>
//           <br />
//           <br />

//           {/* Bar graphs for Nutrients */}
//           <div className="w-full flex flex-col items-center">
//             {nutrientData.map((nutrient, index) => (
//               <div key={index} className="w-full mb-4">
//                 <div className="flex justify-between text-sm mb-2">
//                   <span>{nutrient.name}</span>
//                   <span>
//                     {nutrient.value}g / {nutrient.maxValue}g
//                   </span>
//                 </div>
//                 <div className="w-full bg-gray-700 h-5 rounded-full relative overflow-hidden">
//                   <div
//                     className="h-5 rounded-full absolute top-0 left-0 transition-all duration-500"
//                     style={{
//                       width: `${(nutrient.value / nutrient.maxValue) * 100}%`,
//                       backgroundColor:
//                         nutrient.value > nutrient.maxValue ? "#FF0000" : "#32CD32", // Red if exceeded
//                     }}
//                   ></div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Add Food Item Button */}
//           <button
//             onClick={() => navigate("/search")}
//             className="bg-white text-black px-6 py-2 rounded-full font-semibold mx-auto mt-4"
//           >
//             Add Food Item
//           </button>
//         </div>

//         {/* Right Section: Tiles */}
//         <div className="flex flex-col flex-1 gap-6 mt-10 lg:mt-24">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
//             <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center">
//               <div className="text-4xl mb-2">📈</div>
//               <h2 className="text-sm font-semibold mb-2">Sugar Levels</h2>
//               <button onClick={() => navigate("/vitals")} className="bg-white text-black px-3 py-1 text-sm rounded-full">
//                 Add new Reading
//               </button>
//             </div>

//             <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center">
//               <div className="text-4xl mb-2">📅</div>
//               <h2 className="text-sm font-semibold mb-2">Body Weight</h2>
//               <button onClick={() => navigate("/vitals")} className="bg-white text-black px-3 py-1 text-sm rounded-full">
//                 Add new Reading
//               </button>
//             </div>

//             <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center">
//               <div className="text-4xl mb-2">🎯</div>
//               <h2 className="text-sm font-semibold mb-2">Recommendations</h2>
//               <button onClick={() => navigate("/food_details")} className="bg-white text-black px-3 py-1 text-sm rounded-full">
//                 Review
//               </button>
//             </div>

//             <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center">
//               <div className="text-4xl mb-2">😶‍🌫️</div>
//               <h2 className="text-sm font-semibold mb-2">Something else</h2>
//               <button className="bg-white text-black px-3 py-1 text-sm rounded-full">
//                 Button
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



// import React, { useState, useEffect } from "react";
// import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
// import "react-circular-progressbar/dist/styles.css";
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { Activity, Home as HomeIcon, User, Coffee, Zap, BarChart3, Scale, Target } from "lucide-react";

// export default function DashboardHome() {
//   const navigate = useNavigate();

//   // State for fetched goals
//   const [dailyGoals, setDailyGoals] = useState({
//     dailyGoalCalories: 2600, // Default value
//     dailyGoalProtein: 100,
//     dailyGoalCarbs: 170,
//     dailyGoalFats: 80,
//     dailyGoalFiber: 15,
//   });

//   const [calories, setCalories] = useState(0); // Current calories consumed
//   const [nutrients, setNutrients] = useState({
//     Protein: 0, // In grams
//     Fiber: 0,
//     Carbs: 0,
//     Fats: 0,
//   });

//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   // Fetch goals and dashboard data from the backend
//   const fetchData = async () => {
//     try {
//       // Fetch daily goals (limit of macros)
//       const goalResponse = await axios.get("http://localhost:5000/api/fetchGoal", {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });

//       if (goalResponse.data.success) {
//         const { maintenanceCalories, dailyMacros } = goalResponse.data.userDetails;
//         setDailyGoals({
//           dailyGoalCalories: maintenanceCalories,
//           dailyGoalProtein: dailyMacros.protein,
//           dailyGoalCarbs: dailyMacros.carbs,
//           dailyGoalFats: dailyMacros.fats,
//           dailyGoalFiber: dailyMacros.fiber,
//         });
//       }

//       // Fetch current intake
//       const dashboardResponse = await axios.get("http://localhost:5000/api/dashboard-data", {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("token")}`,
//         },
//       });

//       if (dashboardResponse.data.success) {
//         setCalories(dashboardResponse.data.calories);
//         setNutrients(dashboardResponse.data.nutrients);
//       }
//     } catch (err) {
//       console.error("Error fetching data:", err);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   // Convert nutrients into data for the pie chart
//   const nutrientData = Object.entries(nutrients).map(([key, value]) => ({
//     name: key,
//     value,
//     maxValue: dailyGoals[`dailyGoal${key}`], // Use the daily goals as maxValue
//   }));

//   // Calculate the percentage of calories consumed
//   const caloriePercentage = (calories / dailyGoals.dailyGoalCalories) * 100;

//   // Color handling function
//   const getProgressColor = (value, maxValue) => {
//     const percentage = (value / maxValue) * 100;
//     if (percentage > 100) return "#ef4444"; // Red
//     if (percentage > 85) return "#f97316"; // Orange
//     return "#22c55e"; // Green
//   };

//   // Add food to dashboard
//   const addFoodToDashboard = async (food) => {
//     try {
//       const response = await axios.post(
//         "http://localhost:5000/api/add-food-to-dashboard",
//         {
//           energy_kcal: food.calories,
//           protein_g: food.protein,
//           carb_g: food.carbs,
//           fat_g: food.fats,
//           fibre_g: food.fiber,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );

//       if (response.data.success) {
//         console.log("Food added to dashboard:", response.data.message);
//         // Fetch updated dashboard data
//         fetchData();
//       }
//     } catch (err) {
//       console.error("Error adding food to dashboard:", err);
//     }
//   };

//   return (
//     <div className="bg-black text-white min-h-screen flex flex-col">
//       {/* Navbar */}
//       <nav className="w-full bg-gray-900 px-6 py-4 border-b border-green-500/20 shadow-lg shadow-green-500/5 sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto flex justify-between items-center">
//           <a href="/home" className="text-xl font-bold flex items-center gap-2">
//             <span className="text-green-500">N</span>ourish
//           </a>
          
//           <div className="lg:hidden">
//             <button
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//               className="p-2 rounded-lg text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
//               aria-label="Toggle menu"
//             >
//               {isMenuOpen ? (
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               ) : (
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                 </svg>
//               )}
//             </button>
//           </div>
          
//           <div className="hidden lg:flex items-center gap-8">
//             <a href="/home" className="nav-link flex items-center gap-2 text-green-500 font-medium">
//               <HomeIcon className="w-4 h-4" />
//               <span>Home</span>
//             </a>
//             <a href="/food_details" className="nav-link flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors">
//               <Coffee className="w-4 h-4" />
//               <span>Food Details</span>
//             </a>
//             <a href="/vitals" className="nav-link flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors">
//               <Activity className="w-4 h-4" />
//               <span>Track Vitals</span>
//             </a>
//             <a href="/premium" className="nav-link flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors">
//               <Zap className="w-4 h-4" />
//               <span>Premium</span>
//             </a>
//             <a href="/profile" className="nav-link flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors">
//               <User className="w-4 h-4" />
//               <span>Profile</span>
//             </a>
//           </div>
//         </div>
//       </nav>

//       {/* Mobile Menu */}
//       {isMenuOpen && (
//         <div className="lg:hidden bg-gray-900/95 backdrop-blur-sm border-b border-green-500/20 shadow-xl fixed w-full z-40">
//           <div className="flex flex-col space-y-4 p-4">
//             <a href="/home" className="py-2 px-4 rounded-lg bg-green-500/10 flex items-center gap-3 text-green-500">
//               <HomeIcon className="w-5 h-5" />
//               <span>Home</span>
//             </a>
//             <a href="/food_details" className="py-2 px-4 rounded-lg hover:bg-gray-800 flex items-center gap-3 text-gray-300">
//               <Coffee className="w-5 h-5" />
//               <span>Food Details</span>
//             </a>
//             <a href="/vitals" className="py-2 px-4 rounded-lg hover:bg-gray-800 flex items-center gap-3 text-gray-300">
//               <Activity className="w-5 h-5" />
//               <span>Track Vitals</span>
//             </a>
//             <a href="/premium" className="py-2 px-4 rounded-lg hover:bg-gray-800 flex items-center gap-3 text-gray-300">
//               <Zap className="w-5 h-5" />
//               <span>Premium</span>
//             </a>
//             <a href="/profile" className="py-2 px-4 rounded-lg hover:bg-gray-800 flex items-center gap-3 text-gray-300">
//               <User className="w-5 h-5" />
//               <span>Profile</span>
//             </a>
//           </div>
//         </div>
//       )}

//       {/* Main Content */}
//       <div className="flex-1 px-4 py-8 max-w-7xl mx-auto w-full">
//         <h1 className="text-2xl font-bold mb-8 text-center lg:text-left">Today's Overview</h1>
        
//         <div className="flex flex-col lg:flex-row gap-10">
//           {/* Left Section: Calories & Nutrients Tracker */}
//           <div className="lg:w-2/5 space-y-8 animate-fade-in">
//             <div className="bg-gray-900 rounded-xl p-6 border border-green-500/20 shadow-lg shadow-green-500/5">
//               <h2 className="text-xl font-semibold mb-6 text-center">Daily Intake</h2>
              
//               {/* Calories Progress */}
//               <div className="flex items-center justify-center mb-8">
//                 <div className="w-44 h-44">
//                   <CircularProgressbar
//                     value={Math.min(caloriePercentage, 100)}
//                     text={`${Math.round(caloriePercentage)}%`}
//                     styles={buildStyles({
//                       textSize: '20px',
//                       textColor: "#fff",
//                       pathColor: getProgressColor(calories, dailyGoals.dailyGoalCalories),
//                       trailColor: "rgba(255, 255, 255, 0.1)",
//                       pathTransition: "stroke-dashoffset 0.5s ease 0s",
//                     })}
//                   />
//                 </div>
//               </div>
              
//               <div className="text-center mb-6">
//                 <h3 className="text-sm text-gray-400">Calories</h3>
//                 <div className="flex items-center justify-center gap-2 mt-1">
//                   <span className="text-2xl font-bold">{calories}</span>
//                   <span className="text-gray-500">/ {dailyGoals.dailyGoalCalories}</span>
//                 </div>
//               </div>
              
//               <div className="border-t border-gray-800 pt-6 space-y-4">
//                 {/* Nutrients Progress Bars */}
//                 {nutrientData.map((nutrient, index) => (
//                   <div key={index} className="space-y-2">
//                     <div className="flex justify-between text-sm">
//                       <span className="font-medium text-gray-300">{nutrient.name}</span>
//                       <span className="text-gray-400">
//                         <span className="font-medium">{nutrient.value}g</span> / {nutrient.maxValue}g
//                       </span>
//                     </div>
//                     <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
//                       <div
//                         className="h-full rounded-full transition-all duration-500"
//                         style={{
//                           width: `${Math.min((nutrient.value / nutrient.maxValue) * 100, 100)}%`,
//                           backgroundColor: getProgressColor(nutrient.value, nutrient.maxValue)
//                         }}
//                       ></div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
              
//               <div className="mt-8 text-center">
//                 <button
//                   onClick={() => navigate("/search")}
//                   className="bg-green-500 hover:bg-green-600 text-black font-medium px-6 py-2.5 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20 inline-flex items-center gap-2"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
//                   </svg>
//                   Add Food Item
//                 </button>
//               </div>
//             </div>
//           </div>
          
//           {/* Right Section: Health Tiles */}
//           <div className="lg:w-3/5">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
//               <div className="bg-gray-900 rounded-xl p-6 border border-green-500/20 shadow-lg shadow-green-500/5 flex flex-col items-center hover:border-green-500/40 transition-all duration-300">
//                 <div className="rounded-full bg-green-500/10 p-4 mb-4">
//                   <BarChart3 className="w-8 h-8 text-green-500" />
//                 </div>
//                 <h3 className="text-lg font-semibold mb-2">Sugar Levels</h3>
//                 <p className="text-gray-400 text-sm text-center mb-4">Track your blood glucose levels over time</p>
//                 <button onClick={() => navigate("/vitals")} className="mt-auto bg-transparent hover:bg-green-500/10 text-green-500 border border-green-500/50 font-medium px-4 py-2 rounded-lg transition-all duration-200">
//                   Add Reading
//                 </button>
//               </div>
              
//               <div className="bg-gray-900 rounded-xl p-6 border border-green-500/20 shadow-lg shadow-green-500/5 flex flex-col items-center hover:border-green-500/40 transition-all duration-300">
//                 <div className="rounded-full bg-green-500/10 p-4 mb-4">
//                   <Scale className="w-8 h-8 text-green-500" />
//                 </div>
//                 <h3 className="text-lg font-semibold mb-2">Body Weight</h3>
//                 <p className="text-gray-400 text-sm text-center mb-4">Log your weight to track progress over time</p>
//                 <button onClick={() => navigate("/vitals")} className="mt-auto bg-transparent hover:bg-green-500/10 text-green-500 border border-green-500/50 font-medium px-4 py-2 rounded-lg transition-all duration-200">
//                   Add Reading
//                 </button>
//               </div>
              
//               <div className="bg-gray-900 rounded-xl p-6 border border-green-500/20 shadow-lg shadow-green-500/5 flex flex-col items-center hover:border-green-500/40 transition-all duration-300">
//                 <div className="rounded-full bg-green-500/10 p-4 mb-4">
//                   <Target className="w-8 h-8 text-green-500" />
//                 </div>
//                 <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
//                 <p className="text-gray-400 text-sm text-center mb-4">Personalized nutrition tips based on your goals</p>
//                 <button onClick={() => navigate("/food_details")} className="mt-auto bg-transparent hover:bg-green-500/10 text-green-500 border border-green-500/50 font-medium px-4 py-2 rounded-lg transition-all duration-200">
//                   View Insights
//                 </button>
//               </div>
              
//               <div className="bg-gray-900 rounded-xl p-6 border border-green-500/20 shadow-lg shadow-green-500/5 flex flex-col items-center hover:border-green-500/40 transition-all duration-300">
//                 <div className="rounded-full bg-green-500/10 p-4 mb-4">
//                   <Activity className="w-8 h-8 text-green-500" />
//                 </div>
//                 <h3 className="text-lg font-semibold mb-2">Workout Tracker</h3>
//                 <p className="text-gray-400 text-sm text-center mb-4">Log your workouts and track your activity</p>
//                 <button className="mt-auto bg-transparent hover:bg-green-500/10 text-green-500 border border-green-500/50 font-medium px-4 py-2 rounded-lg transition-all duration-200">
//                   Coming Soon
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// } 

// import React, { useState, useEffect } from "react";
// import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
// import "react-circular-progressbar/dist/styles.css";
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// export default function App() {
//   const navigate = useNavigate();

//   // State for fetched goals
//   const [dailyGoals, setDailyGoals] = useState({
//     dailyGoalCalories: 2600, // Default value
//     dailyGoalProtein: 100,
//     dailyGoalCarbs: 170,
//     dailyGoalFats: 80,
//     dailyGoalFiber: 15,
//   });

//   const [calories, setCalories] = useState(1800); // Current calories consumed
//   const [nutrients, setNutrients] = useState({
//     Protein: 60, // In grams
//     Fiber: 15,
//     Carbs: 170,
//     Fats: 20,
//   });

//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   // Fetch goals from the backend
//   useEffect(() => {
//     const fetchGoal = async () => {
//       try {
//         const response = await axios.get("http://localhost:5000/api/fetchGoal", {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`, // Send JWT if required
//           },
//         });

//         if (response.data.success) {
//           const { maintenanceCalories, dailyMacros } = response.data.userDetails;
//           setDailyGoals({
//             dailyGoalCalories: maintenanceCalories,
//             dailyGoalProtein: dailyMacros.protein,
//             dailyGoalCarbs: dailyMacros.carbs,
//             dailyGoalFats: dailyMacros.fats,
//             dailyGoalFiber: dailyMacros.fiber,
//           });
//         }
//         console.log("Fetched Goal Data:", response.data); // Log the response
//       } catch (err) {
//         console.error("Error fetching goal:", err);
//       }
//     };

//     fetchGoal();
//   }, []);

//   // Convert nutrients into data for the pie chart
//   const nutrientData = Object.entries(nutrients).map(([key, value]) => ({
//     name: key,
//     value,
//     maxValue: dailyGoals[`dailyGoal${key}`], // Dynamically get the max value for each nutrient
//   }));

//   // Calculate the percentage of calories consumed
//   const caloriePercentage = (calories / dailyGoals.dailyGoalCalories) * 100;

//   return (
//     <div className="bg-black text-white min-h-screen flex flex-col">
//       {/* Navbar */}
//       <nav className="w-full bg-gray-800 px-6 py-4 flex justify-between items-center">
//         <a href="/home" className="text-lg font-bold">Nourish</a>
//         <div className="lg:hidden">
//           <button
//             onClick={() => setIsMenuOpen(!isMenuOpen)}
//             className="text-white focus:outline-none"
//           >
//             ☰
//           </button>
//         </div>
//         <div className="hidden lg:flex flex-row items-center gap-8">
//           <a href="/home" className="cursor-pointer hover:text-gray-400">Home</a>
//           <a href="/food_details" className="cursor-pointer hover:text-gray-400">
//             Food Details
//           </a>
//           <a href="/vitals" className="cursor-pointer hover:text-gray-400">
//             Track Vitals
//           </a>
//           <a href="/premium" className="cursor-pointer hover:text-gray-400">
//             Explore Premium
//           </a>
//           <a href="/profile" className="cursor-pointer hover:text-gray-400">Profile</a>
//         </div>
//       </nav>

//       {isMenuOpen && (
//         <div className="w-full bg-gray-800 px-6 py-4 flex flex-col items-center lg:hidden fixed top-16 left-0 z-50">
//           <a href="/home" className="cursor-pointer hover:text-gray-400 py-2">Home</a>
//           <a href="/food_details" className="cursor-pointer hover:text-gray-400 py-2">
//             Food Details
//           </a>
//           <a href="/vitals" className="cursor-pointer hover:text-gray-400 py-2">
//             Track Vitals
//           </a>
//           <a href="" className="cursor-pointer hover:text-gray-400 py-2">
//             Explore Premium
//           </a>
//           <a href="/profile" className="cursor-pointer hover:text-gray-400 py-2">Profile</a>
//         </div>
//       )}

//       {/* Main Content */}
//       <div className="flex flex-1 flex-col lg:flex-row lg:items-start lg:justify-center p-4 gap-8">
//         {/* Left Section: Calories Tracker */}
//         <div className="flex flex-col items-center lg:items-start w-full lg:max-w-md mt-10 lg:mt-20">
//           {/* Calories Circular Progress Bar */}
//           <div className="w-40 h-40 mb-8 mx-auto">
//             <CircularProgressbar
//               value={caloriePercentage}
//               text={`${Math.round(caloriePercentage)}%`}
//               styles={buildStyles({
//                 textColor: "#fff",
//                 pathColor: calories > dailyGoals.dailyGoalCalories ? "#FF0000" : "#32CD32", // Red if exceeded
//                 trailColor: "#d6d6d6",
//               })}
//             />
//             <div className="text-center mt-2">
//               Calories: {calories} / {dailyGoals.dailyGoalCalories}
//             </div>
//           </div>
//           <br />
//           <br />

//           {/* Bar graphs for Nutrients */}
//           <div className="w-full flex flex-col items-center">
//             {nutrientData.map((nutrient, index) => (
//               <div key={index} className="w-full mb-4">
//                 <div className="flex justify-between text-sm mb-2">
//                   <span>{nutrient.name}</span>
//                   <span>
//                     {nutrient.value}g / {nutrient.maxValue}g
//                   </span>
//                 </div>
//                 <div className="w-full bg-gray-700 h-5 rounded-full relative overflow-hidden">
//                   <div
//                     className="h-5 rounded-full absolute top-0 left-0 transition-all duration-500"
//                     style={{
//                       width: `${(nutrient.value / nutrient.maxValue) * 100}%`,
//                       backgroundColor:
//                         nutrient.value > nutrient.maxValue ? "#FF0000" : "#32CD32", // Red if exceeded
//                     }}
//                   ></div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Add Food Item Button */}
//           <button
//             onClick={() => navigate("/search")}
//             className="bg-white text-black px-6 py-2 rounded-full font-semibold mx-auto mt-4"
//           >
//             Add Food Item
//           </button>
//         </div>

//         {/* Right Section: Tiles */}
//         <div className="flex flex-col flex-1 gap-6 mt-10 lg:mt-24">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
//             <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center">
//               <div className="text-4xl mb-2">📈</div>
//               <h2 className="text-sm font-semibold mb-2">Sugar Levels</h2>
//               <button onClick={() => navigate("/vitals")} className="bg-white text-black px-3 py-1 text-sm rounded-full">
//                 Add new Reading
//               </button>
//             </div>

//             <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center">
//               <div className="text-4xl mb-2">📅</div>
//               <h2 className="text-sm font-semibold mb-2">Body Weight</h2>
//               <button onClick={() => navigate("/vitals")} className="bg-white text-black px-3 py-1 text-sm rounded-full">
//                 Add new Reading
//               </button>
//             </div>

//             <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center">
//               <div className="text-4xl mb-2">🎯</div>
//               <h2 className="text-sm font-semibold mb-2">Recommendations</h2>
//               <button onClick={() => navigate("/food_details")} className="bg-white text-black px-3 py-1 text-sm rounded-full">
//                 Review
//               </button>
//             </div>

//             <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center">
//               <div className="text-4xl mb-2">😶‍🌫️</div>
//               <h2 className="text-sm font-semibold mb-2">Something else</h2>
//               <button className="bg-white text-black px-3 py-1 text-sm rounded-full">
//                 Button
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// import React, { useState, useEffect } from "react";
// import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
// import "react-circular-progressbar/dist/styles.css";
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { Activity, Home as HomeIcon, User, Coffee, Zap, BarChart3, Scale, Target } from "lucide-react";

// export default function DashboardHome() {
//   const navigate = useNavigate();

//   // State for fetched goals
//   const [dailyGoals, setDailyGoals] = useState({
//     dailyGoalCalories: 2600, // Default value
//     dailyGoalProtein: 100,
//     dailyGoalCarbs: 170,
//     dailyGoalFats: 80,
//     dailyGoalFiber: 15,
//   });

//   const [calories, setCalories] = useState(0); // Current calories consumed
//   const [nutrients, setNutrients] = useState({
//     Protein: 0, // In grams
//     Fiber: 0,
//     Carbs: 0,
//     Fats: 0,
//   });

//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   // Fetch goals from the backend
//   useEffect(() => {
//     const fetchGoal = async () => {
//       try {
//         const response = await axios.get("http://localhost:5000/api/fetchGoal", {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`, // Send JWT if required
//           },
//         });

//         if (response.data.success) {
//           const { maintenanceCalories, dailyMacros } = response.data.userDetails;
//           setDailyGoals({
//             dailyGoalCalories: maintenanceCalories,
//             dailyGoalProtein: dailyMacros.protein,
//             dailyGoalCarbs: dailyMacros.carbs,
//             dailyGoalFats: dailyMacros.fats,
//             dailyGoalFiber: dailyMacros.fiber,
//           });
//         }
//         console.log("Fetched Goal Data:", response.data); // Log the response
//       } catch (err) {
//         console.error("Error fetching goal:", err);
//       }
//     };

//     const fetchDashboardData = async()=>{
//       try{
//         const response = await axios.get("http://localhost:5000/api/dashboard-data",{
//           headers : {
//             Authorization : `Bearer ${localStorage.getItem("token")}`,
//           },
//         });
//         if(response.data.success){
//           setCalories(response.data.calories);
//           setNutrients(response.data.nutrients);
//         }
//       }
//       catch(err){
//         console.error(err);
//       }
//     }
//     fetchGoal();
//     fetchDashboardData();
//   }, []);

//   // Convert nutrients into data for the pie chart
//   const nutrientData = Object.entries(nutrients).map(([key, value]) => ({
//     name: key,
//     value,
//     maxValue: dailyGoals[`dailyGoal${key}`], // Access dailyGoals dynamically
//   }));

//   // Calculate the percentage of calories consumed
//   const caloriePercentage = (calories / dailyGoals.dailyGoalCalories) * 100;

//   // Color handling function
//   const getProgressColor = (value, maxValue) => {
//     const percentage = (value / maxValue) * 100;
//     if (percentage > 100) return "#ef4444"; // Red
//     if (percentage > 85) return "#f97316"; // Orange
//     return "#22c55e"; // Green
//   };

//   return (
//     <div className="bg-black text-white min-h-screen flex flex-col">
//       {/* Navbar */}
//       <nav className="w-full bg-gray-900 px-6 py-4 border-b border-green-500/20 shadow-lg shadow-green-500/5 sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto flex justify-between items-center">
//           <a href="/home" className="text-xl font-bold flex items-center gap-2">
//             <span className="text-green-500">N</span>ourish
//           </a>
          
//           <div className="lg:hidden">
//             <button
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//               className="p-2 rounded-lg text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
//               aria-label="Toggle menu"
//             >
//               {isMenuOpen ? (
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                 </svg>
//               ) : (
//                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//                 </svg>
//               )}
//             </button>
//           </div>
          
//           <div className="hidden lg:flex items-center gap-8">
//             <a href="/home" className="nav-link flex items-center gap-2 text-green-500 font-medium">
//               <HomeIcon className="w-4 h-4" />
//               <span>Home</span>
//             </a>
//             <a href="/food_details" className="nav-link flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors">
//               <Coffee className="w-4 h-4" />
//               <span>Food Details</span>
//             </a>
//             <a href="/vitals" className="nav-link flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors">
//               <Activity className="w-4 h-4" />
//               <span>Track Vitals</span>
//             </a>
//             <a href="/premium" className="nav-link flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors">
//               <Zap className="w-4 h-4" />
//               <span>Premium</span>
//             </a>
//             <a href="/profile" className="nav-link flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors">
//               <User className="w-4 h-4" />
//               <span>Profile</span>
//             </a>
//           </div>
//         </div>
//       </nav>

//       {/* Mobile Menu */}
//       {isMenuOpen && (
//         <div className="lg:hidden bg-gray-900/95 backdrop-blur-sm border-b border-green-500/20 shadow-xl fixed w-full z-40">
//           <div className="flex flex-col space-y-4 p-4">
//             <a href="/home" className="py-2 px-4 rounded-lg bg-green-500/10 flex items-center gap-3 text-green-500">
//               <HomeIcon className="w-5 h-5" />
//               <span>Home</span>
//             </a>
//             <a href="/food_details" className="py-2 px-4 rounded-lg hover:bg-gray-800 flex items-center gap-3 text-gray-300">
//               <Coffee className="w-5 h-5" />
//               <span>Food Details</span>
//             </a>
//             <a href="/vitals" className="py-2 px-4 rounded-lg hover:bg-gray-800 flex items-center gap-3 text-gray-300">
//               <Activity className="w-5 h-5" />
//               <span>Track Vitals</span>
//             </a>
//             <a href="/premium" className="py-2 px-4 rounded-lg hover:bg-gray-800 flex items-center gap-3 text-gray-300">
//               <Zap className="w-5 h-5" />
//               <span>Premium</span>
//             </a>
//             <a href="/profile" className="py-2 px-4 rounded-lg hover:bg-gray-800 flex items-center gap-3 text-gray-300">
//               <User className="w-5 h-5" />
//               <span>Profile</span>
//             </a>
//           </div>
//         </div>
//       )}

//       {/* Main Content */}
//       <div className="flex-1 px-4 py-8 max-w-7xl mx-auto w-full">
//         <h1 className="text-2xl font-bold mb-8 text-center lg:text-left">Today's Overview</h1>
        
//         <div className="flex flex-col lg:flex-row gap-10">
//           {/* Left Section: Calories & Nutrients Tracker */}
//           <div className="lg:w-2/5 space-y-8 animate-fade-in">
//             <div className="bg-gray-900 rounded-xl p-6 border border-green-500/20 shadow-lg shadow-green-500/5">
//               <h2 className="text-xl font-semibold mb-6 text-center">Daily Intake</h2>
              
//               {/* Calories Progress */}
//               <div className="flex items-center justify-center mb-8">
//                 <div className="w-44 h-44">
//                   <CircularProgressbar
//                     value={Math.min(caloriePercentage, 100)}
//                     text={`${Math.round(caloriePercentage)}%`}
//                     styles={buildStyles({
//                       textSize: '20px',
//                       textColor: "#fff",
//                       pathColor: getProgressColor(calories, dailyGoals.dailyGoalCalories),
//                       trailColor: "rgba(255, 255, 255, 0.1)",
//                       pathTransition: "stroke-dashoffset 0.5s ease 0s",
//                     })}
//                   />
//                 </div>
//               </div>
              
//               <div className="text-center mb-6">
//                 <h3 className="text-sm text-gray-400">Calories</h3>
//                 <div className="flex items-center justify-center gap-2 mt-1">
//                   <span className="text-2xl font-bold">{calories}</span>
//                   <span className="text-gray-500">/ {dailyGoals.dailyGoalCalories}</span>
//                 </div>
//               </div>
              
//               <div className="border-t border-gray-800 pt-6 space-y-4">
//                 {nutrientData.map((nutrient, index) => (
//                   <div key={index} className="space-y-2">
//                     <div className="flex justify-between text-sm">
//                       <span className="font-medium text-gray-300">{nutrient.name}</span>
//                       <span className="text-gray-400">
//                         <span className="font-medium">{Math.round(nutrient.value)}g</span>
//                         <span className="text-gray-500"> / {nutrient.maxValue}g</span>
//                       </span>
//                     </div>
//                     <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
//                       <div
//                         className="h-full rounded-full transition-all duration-500"
//                         style={{
//                           width: `${Math.min((nutrient.value / nutrient.maxValue) * 100, 100)}%`,
//                           backgroundColor: getProgressColor(nutrient.value, nutrient.maxValue)
//                         }}
//                       ></div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
              
//               <div className="mt-8 text-center">
//                 <button
//                   onClick={() => navigate("/search")}
//                   className="bg-green-500 hover:bg-green-600 text-black font-medium px-6 py-2.5 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20 inline-flex items-center gap-2"
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
//                     <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
//                   </svg>
//                   Add Food Item
//                 </button>
//               </div>
//             </div>
//           </div>
          
//           {/* Right Section: Health Tiles */}
//           <div className="lg:w-3/5">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
//               <div className="bg-gray-900 rounded-xl p-6 border border-green-500/20 shadow-lg shadow-green-500/5 flex flex-col items-center hover:border-green-500/40 transition-all duration-300">
//                 <div className="rounded-full bg-green-500/10 p-4 mb-4">
//                   <BarChart3 className="w-8 h-8 text-green-500" />
//                 </div>
//                 <h3 className="text-lg font-semibold mb-2">Sugar Levels</h3>
//                 <p className="text-gray-400 text-sm text-center mb-4">Track your blood glucose levels over time</p>
//                 <button onClick={() => navigate("/vitals")} className="mt-auto bg-transparent hover:bg-green-500/10 text-green-500 border border-green-500/50 font-medium px-4 py-2 rounded-lg transition-all duration-200">
//                   Add Reading
//                 </button>
//               </div>
              
//               <div className="bg-gray-900 rounded-xl p-6 border border-green-500/20 shadow-lg shadow-green-500/5 flex flex-col items-center hover:border-green-500/40 transition-all duration-300">
//                 <div className="rounded-full bg-green-500/10 p-4 mb-4">
//                   <Scale className="w-8 h-8 text-green-500" />
//                 </div>
//                 <h3 className="text-lg font-semibold mb-2">Body Weight</h3>
//                 <p className="text-gray-400 text-sm text-center mb-4">Log your weight to track progress over time</p>
//                 <button onClick={() => navigate("/vitals")} className="mt-auto bg-transparent hover:bg-green-500/10 text-green-500 border border-green-500/50 font-medium px-4 py-2 rounded-lg transition-all duration-200">
//                   Add Reading
//                 </button>
//               </div>
              
//               <div className="bg-gray-900 rounded-xl p-6 border border-green-500/20 shadow-lg shadow-green-500/5 flex flex-col items-center hover:border-green-500/40 transition-all duration-300">
//                 <div className="rounded-full bg-green-500/10 p-4 mb-4">
//                   <Target className="w-8 h-8 text-green-500" />
//                 </div>
//                 <h3 className="text-lg font-semibold mb-2">Recommendations</h3>
//                 <p className="text-gray-400 text-sm text-center mb-4">Personalized nutrition tips based on your goals</p>
//                 <button onClick={() => navigate("/food_details")} className="mt-auto bg-transparent hover:bg-green-500/10 text-green-500 border border-green-500/50 font-medium px-4 py-2 rounded-lg transition-all duration-200">
//                   View Insights
//                 </button>
//               </div>
              
//               <div className="bg-gray-900 rounded-xl p-6 border border-green-500/20 shadow-lg shadow-green-500/5 flex flex-col items-center hover:border-green-500/40 transition-all duration-300">
//                 <div className="rounded-full bg-green-500/10 p-4 mb-4">
//                   <Activity className="w-8 h-8 text-green-500" />
//                 </div>
//                 <h3 className="text-lg font-semibold mb-2">Workout Tracker</h3>
//                 <p className="text-gray-400 text-sm text-center mb-4">Log your workouts and track your activity</p>
//                 <button className="mt-auto bg-transparent hover:bg-green-500/10 text-green-500 border border-green-500/50 font-medium px-4 py-2 rounded-lg transition-all duration-200">
//                   Coming Soon
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Activity, Home as HomeIcon, User, Coffee, Zap, BarChart3, Scale, Target } from "lucide-react";

export default function DashboardHome() {
  const navigate = useNavigate();

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

    const fetchDashboardData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/dashboard-data", {
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
                 <button onClick={() => navigate("/food_details")} className="mt-auto bg-transparent hover:bg-green-500/10 text-green-500 border border-green-500/50 font-medium px-4 py-2 rounded-lg transition-all duration-200">
                   View Insights
                 </button>
               </div>
              
               <div className="bg-gray-900 rounded-xl p-6 border border-green-500/20 shadow-lg shadow-green-500/5 flex flex-col items-center hover:border-green-500/40 transition-all duration-300">
                 <div className="rounded-full bg-green-500/10 p-4 mb-4">
                   <Activity className="w-8 h-8 text-green-500" />
                 </div>
                 <h3 className="text-lg font-semibold mb-2">Workout Tracker</h3>
                 <p className="text-gray-400 text-sm text-center mb-4">Log your workouts and track your activity</p>
                 <button className="mt-auto bg-transparent hover:bg-green-500/10 text-green-500 border border-green-500/50 font-medium px-4 py-2 rounded-lg transition-all duration-200">
                   Coming Soon
                 </button>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}