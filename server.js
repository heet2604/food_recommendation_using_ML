require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userModel = require("./models/user");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const authMiddleware = require("./middleware/auth");
const Food = require("./models/selectedFood");
const axios = require("axios");
const xlsx = require("xlsx");
const { parse } = require("dotenv");

const port = 5000;
app.use(express.json());

app.use(cors());
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
  const fiber = Math.round(weight * 0.014); // 14g fiber per 1000 calories
  return { protein, carbs, fats, fiber };
};

// Routes
app.post("/signup", async (req, res) => {
  try {
    let { username, email, password } = req.body;
    let existinguser = await userModel.findOne({ email });
    if (existinguser) {
      return res.status(400).send("User already exists");
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await userModel.create({ username, email, password: hashed });
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
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "1h" });
    res.send({ message: "Login Successful", token: token });
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
    const adjustedCalories = maintenanceCalories + weightGoal * 7700 / 7;

    // Calculate Daily Macros
    const dailyMacros = calculateDailyMacros(weight, adjustedCalories);

    // Update User Document
    const user = await userModel.findByIdAndUpdate(
      userId,
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
      { new: true }
    );

    res.status(200).json({ success: true, message: "Goals calculated and saved successfully!", user });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: "Something went wrong. Please try again." });
  }
});



app.use(express.static("public"));


app.post("/api/add-food", authMiddleware, async (req, res) => {
  console.log("📥 Received food data:", req.body); // Log incoming data

  const { food_name, protein_g, carb_g, fat_g, fibre_g, energy_kcal, glycemic_index } = req.body;

  if (!food_name) {
    return res.status(400).json({ message: "No food selected!" });
  }

  try {
    const food = await Food.create({
      userId: req.user.userId,
      food_name,
      protein_g,
      carb_g,
      fat_g,
      fibre_g,
      energy_kcal,
      glycemic_index : glycemic_index ?? null
    });

    console.log("✅ Food added to DB:", food);
    res.json({ message: "Food added successfully", food });
  } catch (err) {
    console.error("❌ Error adding food:", err);
    res.status(500).json({ message: "Error adding food" });
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

// let foodDatabase = [];

// const loadData = () => {
//   try {
//     const workbook = xlsx.readFile("./public/Anuvaad_INDB_2024.11.xlsx");
//     const sheetName = workbook.SheetNames[0];
//     const sheet = workbook.Sheets[sheetName];
//     foodDatabase = xlsx.utils.sheet_to_json(sheet);
//     console.log("✅ Excel food database loaded successfully");
//   } catch (err) {
//     console.error("❌ Error loading Excel file:", err);
//   }
// };

// loadData();

app.post("/api/analyze", async (req, res) => {
  try {
    const { food } = req.body;
    if (!food) return res.status(400).json({ message: "Food name is required" });

    const response = await axios.post(
      "https://api.together.xyz/v1/chat/completions",
      {
        model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a nutrition expert. Given a food description, return its estimated calories, carbs, protein, fat, fiber, and glycemic index in *strict JSON format*. NO markdown, no explanations, no additional text. ONLY valid JSON.",
          },
          {
            role: "user",
            content: `Provide estimated nutrition facts per 100g of ${food} in valid JSON format. Make sure to include calories, carbs, protein, fat, fiber, and glycemic index. ONLY return JSON, nothing else.`,
          },
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

    let nutritionText = response.data.choices[0].message.content.trim();
    console.log("Raw LLM Response:", nutritionText); // Debugging log

    const extractMacros = (text) => {
      try {
        const parsedData = JSON.parse(text);
        return {
          food: food,
          calorie: parsedData.calories || 0,
          carb: parsedData.carbs || 0,
          protein: parsedData.protein || 0,
          fat: parsedData.fat || 0,
          fiber: parsedData.fiber || 0,
          glycemicIndex: parsedData.glycemic_index ?? null,
        };
      } catch (err) {
        console.log("JSON parsing error", err);
        return null;
      }
    };

    const nutritionData = extractMacros(nutritionText);
    if (!nutritionData) {
      return res.status(500).json({ error: "Failed to extract nutrition data" });
    }

    console.log("Parsed Nutrition Data:", nutritionData); // Debugging log
    res.json(nutritionData);
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json({ err: "Something went wrong" });
  }
});

app.listen(port, () => {
  console.log(`Live at port ${port}`);
});