require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const UserDetails = require("./models/userDetails");
const userModel = require("./models/user");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const authMiddleware = require("./middleware/auth");
const Food = require("./models/selectedFood");
const axios = require("axios");
const DailyIntake = require('./models/dailyIntake.js');
const multer = require("multer")
// const Tesseract = require("tesseract.js")
const fs = require("fs")
const path = require('path')
const FormData = require("form-data");
const { spawn } = require("child_process")
const csv = require('csv-parser');
// const { distance } = require('ml-distance');
// const math = require('mathjs');
const uploads = multer({ dest: "uploads/" })


const port = 5000;
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src 'self'; font-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self';");
  next();
});


const whitelist = [
  'http://localhost:3000',
  'https://food-recommendation-using-ml.vercel.app',
  'https://food-recommendation-using-ml.onrender.com'
];

app.use(cors({
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true
}));

app.use(express.urlencoded({ extended: true }));

const JWT_SECRET = process.env.JWT_SECRET;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to Database"))
  .catch((err) => console.log(err));

// Helper Functions
const calculateBMI = (weight, height) => {
  const heightInMeters = height / 100;
  return (weight / (heightInMeters * heightInMeters)).toFixed(2);
};

const calculateMaintenanceCalories = (weight, height, age, gender, activityLevel) => {
  let bmr;
  if (gender === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  return Math.round(bmr * activityLevel);
};

const calculateDailyMacros = (weight, maintenanceCalories) => {
  const protein = Math.round(weight * 1); // 1g protein/kg body weight
  const fats = Math.round((maintenanceCalories * 0.25) / 9); // 25% of calories from fats
  const carbs = Math.round((maintenanceCalories - (protein * 4 + fats * 9)) / 4); // Remaining calories from carbs
  const fiber = Math.round((maintenanceCalories / 1000) * 14); // 14g fiber per 1000 calories
  return { protein, carbs, fats, fiber };
};

// Routes
app.post("/signup", async (req, res) => {
  try {
    let { firstname, lastname, contact, username, email, password } = req.body;
    let existinguser = await userModel.findOne({ email });
    if (existinguser) {
      return res.status(400).send("User already exists");
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await userModel.create({ firstname, lastname, contact, username, email, password: hashed });
    res.status(201).send(user);
  } catch (err) {
    console.log(err);
  }
});


app.post("/login", async (req, res) => {
  let { username, password } = req.body;
  try {
    const user = await userModel.findOne({ username });
    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).send({ error: "Invalid Password" });
    }

    // Check if user details exist
    const userDetails = await UserDetails.findOne({ userId: user._id });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
    res.send({
      message: "Login Successful",
      token: token,
      userId: user._id,
      hasUserDetails: !!userDetails // Boolean indicating if user details exist
    });
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: "Server error" });
  }
});



app.post("/api/calculate-goals", authMiddleware, async (req, res) => {
  try {
    const { height, weight, age, gender, activityLevel, weightGoal } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!height || !weight || !age || !gender || !activityLevel || !weightGoal) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Calculate BMI
    const bmi = calculateBMI(weight, height);

    // Calculate Maintenance Calories
    const maintenanceCalories = calculateMaintenanceCalories(weight, height, age, gender, activityLevel);

    // Adjust Calories Based on Weight Goal
    const adjustedCalories = maintenanceCalories + (weightGoal * 7700) / 7;

    // Calculate Daily Macros
    const dailyMacros = calculateDailyMacros(weight, adjustedCalories);

    // Check if user details already exist, then update, else create new
    const updatedUserDetails = await UserDetails.findOneAndUpdate(
      { userId }, // Find user by userId
      {
        height,
        weight,
        age,
        gender,
        activityLevel,
        weightGoal,
        bmi,
        maintenanceCalories: adjustedCalories,
        dailyMacros,
      },
      { new: true, upsert: true } // If not found, create a new one
    );

    res.status(200).json({ success: true, message: "Goals updated successfully!", userDetails: updatedUserDetails });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
});

app.use(express.static("public"));



app.post('/api/add-food', async (req, res) => {
  try {
    // Validate incoming data
    const {
      userId,
      food_name,
      protein_g,
      carb_g,
      fat_g,
      fibre_g,
      energy_kcal,
      glycemic_index
    } = req.body;

    // Validation checks
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Create new food entry
    const newFood = new Food({
      userId,
      food_name,
      protein_g,
      carb_g,
      fat_g,
      fibre_g,
      energy_kcal,
      glycemic_index
    });

    // Save to database
    const savedFood = await newFood.save();

    res.status(201).json(savedFood);
  } catch (error) {
    console.error('Error adding food:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});


app.get("/api/selected-food", authMiddleware, async (req, res) => {
  try {
    const foods = await Food.find({ userId: req.user.userId });
    res.json(foods);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Error fetching foods" });
  }
});

app.get("/api/latest-food/:userId", authMiddleware, async (req, res) => {
  try {
    const latestfood = await Food.findOne({ userId: req.user.userId }).sort({ _id: -1 });
    if (!latestfood) {
      return res.status(404).json({ message: "No food found" });
    }
    res.json(latestfood);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});


// Read and parse the CSV file
const foodDatabase = [];
fs.createReadStream('Indian_Foods_Dataset_With_Tags_Final.csv')
  .pipe(csv())
  .on('data', (row) => {
    // Convert numeric fields and store the data
    const foodItem = {
      name: row['Food Name'].trim().toLowerCase(),
      category: row['Category'],
      calorie: parseFloat(row['Calories']) || 0,
      carb: parseFloat(row['Carbs']) || 0,
      protein: parseFloat(row['Protein']) || 0,
      fat: parseFloat(row['Fats']) || 0,
      fiber: parseFloat(row['Fiber']) || 0,
      glycemic_index: parseFloat(row['GI']) || null,
      recommendation: row['recommendation'],
      portion: row['portion_guidance']
    };
    foodDatabase.push(foodItem);
  })
  .on('end', () => {
    console.log('✅ Indian Food Database loaded with', foodDatabase.length, 'items');
  })
  .on('error', (error) => {
    console.error('❌ Error loading CSV file:', error);
  });

app.post("/api/analyze", async (req, res) => {
  try {
    const { food } = req.body;
    console.log("🔍 Received Food Search:", food);

    if (!food) {
      console.error("❌ No food name provided");
      return res.status(400).json({ message: "Food name is required" });
    }

    // Search in the CSV database first
    const searchTerm = food.trim().toLowerCase();
    const foundItem = foodDatabase.find(item => 
      item.name.includes(searchTerm) || searchTerm.includes(item.name)
    );

    if (foundItem) {
      console.log("✅ Found in Indian Food Database");
      return res.json({
        food: food,
        calorie: foundItem.calorie,
        carb: foundItem.carb,
        protein: foundItem.protein,
        fat: foundItem.fat,
        fiber: foundItem.fiber,
        glycemic_index: foundItem.glycemic_index,
        recommendation: foundItem.recommendation,
        portion: foundItem.portion
      });
    }

    // Only attempt LLM call if not in database
    try {
      const response = await axios.post(
        "https://api.together.xyz/v1/chat/completions",
        {
          model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
          messages: [
            {
              role: "system",
              content: "You are a nutrition expert. Return nutrition facts per 100g in strict JSON format."
            },
            {
              role: "user",
              content: `Provide nutrition facts per 100g of ${food} in this JSON format: {"calories":0,"carbs":0,"protein":0,"fat":0,"fiber":0,"glycemic_index":null}`
            }
          ],
          max_tokens: 200,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("🌐 Full API Response:", JSON.stringify(response.data, null, 2));

      // Extract the JSON content from the response
      const nutritionText = response.data.choices[0].message.content.trim();
      console.log("📄 Raw LLM Response:", nutritionText);

      // Parse the nutrition data
      let nutritionData;
      try {
        nutritionData = JSON.parse(nutritionText);
        console.log("✅ Parsed Nutrition Data:", nutritionData);
      } catch (parseError) {
        console.error("❌ JSON Parsing Error:", parseError);
        console.error("Problematic Text:", nutritionText);

        // Fallback to default values if parsing fails
        nutritionData = {
          calories: 0,
          carbs: 0,
          protein: 0,
          fat: 0,
          fiber: 0,
          glycemic_index: null
        };
      }

      // Respond with nutrition data
      res.json({
        food: food,
        calorie: nutritionData.calories || 0,
        carb: nutritionData.carbs || 0,
        protein: nutritionData.protein || 0,
        fat: nutritionData.fat || 0,
        fiber: nutritionData.fiber || 0,
        glycemic_index: nutritionData.glycemic_index ?? null
      });

    } catch (llmError) {
      console.error("❌ LLM API Error:", llmError.response?.data || llmError.message);

      // Fallback to basic nutrition data if LLM fails
      res.json({
        food: food,
        calorie: 0,
        carb: 0,
        protein: 0,
        fat: 0,
        fiber: 0,
        glycemic_index: null,
        message: "Nutrition data not available"
      });
    }

  } catch (serverError) {
    console.error("🚨 Comprehensive Server Error:", serverError);
    res.status(500).json({
      error: "Internal Server Error",
      message: serverError.message,
      details: serverError.toString()
    });
  }
});

app.get("/api/fetchGoal", authMiddleware, async (req, res) => {
  try {
    // Ensure the user is authenticated and userId is available
    if (!req.user || !req.user.userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Fetch user details from the UserDetails collection
    const userDetails = await UserDetails.findOne({ userId: req.user.userId });

    if (!userDetails) {
      return res.status(404).json({ error: "User details not found" });
    }

    // Return the user's goals and details
    res.status(200).json({
      success: true,
      userDetails: {
        height: userDetails.height,
        weight: userDetails.weight,
        age: userDetails.age,
        gender: userDetails.gender,
        activityLevel: userDetails.activityLevel,
        weightGoal: userDetails.weightGoal,
        bmi: userDetails.bmi,
        maintenanceCalories: userDetails.maintenanceCalories,
        dailyMacros: userDetails.dailyMacros,
      },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized access" });

    const user = await userModel.findById(userId).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/profile", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized access" });

    const { firstname, lastname, contact } = req.body; // Match frontend field names

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { firstname, lastname, contact },
      { new: true, runValidators: true } // Ensure validation is applied
    );

    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// New Routes for Vitals
const Vitals = require("./models/vitals");
const { parse } = require("dotenv");
const c = require("config");




app.post("/api/vitals", authMiddleware, async (req, res) => {
  try {
    const { sugarReading, weightReading } = req.body;
    const userId = req.user.userId;

    if (!sugarReading || !weightReading) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Find existing user details
    const existingUserDetails = await UserDetails.findOne({ userId });

    if (!existingUserDetails) {
      return res.status(404).json({ message: "User details not found. Please set up your profile first." });
    }

    // Recalculate maintenance calories and macros with new weight
    const maintenanceCalories = calculateMaintenanceCalories(
      weightReading,
      existingUserDetails.height,
      existingUserDetails.age,
      existingUserDetails.gender,
      existingUserDetails.activityLevel
    );

    // Adjust Calories Based on Weight Goal
    const adjustedCalories = maintenanceCalories + (existingUserDetails.weightGoal * 7700) / 7;

    // Recalculate Daily Macros
    const dailyMacros = calculateDailyMacros(weightReading, adjustedCalories);

    // Update user details with new weight, calories, and macros
    const updatedUserDetails = await UserDetails.findOneAndUpdate(
      { userId },
      {
        weight: weightReading,
        maintenanceCalories: adjustedCalories,
        dailyMacros: dailyMacros,
        bmi: calculateBMI(weightReading, existingUserDetails.height)
      },
      { new: true }
    );

    // Create new vitals entry
    const vitals = await Vitals.create({
      userId,
      sugarReading,
      weightReading,
    });

    res.status(201).json({
      success: true,
      message: "Vitals added successfully!",
      vitals,
      userDetails: updatedUserDetails
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
});



app.get("/api/vitals", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const vitals = await Vitals.find({ userId });

    res.status(200).json({ success: true, vitals });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
});

app.post("/api/add-food-to-dashboard", authMiddleware, async (req, res) => {
  try {
    const { energy_kcal, protein_g, carb_g, fat_g, fibre_g } = req.body;
    const userId = req.user.userId;

    // Validate input
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Create a date range for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Find or create daily intake record
    let dailyIntake = await DailyIntake.findOne({
      userId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    if (!dailyIntake) {
      dailyIntake = new DailyIntake({
        userId,
        date: today,
        calories: 0,
        nutrients: {
          protein: 0,
          carbs: 0,
          fats: 0,
          fiber: 0
        }
      });
    }

    // Safely parse and add values
    dailyIntake.calories += parseFloat(energy_kcal || 0);
    dailyIntake.nutrients.protein += parseFloat(protein_g || 0);
    dailyIntake.nutrients.carbs += parseFloat(carb_g || 0);
    dailyIntake.nutrients.fats += parseFloat(fat_g || 0);
    dailyIntake.nutrients.fiber += parseFloat(fibre_g || 0);

    // Save the updated intake
    await dailyIntake.save();

    res.json({
      success: true,
      message: "Food intake updated",
      data: {
        calories: dailyIntake.calories,
        nutrients: dailyIntake.nutrients
      }
    });
  } catch (err) {
    console.error("Error adding food to dashboard:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
});

app.get("/api/dashboard-data", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Validate user ID
    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    // Create a date range for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Find daily intake for today
    const dailyIntake = await DailyIntake.findOne({
      userId,
      date: {
        $gte: today,
        $lt: tomorrow
      }
    });

    // Return default values if no intake found
    if (!dailyIntake) {
      return res.json({
        success: true,
        calories: 0,
        nutrients: {
          protein: 0,
          carbs: 0,
          fats: 0,
          fiber: 0
        }
      });
    }

    // Return daily intake data
    res.json({
      success: true,
      calories: dailyIntake.calories,
      nutrients: dailyIntake.nutrients
    });
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message
    });
  }
});

// Add these routes to your existing server file

app.post("/api/vitals", authMiddleware, async (req, res) => {
  try {
    const { sugarReading, weightReading } = req.body;
    const userId = req.user.userId;

    if (!sugarReading || !weightReading) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Create new vitals entry
    const vitals = await Vitals.create({
      userId,
      sugarReading,
      weightReading,
    });

    // Update user details with the latest weight
    await UserDetails.findOneAndUpdate(
      { userId },
      { weight: weightReading },
      { new: true }
    );

    res.status(201).json({
      success: true,
      message: "Vitals added successfully!",
      vitals
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
});

app.get("/api/vitals", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Fetch all vitals for the user, sorted by timestamp
    const vitals = await Vitals.find({ userId }).sort({ timestamp: -1 });

    // Optional: Get the latest vitals for quick reference
    const latestVitals = vitals.length > 0 ? vitals[0] : null;

    res.status(200).json({
      success: true,
      vitals,
      latestVitals
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
});

// app.post("/api/generate-meal-plan", authMiddleware, async (req, res) => {
//   try {
//     const userId = req.user?.userId;
//     if (!userId) {
//       return res.status(401).json({ success: false, message: "Unauthorized request" });
//     }

//     console.log("Generating meal plan for user:", userId);

//     // Fetch user details
//     const userDetails = await UserDetails.findOne({ userId });
//     if (!userDetails) {
//       return res.status(404).json({ success: false, message: "User details not found" });
//     }

//     // Fetch daily intake for today
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     const tomorrow = new Date(today);
//     tomorrow.setDate(today.getDate() + 1);

//     const dailyIntake = await DailyIntake.findOne({
//       userId,
//       date: { $gte: today, $lt: tomorrow },
//     });

//     // Fetch past food intake (last 7 days)
//     const pastFoodIntake = await Food.find({
//       userId,
//       createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
//     }).sort({ createdAt: -1 });

//     console.log(pastFoodIntake);

//     // Fetch latest vitals
//     const latestVitals = await Vitals.findOne({ userId }).sort({ timestamp: -1 });

//     // Prepare context for the LLM
//     const context = {
//       height: userDetails.height || "unknown",
//       weight: userDetails.weight || "unknown",
//       age: userDetails.age || "unknown",
//       gender: userDetails.gender || "unknown",
//       activityLevel: userDetails.activityLevel || "unknown",
//       weightGoal: userDetails.weightGoal || "unknown",
//       bmi: userDetails.bmi || "unknown",
//       maintenanceCalories: userDetails.maintenanceCalories || "unknown",
//       dailyMacros: userDetails.dailyMacros || {},
//       currentIntake: {
//         calories: dailyIntake?.calories || 0,
//         protein: dailyIntake?.nutrients?.protein || 0,
//         carbs: dailyIntake?.nutrients?.carbs || 0,
//         fats: dailyIntake?.nutrients?.fats || 0,
//         fiber: dailyIntake?.nutrients?.fiber || 0,
//       },
//       pastFoodIntake: pastFoodIntake?.map((food) => food.food_name) || [],
//       latestVitals: {
//         sugarReading: latestVitals?.sugarReading || null,
//         weightReading: latestVitals?.weightReading || null,
//       },
//     };

//     console.log("Context for LLM:", context);
//     const currentTime = new Date().toLocaleTimeString();

//     // Generate meal plan using Together AI API
//     const aiResponse = await axios.post(
//       "https://api.together.xyz/v1/chat/completions",
//       {
//         model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
//         messages: [
//           {
//             role: "system",
//             content:
//               "You are a nutrition expert. Generate a personalized meal plan based on the user's context. The meal plan should be strictly based on user's existing habits, which are given in the context. Additionally, consider the current time of the day and provide 3 meal options for the user to choose from. The response must be in plain text format (no markdown, no **, no ```). Each meal option should include the meal name, calories per 100g, and macros (protein, carbs, fats, fiber). Ensure the meal options are suitable for a diabetic person (low glycemic index), compatible with Indian cuisine, and strictly according to the user's past eating habits.",
//           },
//           {
//             role: "user",
//             content: `Generate a meal plan for a user with the following details: ${JSON.stringify(
//               context
//             )}. The current time is ${currentTime}. Provide 3 meal options based on the type of the meal.`,
//           },
//         ],
//         max_tokens: 500,
//         temperature: 0.7,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     // Validate AI response
//     if (
//       !aiResponse.data.choices ||
//       !aiResponse.data.choices[0] ||
//       !aiResponse.data.choices[0].message ||
//       !aiResponse.data.choices[0].message.content
//     ) {
//       throw new Error("Invalid response from Together AI");
//     }

//     // Extract the meal plan response
//     let mealPlan = aiResponse.data.choices[0].message.content;

//     // Remove markdown formatting (e.g., **, ```) if present
//     mealPlan = mealPlan.replace(/\*\*/g, "").replace(/```/g, "").trim();

//     console.log("Generated Meal Plan:", mealPlan);

//     // Return the cleaned meal plan
//     res.status(200).json({ success: true, mealPlan });
//   } catch (error) {
//     console.error("Error generating meal plan:", error.message || error);
//     res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
//   }
// });


const upload = multer({ dest: "uploads/" });

app.post("/api/medical", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const filePath = path.join(__dirname, req.file.path);
    if (!fs.existsSync(filePath)) return res.status(500).json({ error: "Uploaded file not found" });

    console.log("📤 Sending image to OCR server:", filePath);

    // Send image to OCR server
    const formData = new FormData();
    formData.append("file", fs.createReadStream(filePath));

    const ocrResponse = await axios.post("http://13.233.45.0:5001/ocr", formData, {
      headers: { ...formData.getHeaders() },
    });

    let extractedText = ocrResponse.data.text;
    console.log("✅ OCR Processed successfully:", extractedText);

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    // 🛠 Step 2: Send extracted text to OpenAI (or Together AI)
    const simplifiedText = await simplifyText(extractedText);

    // Remove asterisks and format each line
    const formattedText = simplifiedText.replace(/\*/g, "").split("\n").map(line => line.trim()).join("\n");

    res.json({ extractedText: formattedText });

  } catch (error) {
    console.error("❌ Error in processing image:", error.message);
    res.status(500).json({ error: "Failed to process the image." });
  }
});

// Function to Simplify Text using OpenAI GPT (or Together AI)
async function simplifyText(text) {
  try {
    const response = await axios.post(
      "https://api.together.xyz/v1/chat/completions",  // Use Together AI API
      {
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        messages: [{ role: "user", content: `Simplify this medical report into easy language:\n\n${text}` }],
        temperature: 0.7,
      },
      { headers: { Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`, "Content-Type": "application/json" } }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error("❌ AI Summarization Failed:", error.message);
    return "Failed to simplify the text.";
  }
}


// Add this route
app.post("/api/generate-meal-plan", async (req, res) => {
  try {
    const { food } = req.body;
    if (!food) {
      return res.status(400).json({ error: "Food name is required" });
    }

    // Replace with your Flask server's URL if deployed elsewhere
    const flaskUrl = process.env.FLASK_API_URL || "http://13.233.45.0:5001/recommend";

    // Call the Flask microservice
    const response = await axios.post(flaskUrl, { food });

    // Forward the response to the frontend
    res.json(response.data);
  } catch (error) {
    console.error("Flask recommendation error:", error.message || error);
    res.status(500).json({ error: "Failed to get recommendations" });
  }
});



app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = req.file.path;
  try {
    const flaskFormData = new FormData();
    flaskFormData.append("file", fs.createReadStream(filePath), {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });

    // 1. Get detection from Flask
    const detectionResponse = await axios.post(
      "http://13.233.45.0:5001/detect-food",
      flaskFormData,
      {
        headers: flaskFormData.getHeaders(),
        timeout: 15000 // 15 seconds timeout
      }
    );

    // Verify response structure
    if (!detectionResponse.data?.primary_item) {
      throw new Error("Invalid response from detection service");
    }

    const detectedFood = detectionResponse.data.primary_item;
    console.log("✅ Detected food:", detectedFood);

    // 2. Get nutrition data
    const nutritionResponse = await axios.post(
      "http://13.233.45.0:5001/food-nutrition",
      { food_name: detectedFood }
    );

    // 3. Handle response
    let macros;
    if (nutritionResponse.data?.error) {
      // Dataset lookup failed, use LLM fallback
      console.log("⚠️ Dataset lookup failed, using LLM fallback");
      macros = await queryLLM(detectedFood);
    } else {
      // Map dataset fields to expected frontend structure
      macros = {
        source: "dataset",
        calories: nutritionResponse.data.calories,
        protein: nutritionResponse.data.protein,
        carbs: nutritionResponse.data.carbs,
        fat: nutritionResponse.data.fat, // CSV uses 'Fats' column
        fiber: nutritionResponse.data.fiber,
        glycemic_index: nutritionResponse.data.gi // CSV uses 'GI' column
      };
    }

    res.json({
      detected_food: detectedFood,
      macros
    });

  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data?.error || "Processing failed"
    });
  } finally {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Sync cleanup
    }
  }
});

async function queryLLM(foodName) {
  const prompt = `Provide nutritional information for "${foodName}" including:
- Calories (kcal per typical serving)
- Protein (g)
- Carbohydrates (g)
- Fats (g)
- Fiber (g)
- Glycemic Index

Format the response as a **valid JSON object** with the following keys:

{
  "food_name": string,
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "fiber": number,
  "glycemic_index": number
}`;

  try {
    const llmResponse = await axios.post(
      "https://api.together.xyz/v1/chat/completions",
      {
        model: "meta-llama/Llama-3-70B-Instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 300
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.TOGETHER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const content = llmResponse.data.choices[0].message.content;
    console.log("🧠 LLM raw response:\n", content); // Optional debug log

    // Extract JSON object from response
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found in LLM response.");

    const macros = JSON.parse(match[0]);
    macros.source = "llm";
    return macros;

  } catch (error) {
    console.error("❌ LLM query error:", error.response?.data || error.message);
    return {
      food_name: foodName,
      calories: null,
      protein: null,
      carbs: null,
      fat: null,
      fiber: null,
      glycemic_index: null,
      source: "llm_error"
    };
  }
}

app.listen(port,'0.0.0.0', () => {
  console.log(`Live at port ${port}`);
});