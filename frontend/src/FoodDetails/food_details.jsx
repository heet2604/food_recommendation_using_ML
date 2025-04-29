import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { 
  Home as HomeIcon, 
  Coffee, 
  Activity, 
  Zap, 
  User 
} from "lucide-react";

function FoodDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [quantity, setQuantity] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [foodData, setFoodData] = useState({
    food_name: "Loading...",
    carb_g: 0,
    fat_g: 0,
    protein_g: 0,
    fibre_g: 0,
    energy_kcal: 0,
  });

  // Memoized function to prevent unnecessary re-renders
  const updatedValues = useCallback((value) => ((value / 100) * quantity).toFixed(2), [quantity]);

  const fetchFoodData = useCallback(async () => {
    try {
      setIsLoading(true);
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      let response;
      if (location.state && location.state.foodId) {
        response = await axios.get(`http://ec2-3-110-83-161.ap-south-1.compute.amazonaws.com/api/selected-food/${location.state.foodId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        response = await axios.get(`http://ec2-3-110-83-161.ap-south-1.compute.amazonaws.com/api/latest-food/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setFoodData(response.data);
      setQuantity(response.data.quantity || 100);
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to fetch food data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (location.state && location.state.foodData) {
      setFoodData(location.state.foodData);
      setQuantity(location.state.foodData.quantity || 100);
    } else {
      fetchFoodData();
    }
  }, [location.state, fetchFoodData]);

  const handleQuantityChange = (e) => {
    const value = Math.max(Number(e.target.value), 1);
    setQuantity(value);
  };

  const sendDataToDashboard = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      const nutritionalData = {
        energy_kcal: updatedValues(foodData.energy_kcal),
        protein_g: updatedValues(foodData.protein_g),
        carb_g: updatedValues(foodData.carb_g),
        fat_g: updatedValues(foodData.fat_g),
        fibre_g: updatedValues(foodData.fibre_g)
      };

      await axios.post(
        "http://ec2-3-110-83-161.ap-south-1.compute.amazonaws.com/api/add-food-to-dashboard",
        nutritionalData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast({
        title: "Success",
        description: "Food added to dashboard successfully!",
      });
      navigate("/home");
    } catch (error) {
      console.error("Error sending data to dashboard:", error);
      toast({
        title: "Error",
        description: "Failed to add food to dashboard. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Suggested foods data
  const suggestedFoods = [
    { emoji: "🥑", name: "Avocado" },
    { emoji: "🍓", name: "Strawberries" },
    { emoji: "🍗", name: "Chicken breast" },
    { emoji: "🥜", name: "Almonds" },
    { emoji: "🍞", name: "Whole Grain Bread" },
    { emoji: "🍣", name: "Salmon" }
  ];

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      {/* Navigation */}
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
            <a href="/food_details" className="nav-link flex items-center gap-2 text-green-500 font-medium">
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
            <a href="/home" className="py-2 px-4 rounded-lg hover:bg-gray-800 flex items-center gap-3 text-gray-300">
              <HomeIcon className="w-5 h-5" />
              <span>Home</span>
            </a>
            <a href="/food_details" className="py-2 px-4 rounded-lg bg-green-500/10 flex items-center gap-3 text-green-500">
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
        {/* <h1 className="text-2xl font-bold mb-8 text-center lg:text-left">Food Details</h1> */}
        
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Food Card */}
          <div className="md:w-1/3 flex flex-col space-y-6 animate-fade-in mt-28">
            <div className="bg-gray-900 rounded-xl p-6 border border-green-500/20 shadow-lg shadow-green-500/5 flex flex-col items-center">
              <div className="text-5xl mb-4">🍵</div>
              <h2 className="text-xl font-semibold mb-2">{foodData.food_name}</h2>
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              
              <div className="w-full mt-8">
                {/* <div className="flex items-center justify-between mb-4">
                  <label htmlFor="quantity" className="text-gray-300 font-medium">Quantity (g)</label>
                  <input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={handleQuantityChange}
                    className="bg-gray-800 border border-green-500/30 text-white p-2 rounded text-center w-24"
                  />
                </div> */}
              </div>
            </div>
          </div>
          
          {/* Nutritional Data */}
          <div className="md:w-2/3 bg-gray-900 rounded-xl p-6 border border-green-500/20 shadow-lg shadow-green-500/5 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <h2 className="text-xl font-semibold mb-6 text-center">Nutritional Information</h2>
            
            <div className="mb-6">
              <label htmlFor="calories" className="block text-gray-300 mb-2 font-medium">Calories (kcal)</label>
              <input
                id="calories"
                type="text"
                value={updatedValues(foodData.energy_kcal)}
                readOnly
                className="bg-gray-800 border border-green-500/30 text-white p-3 rounded text-center w-full"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              <div>
                <label htmlFor="protein" className="block text-gray-300 mb-2 font-medium">Protein (g)</label>
                <input
                  id="protein"
                  type="text"
                  value={updatedValues(foodData.protein_g)}
                  readOnly
                  className="bg-gray-800 border border-green-500/30 text-white p-3 rounded text-center w-full"
                />
              </div>
              <div>
                <label htmlFor="fats" className="block text-gray-300 mb-2 font-medium">Fats (g)</label>
                <input
                  id="fats"
                  type="text"
                  value={updatedValues(foodData.fat_g)}
                  readOnly
                  className="bg-gray-800 border border-green-500/30 text-white p-3 rounded text-center w-full"
                />
              </div>
              <div>
                <label htmlFor="carbs" className="block text-gray-300 mb-2 font-medium">Carbs (g)</label>
                <input
                  id="carbs"
                  type="text"
                  value={updatedValues(foodData.carb_g)}
                  readOnly
                  className="bg-gray-800 border border-green-500/30 text-white p-3 rounded text-center w-full"
                />
              </div>
              <div>
                <label htmlFor="fiber" className="block text-gray-300 mb-2 font-medium">Fiber (g)</label>
                <input
                  id="fiber"
                  type="text"
                  value={updatedValues(foodData.fibre_g)}
                  readOnly
                  className="bg-gray-800 border border-green-500/30 text-white p-3 rounded text-center w-full"
                />
              </div>
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={sendDataToDashboard}
                disabled={isLoading}
                className={`
                  bg-green-500 hover:bg-green-600 text-black font-medium px-6 py-3 rounded-lg transition-all duration-200 
                  hover:shadow-lg hover:shadow-green-500/20 inline-flex items-center gap-2
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isLoading ? 'Adding...' : 'Add to Dashboard'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Suggested Foods */}
        <div className="mt-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="bg-gray-900 rounded-xl p-6 border border-green-500/20 shadow-lg shadow-green-500/5">
            <h2 className="text-xl font-semibold mb-6">We suggest healthy foods like : </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {suggestedFoods.map((food, index) => (
                <div 
                  key={index} 
                  className="bg-gray-800 p-4 rounded-lg hover:bg-gray-700 transition-all duration-200 border border-green-500/10 hover:border-green-500/30 cursor-pointer"
                >
                  <button className="w-full text-left flex items-center gap-3">
                    <span className="text-2xl">{food.emoji}</span>
                    <span>{food.name}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Did You Know */}
        <div className="mt-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="bg-gray-900 p-6 rounded-xl border border-green-500/20 shadow-lg shadow-green-500/5">
            <h3 className="text-lg font-semibold mb-2">Did You Know?</h3>
            <p className="text-gray-300">
              Eating fiber-rich foods like oats and lentils can help maintain
              healthy digestion and keep you full for longer! 🧠💡
            </p>
          </div>
        </div>
        
        {/* Recommendations Button */}
        <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <button 
            className="bg-green-500 hover:bg-green-600 text-black font-medium px-8 py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20"
            onClick={() => navigate('/recommendations')}
          >
            Get More Recommendations
          </button>
        </div>
      </div>

      
    </div>
  );
}

export default FoodDetails;