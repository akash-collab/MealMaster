import mongoose from "mongoose";

const foodLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    date: { type: Date, required: true },

    entries: [
      {
        recipe: { type: mongoose.Schema.Types.ObjectId, ref: "Recipe" },
        customName: String,
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("FoodLog", foodLogSchema);