// server/controllers/mealPlanController.js
import MealPlan from "../models/MealPlan.js";

export const getMealPlan = async (req, res) => {
  try {
    const userId = req.userId;
    const { weekStart } = req.params;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
      return res.status(400).json({ message: "Invalid weekStart date" });
    }

    const plan = await MealPlan.findOne({
      user: userId,
      weekStart, 
    });

    return res.json({ plan });
  } catch (err) {
    console.error("Get meal plan error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const saveMealPlan = async (req, res) => {
  try {
    const userId = req.userId;
    const { weekStart } = req.params; 
    const { days } = req.body;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) {
      return res.status(400).json({ message: "Invalid weekStart date" });
    }

    if (!days) {
      return res.status(400).json({ message: "Days object is required" });
    }

    const existing = await MealPlan.findOne({
      user: userId,
      weekStart, 
    });

    let plan;
    if (existing) {
      existing.days = days;
      plan = await existing.save();
    } else {
      plan = await MealPlan.create({
        user: userId,
        weekStart,
        days,
      });
    }

    return res.json({ message: "Meal plan saved", plan });
  } catch (err) {
    console.error("Save meal plan error:", err);
    res.status(500).json({ message: "Server error" });
  }
};