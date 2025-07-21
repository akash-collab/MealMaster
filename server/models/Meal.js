const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  calories: { type: Number },
  ingredients: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model("Meal", mealSchema);