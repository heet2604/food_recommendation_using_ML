require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userModel = require('./models/user');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const authMiddleware = require("./middleware/auth");
const Food = require("./models/selectedFood");
const axios = require("axios");
// const xlsx = require("xlsx");
// const Fuse = require("fuse.js")


const port = 5000;
app.use(express.json());
app.use(express.static('public'));
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const JWT_SECRET = process.env.JWT_SECRET;

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Connected to Database"))
    .catch(err => console.log(err));

app.post('/signup', async (req, res) => {
    try {
        let { username, email, password } = req.body;
        let existinguser = await userModel.findOne({ email });
        if (existinguser) {
            return res.status(400).send("User already exists");
        }
        const hashed = await bcrypt.hash(password, 10);
        const user = await userModel.create({ username, email, password: hashed });
        res.status(201).send(user);
    }
    catch (err) {
        console.log(err);
    }
});

app.post('/login', async (req, res) => {
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

        // Generate the token correctly by accessing user._id
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' }); // Added expiration for token
        res.send({ message: 'Login Successful', token: token });
    } catch (err) {
        console.log(err);
        res.status(500).send({ error: "Server error" });
    }
});

app.post("/api/add-food", authMiddleware, async (req, res) => {
    const { food_name, protein_g, carb_g, fat_g, fibre_g, energy_kcal, glycemic_index } = req.body;

    if (!food_name) {
        return res.status(400).json({ message: "No food selected!" });
    }

    if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: "Unauthorized: No user found!" });
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
            glycemic_index: glycemic_index !== undefined ? glycemic_index : null,
            createdAt: new Date()
        });

        console.log("📥 Received food data:", req.body);
        res.json({ message: "Food added successfully", food });
    } catch (err) {
        console.error("🚨 Error adding food:", err.message, err.stack);
        res.status(500).json({ message: "Error adding food", error: err.message });
    }
});


app.get("/api/latest-food/:userId",authMiddleware,async (req,res)=>{
    //const {userId} = req.params;
    try{
        const latestfood = await Food.findOne({userId : req.user.userId}).sort({_id:-1});   
        if(!latestfood){
            return res.status(404).json({message:"No food found"})
        }
        res.json(latestfood)
    }
    catch(err){
        res.status(500).json({message : "Server Error"})
    }   
})

// let foodDatabase=[];
// let fuse = null;

// const loadData = () => {
//     try {
//         const workbook = xlsx.readFile("./public/Anuvaad_INDB_2024.11.xlsx");
//         const sheetName = workbook.SheetNames[0];
//         const sheet = workbook.Sheets[sheetName];
//         foodDatabase = xlsx.utils.sheet_to_json(sheet);
//         console.log("✅ Excel food database loaded successfully");

//         // Initialize Fuse.js for fuzzy searching
//         fuse = new Fuse(foodDatabase, {
//             keys: ["food_name"], // Search based on food names
//             threshold: 0.2, // Sensitivity (lower = stricter matching)
//             distance: 100, // Allow minor differences
//         });
//     } catch (err) {
//         console.error("❌ Error loading Excel file:", err);
//     }
// };
// loadData();

app.post("/api/analyze", async (req, res) => {
    try {
        const { food } = req.body;
        if (!food) return res.status(400).json({ message: "Food name is required" });

        // Step 1: Try Exact Match
        //let foundFood = foodDatabase.find(f => f.food_name.toLowerCase() === food.toLowerCase());

        // // Step 2: If No Exact Match, Use Fuzzy Search
        // if (!foundFood) {
        //     const fuzzyResults = fuse.search(food);
        //     if (fuzzyResults.length > 0) {
        //         foundFood = fuzzyResults[0].item; // Get the closest match
        //         console.log(`🔍 Fuzzy match found: ${foundFood.food_name}`);
        //     }
        // } 
        //if(foundFood){
            // let glycemicIndex = null;
            // if (foundFood.carb_g !== undefined && foundFood.fibre_g !== undefined) {
            //     glycemicIndex = (39.71 + 0.548 * (foundFood.carb_g / 100) * 100 - 
            //                      3.93 * (foundFood.fibre_g / 100) * 100) + 
            //                     ((foundFood.protein_g || 0) + (foundFood.fat_g || 0));
            //     glycemicIndex = glycemicIndex.toFixed(2);
            // }            
            
        //     console.log("✅ Exact match found!");
        //     return res.json({
        //         food: foundFood.food_name || 0,
        //         calorie: foundFood.energy_kcal || 0,
        //         carb: foundFood.carb_g || 0,
        //         protein: foundFood.protein_g || 0,
        //         fat: foundFood.fat_g || 0,
        //         fiber: foundFood.fibre_g || 0,
        //         glycemicIndex : glycemicIndex ? glycemicIndex : null
        //     });   
        // }

        // Step 3: If No Match, Request LLM
        console.log(" requesting LLM...");
        const response = await axios.post("https://api.together.xyz/v1/chat/completions", {
            model: "meta-llama/Llama-3.3-70B-Instruct-Turbo",
            messages: [
                { role: "system", content: "You are a nutrition expert. Given a food description, return its estimated calories, carbs, protein, fat ,fiber and glycemic index in **strict JSON format**. NO markdown, no explanations, no additional text. ONLY valid JSON." },
                { role: "user", content: `Provide estimated nutrition facts per 100g of ${food},including glycemic index of that food in valid JSON format. ONLY return JSON, nothing else.` }
            ],
            max_tokens: 200,
            temperature: 0.7
        }, {
            headers: {
                "Authorization": `Bearer ${process.env.TOGETHER_API_KEY}`,
                "Content-Type": "application/json"
            }
        });

        let nutritionText = response.data.choices[0].message.content;

        // Remove Markdown formatting (if any)
        nutritionText = nutritionText.replace(/```json|```/g, '').trim();

        // Extract Macros
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
                    glycemic_index: parsedData.glycemic_index !== undefined ? parsedData.glycemic_index : null,
                };
            } catch (err) {
                console.log("❌ JSON parsing error", err);
                return null;
            }
        };

        const nutritionData = extractMacros(nutritionText);
        console.log("🤖 LLM response:", nutritionText);
        res.json({ nutritionData });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Something went wrong" });
    }
});

app.listen(port, () => {
    console.log(`Live at port ${port}`);
}); 