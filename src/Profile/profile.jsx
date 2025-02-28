import React, { useState, useEffect } from "react";

const ProfilePage = () => {
    const [user, setUser] = useState({
        firstName: "",
        lastName: "",
        email: "",
        contact: "",
        profilePic: "https://via.placeholder.com/150",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "contact" && !/^[0-9-]+$/.test(value)) return;
        setUser((prev) => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        return () => {
            if (user.profilePic.startsWith("blob:")) {
                URL.revokeObjectURL(user.profilePic);
            }
        };
    }, [user.profilePic]);

    const handleLogout = () => {
        console.log("Logging out...");
        // authentication logout here
    };

    return (
        <div className="flex justify-center items-center bg-gradient-to-b from-gray-900 to-black text-white min-h-screen p-6">
            <div className="bg-gray-800 p-8 rounded-3xl shadow-2xl flex items-center gap-8 border border-gray-700 w-[40%]">

                {/* Profile Info Section */}
                <div className="w-full space-y-4">
                    <h1 className="text-3xl font-extrabold text-center">User Profile</h1>
                    {[
                        { name: "firstName", placeholder: "First Name" },
                        { name: "lastName", placeholder: "Last Name" },
                        { name: "email", placeholder: "Email" },
                        { name: "contact", placeholder: "Contact Number" },
                    ].map(({ name, placeholder }) => (
                        <input
                            key={name}
                            type={name === "email" ? "email" : "text"}
                            name={name}
                            value={user[name]}
                            onChange={handleChange}
                            className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            placeholder={placeholder}
                        />
                    ))}

                    <div className="flex gap-4 w-full mt-4">
                        <button
                            onClick={handleLogout}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full w-1/2 transition duration-300"
                        >
                            Edit Profile
                        </button>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full w-1/2 transition duration-300"
                        >
                            Logout
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
