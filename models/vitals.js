const mongoose = require("mongoose");

const vitalsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sugarReading: {
    type: Number,
    required: true,
  },
  weightReading: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Vitals", vitalsSchema);