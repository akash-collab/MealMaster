const mongoose = require("mongoose");

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ingredients: [String],
  instructions: { type: String },
  mealType: { type: String }, 
  dietaryPreferences: { type: String },
  calories: { type: Number },
  protein: { type: Number },   
  carbs: { type: Number },     
  fat: { type: Number },       
});

module.exports = mongoose.model("Recipe", recipeSchema);