import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from 'axios';
import { Home as HomeIcon, User, Coffee, Zap, Activity } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeaf } from "@fortawesome/free-solid-svg-icons";

const Recommendations = () => {
  const [foodItem, setFoodItem] = useState("");
  const [alternatives, setAlternatives] = useState([]); // <-- should be an array!
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const generateAlternatives = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5000/api/generate-meal-plan",
        { food  : foodItem }, // Match Flask's expected parameter name
        {
          headers: { 
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")?.trim()}` 
          }
        }
      );
      
      // Handle response format
      setAlternatives(
        response.data.recommended_suggestions || 
        response.data.alternative_suggestions || 
        []
      );
    } catch (error) {
      console.error({error:"Something is wrong"})
      toast.error("Something went wrong")
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
            HEALTHIER CHOICES
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-green-400 mb-3">
            Find Healthier Alternatives
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Discover nutritious substitutes for your favorite foods and elevate your diet with healthier options.
          </p>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 mb-12">
          <div className="w-full max-w-md">
            <input
              type="text"
              value={foodItem}
              onChange={(e) => setFoodItem(e.target.value)}
              placeholder="Enter a food item (e.g., pizza, ice cream, french fries)"
              className="w-full px-6 py-3 bg-black/50 border border-green-400/20 text-green-100 rounded-lg 
                       focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-transparent 
                       placeholder-gray-500 transition-all duration-300"
            />
          </div>
          <button 
            onClick={generateAlternatives} 
            disabled={isLoading}
            className="px-6 py-3 bg-black border border-green-400/20 text-green-400 rounded-lg shadow-lg 
                       hover:bg-green-400/10 transition-all duration-300 group relative overflow-hidden"
          >
            <span className="absolute inset-0 bg-green-400/10 w-full transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></span>
            <span className="relative flex items-center">
              {isLoading ? "Finding Alternatives..." : "Find Healthier Alternatives"}
            </span>
          </button>
        </div>
        <div className={`bg-black/30 backdrop-blur-md border border-green-400/20 rounded-xl shadow-xl p-6 md:p-8 
                        transition-all duration-300 ease-out ${alternatives.length ? 'opacity-100 transform translate-y-0' : 'opacity-80 transform translate-y-4'}`}>
          <h2 className="text-green-400 text-xl font-semibold mb-6">Healthier Alternatives</h2>
          {alternatives.length > 0 ? (
            <div className="space-y-4">
              {alternatives.map((item, idx) => (
                <div key={idx} className="p-4 bg-black/50 rounded-lg border border-green-400/20">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-green-400 font-medium text-lg">{item["Food Name"] || item.name}</h3>
                    <span className="text-sm px-2 py-1 bg-green-400/10 text-green-400 rounded">
                      {item.recommendation}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-gray-300">
                    <div>
                      <p className="text-sm">Calories</p>
                      <p className="font-medium">{item.Calories || item.calories}</p>
                    </div>
                    <div>
                      <p className="text-sm">Protein</p>
                      <p className="font-medium">{item.Protein || item.protein}g</p>
                    </div>
                    <div>
                      <p className="text-sm">Carbs</p>
                      <p className="font-medium">{item.Carbs || item.carbs}g</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-400/5 mb-4">
                <svg className="w-8 h-8 text-green-400 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <p className="text-gray-400">
                Enter a food item above and click the button to discover healthier alternatives
              </p>
            </div>
          )}
          {alternatives.length > 0 && (
            <div className="mt-6 pt-6 border-t border-green-400/10">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-400">Want different options?</span>
                <button
                  onClick={generateAlternatives}
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
