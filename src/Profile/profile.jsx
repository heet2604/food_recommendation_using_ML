import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ToastContainer , toast } from "react-toastify";

const ProfilePage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState({
        firstName: "",
        lastName: "",
        email: "",
        contact: "",
    });

    const [isEditing, setIsEditing] = useState(false);

    // Fetch user data on mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token")
                const response = await axios.get("http://localhost:5000/profile",{
                    headers : {Authorization: `Bearer ${token}`},
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
                firstname : user.firstName,
                lastname : user.lastName,
                contact : user.contact
            }
            await axios.put("http://localhost:5000/profile", updatedProfile, { 
            headers : {Authorization : `Bearer ${token}`},
            withCredentials: true ,
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
    

    return (
        <div className="flex justify-center items-center bg-gradient-to-b from-gray-900 to-black text-white min-h-screen p-6">
            <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl border border-gray-700 w-[40%]">
                <h1 className="text-3xl font-extrabold text-center mb-6">User Profile</h1>

                {/* Input fields */}
                {["firstName", "lastName", "email", "contact"].map((field) => (
                    <input
                        key={field}
                        type={field === "email" ? "email" : "text"}
                        name={field}
                        value={user[field]}
                        onChange={handleChange}
                        disabled={field === "email" || !isEditing} // Email is non-editable
                        className={`w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none mb-4 ${field === "email" || !isEditing ? "opacity-60" : ""}`}
                        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                    />
                ))}

                {/* Buttons */}
                <div className="flex gap-4 w-full">
                    {isEditing ? (
                        <button
                            onClick={handleSave}
                            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-full w-1/2 transition duration-300"
                        >
                            Save Changes
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full w-1/2 transition duration-300"
                        >
                            Edit Profile
                        </button>
                    )}

                    <button
                        onClick={handleLogout}
                        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full w-1/2 transition duration-300"
                    >
                        Logout
                    </button>
                </div>
            </div>
            <ToastContainer />
        </div>
    );
};

export default ProfilePage;

