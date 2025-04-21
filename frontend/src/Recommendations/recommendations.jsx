import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from 'axios';
import { Home as HomeIcon, User, Coffee, Zap, Activity } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeaf } from "@fortawesome/free-solid-svg-icons";

const Recommendations = () => {
  const [mealPlan, setMealPlan] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const generateMealPlan = async () => {
    setIsLoading(true);
    
    // Simulate API call (replace with actual API call when backend is ready)
    try {
      
      const response = await axios.post(
        "https://food-recommendation-using-ml.onrender.com/api/generate-meal-plan",
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black px-4 py-8 md:py-12">
      {/* Navbar */}
      <nav className="w-full bg-gray-900 px-6 border-b border-green-500/20 shadow-lg shadow-green-500/5 sticky top-0 z-50 mb-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="/home" className="text-xl font-bold flex items-center gap-2 text-white">
          <FontAwesomeIcon
                      icon={faLeaf}
                      className="text-green-400 text-3xl drop-shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse"
                    />
           Nourish
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
            <a href="/home" className="nav-link flex items-center gap-2 text-gray-400 font-medium">
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
              <>Generate Meal Plan</>
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
        
        
      </div>
      
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default Recommendations;