import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
        toast.error("Authentication required. Please log in.");
        navigate('/login');
        return;
      }

      let response;
      if (location.state && location.state.foodId) {
        response = await axios.get(`http://localhost:5000/api/selected-food/${location.state.foodId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        response = await axios.get(`http://localhost:5000/api/latest-food/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      setFoodData(response.data);
      setQuantity(response.data.quantity || 100);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch food data. Please try again.");
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
        "http://localhost:5000/api/add-food-to-dashboard",
        nutritionalData,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success("Food added to dashboard successfully!");
      navigate("/home");
    } catch (error) {
      console.error("Error sending data to dashboard:", error);
      toast.error("Failed to add food to dashboard. Please try again.");
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
      <nav className="w-full bg-gray-900 px-6 py-4 border-b border-green-500/20 shadow-lg shadow-green-500/5 sticky top-0 z-50 flex justify-between items-center">
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
      <div className="flex flex-col md:flex-row gap-6 items-center justify-center p-5">
        <div className="bg-gray-700 p-5 rounded-lg text-center shadow-lg w-80 h-44 border-2 border-white">
          <h1 className="text-2xl font-bold text-green-400">🍵</h1>
          <h2 className="mt-3 text-2xl">{foodData.food_name}</h2>
          <p className="mt-4 bg-green-400 h-3 w-3 rounded-full mx-auto"></p>
        </div>

        <div className="rounded-lg outline text-white w-96 text-center p-5 mt-5 shadow-lg bg-gray-800 max-w-xs">
          <div className="flex items-center justify-center gap-3">
            <label htmlFor="quantity">Quantity(g)</label>
            <input
              id="quantity"
              type="number"
              placeholder="Quantity"
              value={quantity}
              onChange={handleQuantityChange}
              className="bg-transparent border border-white text-white p-2 rounded text-center w-1/2"
            />
          </div>

          <div className="mt-4">
            <label htmlFor="calories">Calories(kcal)</label>
            <input
              id="calories"
              type="number"
              placeholder="Calories (kcal)"
              value={updatedValues(foodData.energy_kcal)}
              readOnly
              className="bg-transparent border border-white text-white p-2 rounded text-center w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <div>
              <label htmlFor="protein">Protein(g)</label>
              <input
                id="protein"
                type="number"
                placeholder="Protein (g)"
                value={updatedValues(foodData.protein_g)}
                readOnly
                className="bg-transparent border border-white text-white p-2 rounded text-center w-full"
              />
            </div>
            <div>
              <label htmlFor="fats">Fats(g)</label>
              <input
                id="fats"
                type="number"
                placeholder="Fats (g)"
                value={updatedValues(foodData.fat_g)}
                readOnly
                className="bg-transparent border border-white text-white p-2 rounded text-center w-full"
              />
            </div>
            <div>
              <label htmlFor="carbs">Carbs(g)</label>
              <input
                id="carbs"
                type="number"
                placeholder="Carbs (g)"
                value={updatedValues(foodData.carb_g)}
                readOnly
                className="bg-transparent border border-white text-white p-2 rounded text-center w-full"
              />
            </div>
            <div>
              <label htmlFor="fiber">Fiber(g)</label>
              <input
                id="fiber"
                type="number"
                placeholder="Fiber (g)"
                value={updatedValues(foodData.fibre_g)}
                readOnly
                className="bg-transparent border border-white text-white p-2 rounded text-center w-full"
              />
            </div>
          </div>

          <button
            onClick={sendDataToDashboard}
            disabled={isLoading}
            className={`
              bg-green-500 text-white py-2 px-4 rounded-lg mt-4 
              hover:bg-green-700 transition
              ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {isLoading ? 'Adding...' : 'Add to Dashboard'}
          </button>
        </div>
      </div>

      <div className="mt-8 text-center px-6">
        <button 
          className="bg-green-500 text-white py-3 px-6 rounded-lg text-lg hover:bg-green-700 transition"
          onClick={() => navigate('/search')}
        >
          Get More Recommendations
        </button>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Suggested Foods</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {suggestedFoods.map((food, index) => (
              <div 
                key={index} 
                className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition"
                onClick={() => {/* Navigate to food details or perform action */}}
              >
                <button className="w-full text-left">
                  {food.emoji} {food.name}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 bg-gray-800 p-6 rounded-lg shadow-lg w-full mx-auto text-center">
          <h3 className="text-lg font-bold">Did You Know?</h3>
          <p className="mt-2 text-gray-300">
            Eating fiber-rich foods like oats and lentils can help maintain
            healthy digestion and keep you full for longer! 🧠💡
          </p>
        </div>
      </div>

      {/* Toast Container for notifications */}
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
        theme="dark"
      />
    </div>
  );
}

export default FoodDetails;