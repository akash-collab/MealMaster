// server/models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },

    email: { type: String, required: true, unique: true },

    password: { type: String },

    avatar: {
      data: Buffer,
      contentType: String,
    },

    oauthProvider: { type: String },
    oauthId: { type: String },

    refreshToken: { type: String },

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
        recipeId: { type: String, required: true },
        name: { type: String, required: true },
        thumbnail: { type: String, required: true },
        type: {
          type: String,
          enum: ["meal", "drink"],
          required: true,
        },
      }
    ],

    likedRecipes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipe" }],

    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);