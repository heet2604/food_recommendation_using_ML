import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Home, LogOut, Leaf, Heart, Apple, Droplets, Wind, Scale, Salad } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";

const ProfilePage = () => {
  const navigate = useNavigate();
    const [user, setUser] = useState({
        firstname: "",
        lastname: "",
        email: "",
        contact: "",
    });

    const [isEditing, setIsEditing] = useState(false);

    // Fetch user data on mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token")
                const response = await axios.get("http://localhost:5000/profile", {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true,
                });
                setUser(response.data);
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };
        fetchUserData();
    }, []);

    // Update local state when input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "contact" && !/^[0-9-]+$/.test(value)) return;
        setUser((prev) => ({ ...prev, [name]: value }));
    };

    // Save changes
    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token")
            const updatedProfile = {
                firstname: user.firstname,
                lastname: user.lastname,
                contact: user.contact
            }
            await axios.put("http://localhost:5000/profile", updatedProfile, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
            });
            setIsEditing(false);
            toast.success("Profile updated !")
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    };

    // Logout user
    const handleLogout = () => {
        localStorage.removeItem("token"); // Clear token
        navigate("/login"); // Redirect to login page
    };

    const handleHomeClick = () => {
        navigate("/home")
    }

    // Get user initials for the avatar
    const getUserInitials = () => {
        const firstInitial = user.firstname ? user.firstname.charAt(0).toUpperCase() : "";
        const lastInitial = user.lastname ? user.lastname.charAt(0).toUpperCase() : "";
        return firstInitial + lastInitial;
    };

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { 
                duration: 0.6,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { 
            opacity: 1, 
            y: 0,
            transition: { duration: 0.4 }
        }
    };

    const avatarVariants = {
        initial: { scale: 0 },
        animate: { 
            scale: 1,
            transition: { 
                type: "spring", 
                stiffness: 260, 
                damping: 20,
                delay: 0.3
            }
        }
    };

    const buttonVariants = {
        hover: { 
            scale: 1.05,
            transition: { duration: 0.2 }
        },
        tap: { scale: 0.95 }
    };
  // ... keep existing code (user state, isEditing state, useEffect for fetchUserData, handleChange, handleSave, handleLogout, handleHomeClick, getUserInitials)

  // ... keep existing code (animation variants: containerVariants, itemVariants, buttonVariants, avatarVariants)

  const svgVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.3,
      } 
    }
  };

  const pathVariants = {
    hidden: { opacity: 0, pathLength: 0 },
    visible: { 
      opacity: 1, 
      pathLength: 1,
      transition: { 
        duration: 1.5,
        ease: "easeInOut"
      }
    }
  };

  const floatVariants = {
    initial: { y: 0 },
    animate: { 
      y: [-10, 10, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const pulseVariants = {
    initial: { scale: 1 },
    animate: { 
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const rotateVariants = {
    initial: { rotate: 0 },
    animate: { 
      rotate: 360,
      transition: {
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }
    }
  };

  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-start p-6 relative overflow-hidden">
      {/* Left side SVG decorations */}
      <motion.div 
        className="absolute left-0 top-0 h-full w-1/3 opacity-70 pointer-events-none"
        initial="hidden"
        animate="visible"
        variants={svgVariants}
      >
        {/* Green nutrition path */}
        <motion.div 
          className="absolute left-10 top-1/4"
          variants={floatVariants}
          initial="initial"
          animate="animate"
        >
          <svg width="120" height="120" viewBox="0 0 120 120">
            <motion.circle cx="60" cy="60" r="55" stroke="#22c55e" strokeWidth="2" fill="none" variants={pathVariants} />
            <motion.path 
              d="M30,60 Q60,20 90,60 Q60,100 30,60" 
              stroke="#22c55e" 
              strokeWidth="2" 
              fill="none"
              variants={pathVariants}
            />
            <motion.circle cx="60" cy="40" r="8" fill="#22c55e" variants={pulseVariants} initial="initial" animate="animate" />
            <motion.circle cx="40" cy="70" r="5" fill="#16a34a" variants={pulseVariants} initial="initial" animate="animate" />
            <motion.circle cx="80" cy="70" r="5" fill="#16a34a" variants={pulseVariants} initial="initial" animate="animate" />
          </svg>
        </motion.div>

        {/* Fitness tracker */}
        <motion.div 
          className="absolute left-20 top-2/4"
          variants={floatVariants}
          initial="initial"
          animate="animate"
          style={{ animationDelay: "1s" }}
        >
          <svg width="100" height="100" viewBox="0 0 100 100">
            <motion.rect x="25" y="25" width="50" height="50" rx="10" fill="none" stroke="#06b6d4" strokeWidth="2" variants={pathVariants} />
            <motion.path 
              d="M35,50 L45,60 L65,40" 
              stroke="#06b6d4" 
              strokeWidth="3" 
              fill="none"
              variants={pathVariants}
            />
            <motion.circle cx="50" cy="50" r="30" stroke="#0ea5e9" strokeWidth="1" strokeDasharray="5 3" fill="none" variants={rotateVariants} initial="initial" animate="animate" />
          </svg>
        </motion.div>

        {/* Heart health */}
        <motion.div 
          className="absolute left-40 top-3/4"
          variants={pulseVariants}
          initial="initial"
          animate="animate"
        >
          <svg width="80" height="80" viewBox="0 0 100 100">
            <motion.path 
              d="M10,30 A20,20,0,0,1,50,30 A20,20,0,0,1,90,30 Q90,60,50,90 Q10,60,10,30 Z" 
              fill="none" 
              stroke="#ef4444" 
              strokeWidth="2"
              variants={pathVariants}
            />
            <motion.path 
              d="M25,50 L40,50 L50,30 L60,70 L70,50 L85,50" 
              fill="none" 
              stroke="#ef4444" 
              strokeWidth="2"
              variants={pathVariants}
            />
          </svg>
        </motion.div>
      </motion.div>

      {/* Right side SVG decorations */}
      <motion.div 
        className="absolute right-0 top-0 h-full w-1/3 opacity-70 pointer-events-none"
        initial="hidden"
        animate="visible"
        variants={svgVariants}
      >
        {/* Workout calendar */}
        <motion.div 
          className="absolute right-20 top-1/4"
          variants={floatVariants}
          initial="initial"
          animate="animate"
        >
          <svg width="100" height="100" viewBox="0 0 100 100">
            <motion.rect x="20" y="20" width="60" height="60" rx="5" fill="none" stroke="#a855f7" strokeWidth="2" variants={pathVariants} />
            <motion.line x1="20" y1="35" x2="80" y2="35" stroke="#a855f7" strokeWidth="2" variants={pathVariants} />
            <motion.circle cx="35" cy="50" r="5" fill="#a855f7" variants={pathVariants} />
            <motion.circle cx="50" cy="50" r="5" fill="#a855f7" variants={pathVariants} />
            <motion.circle cx="65" cy="50" r="5" fill="#a855f7" variants={pathVariants} />
            <motion.circle cx="35" cy="65" r="5" fill="#d946ef" variants={pathVariants} />
            <motion.circle cx="50" cy="65" r="5" stroke="#d946ef" strokeWidth="2" fill="none" variants={pathVariants} />
            <motion.circle cx="65" cy="65" r="5" stroke="#d946ef" strokeWidth="2" fill="none" variants={pathVariants} />
          </svg>
        </motion.div>

        {/* Hydration tracker */}
        <motion.div 
          className="absolute right-40 top-2/4"
          variants={floatVariants}
          initial="initial"
          animate="animate"
          style={{ animationDelay: "0.5s" }}
        >
          <svg width="80" height="140" viewBox="0 0 80 140">
            <motion.path 
              d="M20,40 L20,120 Q20,130,40,130 Q60,130,60,120 L60,40 L50,20 L30,20 Z" 
              fill="none" 
              stroke="#3b82f6" 
              strokeWidth="2"
              variants={pathVariants}
            />
            <motion.path 
              d="M20,85 Q40,95,60,85" 
              fill="none" 
              stroke="#3b82f6" 
              strokeWidth="2"
              variants={pathVariants}
            />
            <motion.path 
              d="M20,100 Q40,110,60,100" 
              fill="none" 
              stroke="#60a5fa" 
              strokeWidth="2"
              variants={pathVariants}
            />
            <motion.path 
              d="M20,115 Q40,125,60,115" 
              fill="none" 
              stroke="#93c5fd" 
              strokeWidth="2"
              variants={pathVariants}
            />
          </svg>
        </motion.div>

        {/* Meditation circle */}
        <motion.div 
          className="absolute right-10 top-3/4"
          variants={pulseVariants}
          initial="initial"
          animate="animate"
        >
          <svg width="120" height="120" viewBox="0 0 120 120">
            <motion.circle cx="60" cy="60" r="50" fill="none" stroke="#0f766e" strokeWidth="2" variants={pathVariants} />
            <motion.circle cx="60" cy="60" r="40" fill="none" stroke="#14b8a6" strokeWidth="1" variants={pathVariants} />
            <motion.circle cx="60" cy="60" r="30" fill="none" stroke="#2dd4bf" strokeWidth="1" variants={pathVariants} />
            <motion.circle cx="60" cy="60" r="20" fill="none" stroke="#5eead4" strokeWidth="1" variants={pathVariants} />
            <motion.circle cx="60" cy="60" r="10" fill="#5eead4" variants={pulseVariants} initial="initial" animate="animate" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Header with logo */}
      <div className="flex items-center relative mb-8 z-10">
        <motion.div
          whileHover={{ rotate: [0, -10, 10, -10, 0] }}
          transition={{ duration: 0.5 }}
        >
          <Leaf className="text-green-400 h-8 w-8 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
        </motion.div>
        <motion.h1
          className="ml-3 text-2xl font-semibold text-green-400 relative before:absolute before:-inset-1 before:bg-green-400 before:blur-lg before:opacity-30 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)] mb-10 mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Nourish
        </motion.h1>
      </div>

      {/* Home button */}
      <motion.button
        onClick={handleHomeClick}
        className="absolute top-6 left-6 bg-green-700 hover:bg-green-600 text-white py-2 px-4 rounded-md flex items-center gap-2 z-10"
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <Home className="w-4 h-4" />
      </motion.button>

      {/* Profile card */}
      <motion.div
        className="bg-gray-900 p-8 rounded-xl shadow-lg border border-green-800 w-full max-w-md relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="flex justify-center items-center mb-6"
          variants={avatarVariants}
          initial="initial"
          animate="animate"
        >
          <div className="w-16 h-16 rounded-full bg-green-700 text-white font-bold text-lg flex items-center justify-center">
            {getUserInitials()}
          </div>
        </motion.div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold">User Profile</h2>
        </div>

        {["firstname", "lastname", "email", "contact"].map((field) => (
          <motion.div key={field} variants={itemVariants} className="mb-4">
            <input
              type={field === "email" ? "email" : "text"}
              name={field}
              value={user[field]}
              onChange={handleChange}
              disabled={field === "email" || !isEditing}
              className={`w-full p-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-600 ${
                field === "email" || !isEditing ? "opacity-60" : ""
              }`}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            />
          </motion.div>
        ))}

        <motion.div className="flex gap-2 justify-end">
          {isEditing ? (
            <motion.button
              onClick={handleSave}
              className="bg-green-700 hover:bg-green-600 text-white py-2 px-4 rounded-md"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Save
            </motion.button>
          ) : (
            <motion.button
              onClick={() => setIsEditing(true)}
              className="bg-green-700 hover:bg-green-600 text-white py-2 px-4 rounded-md"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Edit
            </motion.button>
          )}
          <motion.button
            onClick={handleLogout}
            className="bg-zinc-700 hover:bg-zinc-600 text-white py-2 px-4 rounded-md flex items-center gap-2"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Floating icons */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        {[Heart, Apple, Droplets, Wind, Scale, Salad].map((Icon, index) => (
          <motion.div
            key={index}
            className="absolute text-green-700 opacity-30"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: Math.random() * window.innerHeight,
              rotate: Math.random() * 180,
              scale: 0.5 + Math.random() * 1.5
            }}
            animate={{ 
              y: [0, -20, 0, 20, 0],
              rotate: index % 2 === 0 ? [0, 10, 0, -10, 0] : [0, -10, 0, 10, 0]
            }}
            transition={{ 
              duration: 10 + index * 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{
              color: index % 3 === 0 ? '#22c55e' : index % 3 === 1 ? '#3b82f6' : '#ef4444',
            }}
          >
            <Icon size={24 + index * 4} />
          </motion.div>
        ))}
      </div>

      <ToastContainer />
    </div>
  );
};

export default ProfilePage;