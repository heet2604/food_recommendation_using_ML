import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLeaf } from "@fortawesome/free-solid-svg-icons";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      toast.error("Please enter both username and password");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("https://food-recommendation-using-ml.onrender.com/login", {
        username,
        password,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.userId);

      toast.success("Login successful!");

      // Determine navigation based on user details
      setTimeout(() => {
        if (!response.data.hasUserDetails) {
          // If no user details, first show welcome page
          navigate("/welcome");
        } else {
          // If user details exist, go to home
          navigate("/home");
        }
      }, 1500);

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || "Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

    return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full opacity-10 filter blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full opacity-10 filter blur-3xl"></div>
      </div>

      <div
        className={`mt-7 absolute top-10 left-1/2 transform -translate-x-1/2 transition-all duration-700 ease-out ${mounted ? "opacity-100" : "opacity-0 -translate-y-10"
          }`}
      >
        <div className="flex items-center relative">
          {/* Glowing Green FontAwesome Icon */}
          <FontAwesomeIcon
            icon={faLeaf}
            className="text-green-400 text-3xl drop-shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse"
          />

          {/* Glowing Green Text */}
          <h1
            className="ml-3 text-2xl font-semibold text-green-400 relative
        before:absolute before:-inset-1 before:bg-green-400 before:blur-lg before:opacity-50
        drop-shadow-[0_0_10px_rgba(34,197,94,0.8)] animate-pulse"
          >
            Nourish
          </h1>
        </div>
      </div>

      {/* Login container */}
      <div className={`relative z-10 transition-all duration-1000 ease-out ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`} style={{ transitionDelay: "200ms" }}>
        <div className="bg-white bg-opacity-10 backdrop-blur-lg backdrop-filter border border-white border-opacity-20 shadow-xl p-10 rounded-2xl w-[26rem] mx-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-light text-white tracking-wide">Login</h2>
            <p className="text-white text-opacity-70 mt-2 text-sm">
              Enter your credentials to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-white text-opacity-70" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full px-4 py-3 pl-12 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all duration-300 ease-in-out placeholder-white placeholder-opacity-60 text-white"
                required
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-white text-opacity-70" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-3 pl-12 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-xl focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all duration-300 ease-in-out placeholder-white placeholder-opacity-60 text-white"
                required
              />
              <div
                className="absolute inset-y-0 right-0 pr-4 flex items-center cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-white text-opacity-70" />
                ) : (
                  <Eye className="h-5 w-5 text-white text-opacity-70" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center text-white text-opacity-80">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 rounded bg-white bg-opacity-10 border-white border-opacity-30 focus:ring-0 focus:ring-offset-0"
                />
                <label htmlFor="remember" className="ml-2">Remember me</label>
              </div>
              {/* <a href="#" className="text-white text-opacity-80 hover:text-opacity-100 transition-opacity">
                Forgot password?
              </a> */}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 ${isLoading ? "opacity-80" : ""
                }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-white text-opacity-70 text-sm">
              Don't have an account?{" "}
              <a href="/signup" className="text-white hover:underline">
                Create account
              </a>
            </p>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;