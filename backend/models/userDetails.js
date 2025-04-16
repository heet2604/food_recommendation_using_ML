const mongoose = require("mongoose");

const userDetailsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the User model
  height: { type: Number, required: true },
  weight: { type: Number, required: true },
  age: { type: Number, required: true },
  gender: { type: String, enum: ["male", "female"], required: true },
  activityLevel: { type: Number, required: true },
  weightGoal: { type: Number, required: true },
  bmi: { type: Number, required: true },
  maintenanceCalories: { type: Number, required: true },
  dailyMacros: {
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fats: { type: Number, required: true },
    fiber: { type: Number, required: true },
  },
  createdAt: { type: Date, default: Date.now },
  
},
{collection: "userDetails"},
);

module.exports = mongoose.model("UserDetails", userDetailsSchema);