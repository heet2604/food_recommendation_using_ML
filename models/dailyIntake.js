const mongoose = require('mongoose')

const DailyIntake = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : 'true'
    },
    calories : {
        type : Number,
        default : 0,
    },
    nutrients : {
        protein : {type: Number,default : 0},
        carbs : {type : Number, default : 0},
        fats : {type : Number , default: 0},
        fiber : {type: Number , default : 0},
    },
    date:{
        type : Date,
        default : Date.now
    },
} , { collection: "dailyIntake", timestamps: true })

module.exports = mongoose.model("Dailyintake", DailyIntake);