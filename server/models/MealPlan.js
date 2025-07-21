const mongoose = require("mongoose");

const mealSlotSchema = new mongoose.Schema({
  slot: String, // e.g. "Mon-Breakfast"
  meal: {
    id: String,
    name: String,
  },
});

const mealPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
  plan: [mealSlotSchema],
});

module.exports = mongoose.model("MealPlan", mealPlanSchema);