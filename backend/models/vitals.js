const mongoose = require('mongoose');

const VitalsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sugarReading: {
    type: String,
    required: true
  },
  weightReading: {
    type: String,
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