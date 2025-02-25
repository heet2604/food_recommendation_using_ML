import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";

const Search = ({onAddFood}) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [result, setResult] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(100); // Default quantity 100g
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSearch = async () => {
    toast.info("Remember to select the food again after updating the quantity!");
    try {
      const formattedSearch = search.trim().toLowerCase();
      const response = await axios.post(
        "http://localhost:5000/api/analyze",
        { food: search },  // Fix: change "food_name" to "food" to match backend
        { headers: { "Content-Type": "application/json" } }
      );
  
      console.log("📜 API Response:", response.data);
  
      let foodData;
      if (response.data.nutritionData) {
        // If data comes from LLM
        foodData = response.data.nutritionData;
      } else {
        // If data comes from Excel sheet
        foodData = response.data;
      }
  
      setResult([
        {
          food_name: formattedSearch.replace(/\b\w/g, (char) => char.toUpperCase()),
          energy_kcal: foodData.calorie || 0,
          fibre_g: foodData.fiber || 0,
          fat_g: foodData.fat || 0,
          protein_g: foodData.protein || 0,
          carb_g: foodData.carb || 0
        }
      ]);
    } catch (err) {
      console.error("❌ API Error:", err.response?.data || err.message);
      toast.error("Failed to fetch food data. Check the backend logs.");
    }
  };
  

  // Add selected food to database
  const handleAddButton = async () => {
    if (!selectedFood) {
      toast.error("No food selected!");
      return;
    }
  
    const token = localStorage.getItem("token"); // Retrieve token from localStorage
    if (!token) {
      toast.error("Unauthorized! Please log in.");
      navigate("/login"); // Redirect to login if no token is found
      return;
    }
  
    const foodWithQuantity = {
      food_name: selectedFood.food_name,
      energy_kcal: ((selectedFood.energy_kcal * quantity) / 100).toFixed(2),
      fibre_g: ((selectedFood.fibre_g * quantity) / 100).toFixed(2),
      fat_g: ((selectedFood.fat_g * quantity) / 100).toFixed(2),
      protein_g: ((selectedFood.protein_g * quantity) / 100).toFixed(2),
      carb_g: ((selectedFood.carb_g * quantity) / 100).toFixed(2),
      quantity: quantity,
    };
  
    console.log("📤 Storing food data:", foodWithQuantity);
  
    try {
      const response = await axios.post(
        "http://localhost:5000/api/add-food",
        foodWithQuantity,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Send token in Authorization header
          },
        }
      );
  
      console.log("✅ Food added to database:", response.data);
      toast.success("✅ Food added successfully!");
  
      // Navigate to food_details after the food is added
      setTimeout(() => {
        navigate("/food_details",{state : {foodData : foodWithQuantity}});
      }, 1000);
    } catch (err) {
      console.error("❌ Error adding food to database:", err);
      toast.error("Failed to add food!");
    }
  };  
  
  
  return (
    <div className="bg-black min-h-screen text-white flex flex-col items-center p-4 w-full">
      {/* Navbar */}
      <nav className="w-full fixed top-0 left-0 bg-gray-800 px-6 py-4 flex justify-between items-center">
        <a href="/home" className="text-lg font-bold">Nourish</a>
        <div className="lg:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white focus:outline-none">☰</button>
        </div>
        <div className="hidden lg:flex flex-row items-center gap-8">
          <a href="/home" className="cursor-pointer hover:text-gray-400">Home</a>
          <a href="/food_details" className="cursor-pointer hover:text-gray-400">Food Details</a>
          <a href="/vitals" className="cursor-pointer hover:text-gray-400">Track Vitals</a>
          <a href="/premium" className="cursor-pointer hover:text-gray-400">Explore Premium</a>
          <span className="cursor-pointer hover:text-gray-400">Profile</span>
        </div>
      </nav>
      
      {isMenuOpen && (
        <div className="w-full bg-gray-800 px-6 py-4 flex flex-col items-center lg:hidden fixed top-16 left-0 z-50">
          <a href="/home" className="cursor-pointer hover:text-gray-400 py-2">Home</a>
          <a href="/food_details" className="cursor-pointer hover:text-gray-400 py-2">Food Details</a>
          <a href="/vitals" className="cursor-pointer hover:text-gray-400 py-2">Track Vitals</a>
          <a href="/premium" className="cursor-pointer hover:text-gray-400 py-2">Explore Premium</a>
          <a href="" className="cursor-pointer hover:text-gray-400 py-2">Profile</a>
        </div>
      )}

      <h1 className="text-2xl font-bold mt-20">Search Food for Nutritional Information (per 100g)</h1>
      
      <div className="flex items-center justify-center w-full max-w-md mt-10">
        <input
          type="text"
          placeholder="Search food"
          className="w-2/3 p-2 mr-2 text-black rounded"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 w-20" onClick={handleSearch}>
          Search
        </button>
      </div>

      {result.map((item, index) => (
        <div
          key={index}
          className={`bg-gray-700 p-5 rounded-lg shadow-lg w-96 text-center border-2 
          ${selectedFood?.food_name === item.food_name ? "border-yellow-500" : "border-green-500"} 
          mt-10 cursor-pointer`}
          onClick={() => {
            console.log("✅ Food selected:", item);
            setSelectedFood(item);
          }}
        >
          <h2 className="text-2xl font-bold text-green-400 mb-3">{item.food_name}</h2>

          <label className="block text-white mb-2">Quantity (g):</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-20 p-2 text-black rounded"
          />

          <p className="text-xl mb-2 bg-gray-800 p-3 w-3/4 rounded-md mx-auto mt-3">
            <strong>Calories:</strong> {((item.energy_kcal * quantity) / 100).toFixed(2)} kcal
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800 p-3 rounded-lg"><strong>Fiber:</strong> {((item.fibre_g * quantity) / 100).toFixed(2)} g</div>
            <div className="bg-gray-800 p-3 rounded-lg"><strong>Fats:</strong> {((item.fat_g * quantity) / 100).toFixed(2)} g</div>
            <div className="bg-gray-800 p-3 rounded-lg"><strong>Protein:</strong> {((item.protein_g * quantity) / 100).toFixed(2)} g</div>
            <div className="bg-gray-800 p-3 rounded-lg"><strong>Carbs:</strong> {((item.carb_g * quantity) / 100).toFixed(2)} g</div>
          </div>
        </div>
      ))}

      <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-900 w-20 mt-10" onClick={handleAddButton}>
        Add
      </button>

      <ToastContainer />
    </div>
  );
};

export default Search;
