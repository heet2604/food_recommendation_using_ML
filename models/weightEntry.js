
const mongoose = require("mongoose");

const weightEntrySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  weight: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  notes: { type: String, default: "" },
});

module.exports = mongoose.model("WeightEntry", weightEntrySchema);