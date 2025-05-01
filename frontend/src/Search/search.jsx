import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { 
  Home as HomeIcon, 
  Coffee, 
  Activity, 
  Zap, 
  User,
  Search as SearchIcon,
  X,
  Menu,
  Plus,
  // Info
} from "lucide-react";

const Search = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [result, setResult] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(100); // Default quantity 100g
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  //const [showMeasurements, setShowMeasurements] = useState(true);

  const handleSearch = async () => {
    if (!search.trim()) {
      toast({
        description: "Please enter a food to search",
        variant: "destructive"
      });
      return;
    }

    toast({
      description: "Remember to select the food after updating the quantity!",
    });
    
    try {
      setIsLoading(true);
      const formattedSearch = search.trim().toLowerCase();
      const response = await axios.post(
        "http://localhost:5000/api/analyze",
        { food: formattedSearch },
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
          carb_g: foodData.carb || 0,
          glycemic_index: foodData.glycemic_index ?? null,
        }
      ]);
    } catch (err) {
      console.error("❌ API Error:", err.response?.data || err.message);
      toast({
        title: "Error",
        description: "Failed to fetch food data. Check the backend logs.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddButton = async () => {
    if (!selectedFood) {
      toast({
        title: "Error",
        description: "No food selected!",
        variant: "destructive"
      });
      return;
    }
  
    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Unauthorized",
        description: "Please log in.",
        variant: "destructive"
      });
      navigate("/login");
      return;
    }
    
    setIsLoading(true);
    const foodWithQuantity = {
      userId: localStorage.getItem("userId"),
      food_name: selectedFood.food_name,
      energy_kcal: Number(((selectedFood.energy_kcal * quantity) / 100).toFixed(2)),
      fibre_g: Number(((selectedFood.fibre_g * quantity) / 100).toFixed(2)),
      fat_g: Number(((selectedFood.fat_g * quantity) / 100).toFixed(2)),
      protein_g: Number(((selectedFood.protein_g * quantity) / 100).toFixed(2)),
      carb_g: Number(((selectedFood.carb_g * quantity) / 100).toFixed(2)),
      glycemic_index: selectedFood.glycemic_index ?? null,
    };
  
    console.log("📤 Storing food data:", JSON.stringify(foodWithQuantity, null, 2));
  
    try {
      const response = await axios.post(
        "http://localhost:5000/api/add-food",
        foodWithQuantity,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );
  
      console.log("✅ Food added to database:", response.data);
      toast({
        title: "Success",
        description: "Food added successfully!",
        variant: "default"
      });
  
      setTimeout(() => {
        navigate("/food_details", { state: { foodData: foodWithQuantity } });
      }, 1000);
    } catch (err) {
      console.error("❌ Error adding food to database:", err.response ? err.response.data : err);
      
      if (err.response) {
        const errorMessage = err.response.data.details 
          ? err.response.data.details.join(', ') 
          : err.response.data.error || 'Failed to add food';
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      } else if (err.request) {
        toast({
          title: "Error",
          description: "No response received from server",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Error setting up the request",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="w-full bg-gray-900 px-6 py-4 border-b border-green-500/20 shadow-lg shadow-green-500/5 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="/" className="text-xl font-bold flex items-center gap-2">
            <span className="text-green-500">N</span>ourish
          </a>

          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <a href="/home" className="nav-link flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors">
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
            <a href="/search" className="nav-link flex items-center gap-2 text-green-500 font-medium">
              <SearchIcon className="w-4 h-4" />
              <span>Search</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-gray-900/95 backdrop-blur-sm border-b border-green-500/20 shadow-xl fixed w-full z-40">
          <div className="flex flex-col space-y-4 p-4">
            <a href="/" className="py-2 px-4 rounded-lg hover:bg-gray-800 flex items-center gap-3 text-gray-300">
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
            <a href="/search" className="py-2 px-4 rounded-lg bg-green-500/10 flex items-center gap-3 text-green-500">
              <SearchIcon className="w-5 h-5" />
              <span>Search</span>
            </a>
          </div>
        </div>
      )}

      {/* Standard Measurements Box
      {showMeasurements && (
        <div className="fixed top-20 right-4 z-30 max-w-xs bg-gray-900 rounded-lg p-4 border border-green-500/30 shadow-lg shadow-green-500/5">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <Info className="w-4 h-4 text-green-500 mr-2" />
              <h3 className="text-sm font-semibold text-green-500">Standard Measurements</h3>
            </div>
            <button 
              onClick={() => setShowMeasurements(false)} 
              className="text-gray-400 hover:text-white focus:outline-none"
              aria-label="Close measurements"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="text-xs space-y-1 text-gray-300">
            <p>1 katori rice = 150g</p>
            <p>1 katori dal = 150g</p>
            <p>1 katori sabzi = 150g</p>
            <p>1 roti = 35g</p>
          </div>
        </div>
      )} */}

      {/* Main Content */}
      <div className="flex-1 px-4 py-8 max-w-7xl mx-auto w-full">
        <h1 className="text-2xl font-bold mb-6 text-center lg:text-left">Food Search</h1>
        <p className="text-gray-400 mb-8 text-center lg:text-left">Search for foods to see their nutritional information and add them to your daily intake.</p>

        {/* {!showMeasurements && (
          <button 
            onClick={() => setShowMeasurements(true)}
            className="absolute top-20 right-4 bg-gray-900 text-green-500 hover:bg-gray-800 p-2 rounded-lg border border-green-500/30 focus:outline-none focus:ring-2 focus:ring-green-500/50"
            aria-label="Show measurements"
          >
            <Info className="w-5 h-5" />
          </button>
        )} */}

        <div className="flex flex-col items-center mb-10">
          <div className="w-full max-w-lg bg-gray-900 rounded-xl p-6 border border-green-500/20 shadow-lg shadow-green-500/5">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search for a food (e.g., apple, chicken, rice)"
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-500 transition-colors"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={isLoading}
                className="bg-green-500 hover:bg-green-600 text-black font-medium px-6 py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20 flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <SearchIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6 animate-fade-in">
          {result.map((item, index) => (
            <div 
              key={index}
              className={`bg-gray-900 rounded-xl p-6 border transition-all duration-300 cursor-pointer
                ${selectedFood?.food_name === item.food_name 
                  ? "border-green-500 shadow-lg shadow-green-500/10" 
                  : "border-green-500/20 hover:border-green-500/40"}`}
              onClick={() => {
                console.log("✅ Food selected:", item);
                setSelectedFood(item);
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="md:w-1/3">
                  <h2 className="text-xl font-semibold mb-3 text-center">{item.food_name}</h2>
                  
                  <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-gray-300">Quantity:</label>
                      <div className="flex items-center">
                        <input
                          type="number"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                          className="w-20 bg-gray-700 border border-gray-600 text-white px-3 py-1 rounded text-center focus:outline-none focus:border-green-500"
                        />
                        <span className="ml-2 text-gray-400">g</span>
                      </div>
                    </div>
                    
                    <div className="text-center p-3 bg-gray-700 rounded-lg">
                      <h3 className="text-sm text-gray-400 mb-1">Calories</h3>
                      <span className="text-xl font-bold">{((item.energy_kcal * quantity) / 100).toFixed(1)}</span>
                      <span className="text-gray-400 text-sm ml-1">kcal</span>
                    </div>
                  </div>
                </div>
                
                <div className="md:w-2/3 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Protein</span>
                        <div>
                          <span className="font-semibold">{((item.protein_g * quantity) / 100).toFixed(1)}</span>
                          <span className="text-gray-400 text-sm ml-1">g</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Carbs</span>
                        <div>
                          <span className="font-semibold">{((item.carb_g * quantity) / 100).toFixed(1)}</span>
                          <span className="text-gray-400 text-sm ml-1">g</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Fats</span>
                        <div>
                          <span className="font-semibold">{((item.fat_g * quantity) / 100).toFixed(1)}</span>
                          <span className="text-gray-400 text-sm ml-1">g</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Fiber</span>
                        <div>
                          <span className="font-semibold">{((item.fibre_g * quantity) / 100).toFixed(1)}</span>
                          <span className="text-gray-400 text-sm ml-1">g</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {item.glycemic_index !== null && (
                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Glycemic Index</span>
                        <span className="font-semibold">{item.glycemic_index}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedFood && (
          <div className="flex justify-center mt-8 mb-12">
            <button
              onClick={handleAddButton}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 text-black font-medium px-8 py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-green-500/20 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5" />
                  <span>Add to Daily Intake</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default Search;