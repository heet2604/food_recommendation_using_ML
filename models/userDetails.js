// models/User.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true }, // Unique username
  password: { type: String, required: true }, // Hashed password
  height: { type: Number }, // Height in cm
  weight: { type: Number }, // Weight in kg
  age: { type: Number }, // Age in years
  gender: { type: String, enum: ["male", "female"] }, // Gender
  activityLevel: { type: Number }, // Activity level multiplier
  weightGoal: { type: Number }, // Weekly weight goal (kg/week)
  bmi: { type: Number }, // Calculated BMI
  maintenanceCalories: { type: Number }, // Daily maintenance calories
  dailyMacros: {
    protein: { type: Number }, // Protein in grams
    carbs: { type: Number }, // Carbs in grams
    fats: { type: Number }, // Fats in grams
    fiber: { type: Number }, // Fiber in grams
  },
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

module.exports = mongoose.model("User", userSchema);