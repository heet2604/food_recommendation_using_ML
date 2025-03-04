import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { motion } from "framer-motion";

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

    return (
        <div className="flex justify-center items-center bg-gradient-to-b from-gray-900 to-black text-white min-h-screen p-6">
            <motion.button
                onClick={handleHomeClick}
                className="absolute top-6 left-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-full transition duration-300 flex items-center"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                </svg>
                Home
            </motion.button>

            {/* User Avatar */}
            <motion.div
                className="absolute top-6 right-6"
                variants={avatarVariants}
                initial="initial"
                animate="animate"
            >
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {getUserInitials()}
                </div>
            </motion.div>

            <motion.div 
                className="bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-700 w-[40%]"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <motion.h1 
                    className="text-3xl font-extrabold text-center mb-6 bg-gradient-to-r from-green-300 to-blue-400 bg-clip-text text-transparent"
                    variants={itemVariants}
                >
                    User Profile
                </motion.h1>

                {/* Input fields */}
                {["firstname", "lastname", "email", "contact"].map((field, index) => (
                    <motion.div
                        key={field}
                        variants={itemVariants}
                    >
                        <input
                            type={field === "email" ? "email" : "text"}
                            name={field}
                            value={user[field]}
                            onChange={handleChange}
                            disabled={field === "email" || !isEditing} // Email is non-editable
                            className={`w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4 ${field === "email" || !isEditing ? "opacity-60" : ""} transition-all duration-300`}
                            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                        />
                    </motion.div>
                ))}

                {/* Buttons */}
                <motion.div 
                    className="flex gap-4 w-full"
                    variants={itemVariants}
                >
                    {isEditing ? (
                        <motion.button
                            onClick={handleSave}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full w-1/2 transition duration-300"
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            Save Changes
                        </motion.button>
                    ) : (
                        <motion.button
                            onClick={() => setIsEditing(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full w-1/2 transition duration-300"
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            Edit Profile
                        </motion.button>
                    )}

                    <motion.button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full w-1/2 transition duration-300"
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                    >
                        Logout
                    </motion.button>
                </motion.div>
            </motion.div>
            <ToastContainer />
        </div>
    );
};

export default ProfilePage;

