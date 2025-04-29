import React, { useState, useRef } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { Upload, FileImage, Loader2, CheckCircle, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeaf } from "@fortawesome/free-solid-svg-icons";

const FoodImage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [detectedFood, setDetectedFood] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [macros, setMacros] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Reset states
    setDetectedFood("");
    setMacros(null);

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Please select an image under 5MB.");
      return;
    }

    // Check file type
    if (!file.type.match("image.*")) {
      toast.error("Please select an image file.");
      return;
    }

    setSelectedImage(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const analyzeImage = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedImage);
  
      const response = await axios.post('http://ec2-3-110-83-161.ap-south-1.compute.amazonaws.com/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      setDetectedFood(response.data.detected_food);
      setMacros(response.data.macros);
      toast.success('Analysis complete!');
      
    } catch (error) {
      toast.error('Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper function to ensure values are handled correctly
  const updatedValues = (value) => {
    return value !== undefined ? value : 0;
  };

  const addToDashboard = async () => {
    if (!macros) {
      toast.warning("Please analyze an image first");
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      
      const nutritionalData = {
        energy_kcal: updatedValues(macros.calories),
        protein_g: updatedValues(macros.protein),
        carb_g: updatedValues(macros.carbs),
        fat_g: updatedValues(macros.fat),
        fibre_g: updatedValues(macros.fiber || 0) // Adding fiber with fallback
      };

      await axios.post(
        "http://ec2-3-110-83-161.ap-south-1.compute.amazonaws.com/api/add-food-to-dashboard",
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

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black px-4 py-8 md:py-12">
      {/* Navbar */}
      <nav className="w-full bg-gray-900 px-6 border-b border-green-500/20 shadow-lg shadow-green-500/5 sticky top-0 z-50 mb-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <a href="/home" className="text-xl font-bold flex items-center gap-2 text-white">
            <FontAwesomeIcon
              icon={faLeaf}
              className="text-green-400 text-3xl drop-shadow-md animate-pulse"
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
            <a href="/home" className="flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors">
              Home
            </a>
            <a href="/food_analyzer" className="flex items-center gap-2 text-green-400 font-medium">
              Food Analyzer
            </a>
            <a href="/food_details" className="flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors">
              Food Details
            </a>
            <a href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-green-500 transition-colors">
              Dashboard
            </a>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-gray-900/95 backdrop-blur-sm border-b border-green-500/20 shadow-xl fixed w-full z-40">
          <div className="flex flex-col space-y-4 p-4">
            <a href="/home" className="py-2 px-4 rounded-lg hover:bg-gray-800 flex items-center gap-3 text-gray-300">
              Home
            </a>
            <a href="/food_analyzer" className="py-2 px-4 rounded-lg bg-green-500/10 flex items-center gap-3 text-green-500">
              Food Analyzer
            </a>
            <a href="/food_details" className="py-2 px-4 rounded-lg hover:bg-gray-800 flex items-center gap-3 text-gray-300">
              Food Details
            </a>
            <a href="/dashboard" className="py-2 px-4 rounded-lg hover:bg-gray-800 flex items-center gap-3 text-gray-300">
              Dashboard
            </a>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl md:text-5xl font-bold text-green-400 mb-3">
            Food Image Analyzer
          </h1>
          <p className="text-gray-400 max-w-xl mx-auto">
            Upload an image of your food and we'll identify it and provide nutritional information.
          </p>
        </div>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
        />

        {/* Image Upload Area */}
        <div className="mb-8">
          <div 
            onClick={triggerFileInput}
            className={`border-2 border-dashed rounded-xl p-8 md:p-12 text-center cursor-pointer
                      transition-all duration-300 ${
                        previewUrl 
                          ? "border-green-400/30 bg-green-400/5" 
                          : "border-gray-600 hover:border-green-400/30 hover:bg-green-400/5"
                      }`}
          >
            {previewUrl ? (
              <div className="flex flex-col items-center">
                <div className="relative w-full max-w-md mx-auto mb-4">
                  <img
                    src={previewUrl}
                    alt="Food preview"
                    className="w-full h-auto rounded-lg shadow-lg max-h-64 object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewUrl(null);
                      setSelectedImage(null);
                      setDetectedFood("");
                      setMacros(null);
                    }}
                    className="absolute -top-3 -right-3 bg-gray-800 text-gray-300 p-1 rounded-full hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-gray-400 mb-2">Click to change image</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="mb-4 text-gray-400">
                  <FileImage className="w-12 h-12 mx-auto mb-2" />
                </div>
                <p className="text-lg text-gray-300 mb-2">Drag & drop your food image or click to browse</p>
                <p className="text-sm text-gray-500">Supported formats: JPG, PNG, WEBP (Max 5MB)</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center mb-12">
          <button
            onClick={analyzeImage}
            disabled={!selectedImage || isAnalyzing}
            className={`px-6 py-3 rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
              !selectedImage 
                ? "bg-gray-800 text-gray-500 cursor-not-allowed" 
                : "bg-black border border-green-400/20 text-green-400 hover:bg-green-400/10"
            }`}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Analyze Image
              </>
            )}
          </button>
        </div>

        {/* Results Display */}
        <div className="bg-black/30 backdrop-blur-md border border-green-400/20 rounded-xl shadow-xl p-6 md:p-8 mb-8">
          <h2 className="text-green-400 text-xl font-semibold mb-6">Analysis Results</h2>

          {detectedFood ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3 bg-green-400/10 p-4 rounded-lg">
                <CheckCircle className="text-green-400 w-6 h-6 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 font-medium">Detected Food:</p>
                  <p className="text-green-400 text-lg font-semibold">{detectedFood}</p>
                </div>
              </div>

              {macros ? (
                <div className="bg-black/50 p-4 rounded-lg">
                  <h3 className="text-gray-300 font-medium mb-3">Nutritional Information:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                      <p className="text-gray-400 text-sm">Calories</p>
                      <p className="text-green-400 text-lg font-medium">{macros.calories}</p>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                      <p className="text-gray-400 text-sm">Protein</p>
                      <p className="text-green-400 text-lg font-medium">{macros.protein}g</p>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                      <p className="text-gray-400 text-sm">Carbs</p>
                      <p className="text-green-400 text-lg font-medium">{macros.carbs}g</p>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                      <p className="text-gray-400 text-sm">Fat</p>
                      <p className="text-green-400 text-lg font-medium">{macros.fat}g</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4">
                  Nutritional data will appear here after analysis
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-400/5 mb-4">
                <svg className="w-8 h-8 text-green-400 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
              </div>
              <p className="text-gray-400">
                Upload an image and click analyze to identify your food
              </p>
            </div>
          )}

          {/* Add to Dashboard button */}
          {macros && (
            <div className="mt-6 pt-6 border-t border-green-400/10">
              <button
                onClick={addToDashboard}
                disabled={isLoading}
                className="w-full py-3 bg-green-500 text-black font-medium rounded-lg flex items-center justify-center gap-2 hover:bg-green-400 transition-colors shadow-lg shadow-green-500/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding to Dashboard...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-5 h-5" />
                    Add to Dashboard
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
      
      <ToastContainer position="bottom-right" />
    </div>
  );
};

export default FoodImage;