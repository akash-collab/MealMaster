import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String },

    avatar: { type: String },

    oauthProvider: { type: String }, 
    oauthId: { type: String },

    dietPreferences: [String],
    allergies: [String],
    cuisinePreferences: [String],

    calorieGoal: { type: Number, default: 2000 },
    macroGoals: {
      protein: { type: Number, default: 30 },
      carbs: { type: Number, default: 40 },
      fat: { type: Number, default: 30 },
    },

    favorites: [
      {
        recipeId: String,
        name: String,
        thumbnail: String,
      }
    ],

    likedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);