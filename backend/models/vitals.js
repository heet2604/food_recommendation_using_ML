const mongoose = require('mongoose');

const VitalsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sugarReading: {
    type: Number,
    required: true
  },
  weightReading: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true 
});

const Vitals = mongoose.model('Vitals', VitalsSchema);

module.exports = Vitals;