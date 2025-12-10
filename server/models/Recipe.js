import mongoose from "mongoose";

const recipeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },

    description: { type: String },

    image: { type: String },

    source: { type: String, enum: ["mealdb", "cocktaildb", "community", "custom"], default: "mealdb" },

    externalId: { type: String },
    ingredients: [
      {
        name: String,
        measure: String,
      },
    ],

    instructions: { type: String },

    nutrition: {
      calories: Number,
      protein: Number,
      carbs: Number,
      fat: Number,
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, 
  },
  { timestamps: true }
);

export default mongoose.model("Recipe", recipeSchema);