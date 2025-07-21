const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    preferences: {
        dietary: { type: String },
        allergies: { type: String },
        fitnessGoals: { type: String },
        completed: { type: Boolean, default: false }
    },
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);