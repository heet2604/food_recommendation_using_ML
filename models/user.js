const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    //userId: { type : mongoose.Schema.Types.ObjectId , ref : "User", required:true},
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('User', userSchema);
