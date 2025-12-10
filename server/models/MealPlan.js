import mongoose from "mongoose";

const mealItemSchema = new mongoose.Schema({
  recipeId: String,
  name: String,
  thumbnail: String,
});

const daySchema = new mongoose.Schema({
  breakfast: mealItemSchema,
  lunch: mealItemSchema,
  dinner: mealItemSchema,
});

const mealPlanSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    weekStart: { type: String, required: true },

    days: {
      type: {
        Monday: daySchema,
        Tuesday: daySchema,
        Wednesday: daySchema,
        Thursday: daySchema,
        Friday: daySchema,
        Saturday: daySchema,
        Sunday: daySchema,
      },
      default: () => ({
        Monday: {},
        Tuesday: {},
        Wednesday: {},
        Thursday: {},
        Friday: {},
        Saturday: {},
        Sunday: {},
      })
    },
  },
  { timestamps: true }
);
mealPlanSchema.index({ user: 1, weekStart: 1 }, { unique: true });
export default mongoose.model("MealPlan", mealPlanSchema);