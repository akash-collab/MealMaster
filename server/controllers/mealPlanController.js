const MealPlan = require("../models/MealPlan");

exports.saveMealPlan = async (req, res) => {
  const userId = req.user.id;
  const mealPlanObj = req.body.mealPlan;

  try {
    const planArray = Object.entries(mealPlanObj).map(([slot, meal]) => ({
      slot,
      meal,
    }));

    const updated = await MealPlan.findOneAndUpdate(
      { user: userId },
      { plan: planArray },
      { new: true, upsert: true }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Error saving meal plan:", err);
    res.status(500).json({ error: "Failed to save meal plan" });
  }
};

exports.getMealPlan = async (req, res) => {
  try {
    const doc = await MealPlan.findOne({ user: req.user.id });
    if (!doc) return res.json({ mealPlan: {} });

    const planObj = {};
    doc.plan.forEach(({ slot, meal }) => {
      planObj[slot] = meal;
    });

    res.json({ mealPlan: planObj });
  } catch (err) {
    console.error("Error getting meal plan:", err);
    res.status(500).json({ error: "Failed to fetch meal plan" });
  }
};