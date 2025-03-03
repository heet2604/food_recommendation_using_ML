const mongoose = require("mongoose")

const SugarLevelSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required: true
    },
    sugarLevel: {
        type: Number,
        required: true,
        min:0,
        max:1000
    },
    date:{
        type: Date,
        default: Date.now
    },
    notes:{
        type: String,
        trim: true
    }
},{
    collection: "bloodSugar"
}

)
const SugarLevel = mongoose.model("SugarLevel" , SugarLevelSchema);
module.exports = SugarLevel;