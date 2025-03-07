// // src/pages/MealPlanner.js
// import React, { useState } from "react";
// import axios from "axios";
// import { Button, Container, Typography, Box, Paper } from "@mui/material";

// const Recommendations = () => {
//   const [mealPlan, setMealPlan] = useState("");

//   const generateMealPlan = async () => {
//     try {
//       const response = await axios.post(
//         "http://localhost:5000/api/generate-meal-plan",
//         {},
//         {
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")} `},
//         }
//       );
//       setMealPlan(response.data.mealPlan);
//     } catch (error) {
//       console.error("Error generating meal plan:", error);
//     }
//   };

//   return (
//     <Container>
//       <Typography variant="h4" gutterBottom sx={{ color: "#00ff00" }}>
//         Meal Planner
//       </Typography>
//       <Button variant="contained" color="primary" onClick={generateMealPlan}>
//         Generate Meal Plan
//       </Button>
//       <Box mt={4}>
//         <Paper sx={{ backgroundColor: "#121212", padding: 2 }}>
//           <Typography variant="h6" sx={{ color: "#00ff00" }}>
//             Your Meal Plan:
//           </Typography>
//           <pre style={{ color: "#ffffff" }}>{mealPlan}</pre>
//         </Paper>
//       </Box>
//     </Container>
//   );
// };

// export default Recommendations;

import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from 'axios';

const Recommendations = () => {
  const [mealPlan, setMealPlan] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateMealPlan = async () => {
    setIsLoading(true);
    
    // Simulate API call (replace with actual API call when backend is ready)
    try {
      
      const response = await axios.post(
        "http://localhost:5000/api/generate-meal-plan",
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")} `},
        }
      );
      setMealPlan(response.data.mealPlan);
    
    } catch (error) {
      console.error("Error generating meal plan:", error);
      setIsLoading(false);
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black px-4 py-8 md:py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-fadeIn">
          <span className="inline-block px-3 py-1 rounded-full bg-green-400/10 text-green-400 text-xs font-medium tracking-wider mb-4">
            PERSONALIZED NUTRITION
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-green-400 mb-3">
            Meal Planner
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Generate a personalized meal plan based on your preferences and nutritional needs.
          </p>
        </div>
        
        <div className="flex justify-center mb-12">
          <button 
            onClick={generateMealPlan} 
            disabled={isLoading}
            className="px-6 py-3 bg-black border border-green-400/20 text-green-400 rounded-lg shadow-lg 
                       hover:bg-green-400/10 transition-all duration-300 group relative overflow-hidden"
          >
            <span className="absolute inset-0 bg-green-400/10 w-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></span>
            <span className="relative flex items-center">
              {/* {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating...
                </> */}
              {/* ) : ( */}
                <>Generate Meal Plan</>
              {/* )} */}
            </span>
          </button>
        </div>
        
        <div className={`bg-black/30 backdrop-blur-md border border-green-400/20 rounded-xl shadow-xl p-6 md:p-8 
                        transition-all duration-300 ease-out ${mealPlan ? 'opacity-100 transform translate-y-0' : 'opacity-80 transform translate-y-4'}`}>
          <h2 className="text-green-400 text-xl font-semibold mb-6">Your Meal Plan</h2>
          
          {mealPlan ? (
            <pre className="text-gray-300 font-mono text-sm whitespace-pre-wrap bg-black/50 p-4 rounded-lg">{mealPlan}</pre>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-400/5 mb-4">
                <svg className="w-8 h-8 text-green-400 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <p className="text-gray-400">
                Click the button above to generate your personalized meal plan
              </p>
            </div>
          )}
          
          {mealPlan && (
            <div className="mt-6 pt-6 border-t border-green-400/10">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Need adjustments?</span>
                <button
                  onClick={generateMealPlan} 
                  className="px-4 py-2 border border-green-400/20 rounded-lg text-green-400 text-sm
                           hover:bg-green-400/10 transition-all"
                >
                  Regenerate
                </button>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-16 text-center text-xs text-gray-500">
          <p>Designed with precision and simplicity</p>
        </div>
      </div>
      
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default Recommendations;