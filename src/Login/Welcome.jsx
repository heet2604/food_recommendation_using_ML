import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeaf } from "@fortawesome/free-solid-svg-icons";

const Welcome = () => {
  const navigate = useNavigate();

  const handleContinue = () => {
    // Navigate to the goal calculation form
    navigate("/calculateGoal");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black overflow-hidden">
      <div className="text-center p-8 bg-white bg-opacity-10 backdrop-blur-lg backdrop-filter border border-white border-opacity-20 shadow-xl rounded-2xl max-w-md w-full">
        <div className="flex justify-center items-center mb-6">
          <FontAwesomeIcon
            icon={faLeaf}
            className="text-green-400 text-4xl drop-shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse mr-3"
          />
          <h1 className="text-3xl font-semibold text-green-400">Nourish</h1>
        </div>
        
        <h2 className="text-2xl text-white mb-4">Welcome aboard!</h2>
        
        <p className="text-white text-opacity-80 mb-6">
          Let's get to know you better. We'll help you set up your personalized nutrition and fitness goals.
        </p>
        
        <button 
          onClick={handleContinue}
          className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
        >
          Set Up My Goals
        </button>
      </div>
    </div>
  );
};

export default Welcome;