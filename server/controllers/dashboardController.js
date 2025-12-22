import MealPlan from "../models/MealPlan.js";
import GroceryList from "../models/GroceryList.js";
import User from "../models/User.js";

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.userId;

    /* ---------------- Saved Recipes ---------------- */
    const user = await User.findById(userId).select("favorites");
    const savedRecipes = user?.favorites?.length || 0;

    /* ---------------- Meals Planned This Week ---------------- */
    const weekStart = getWeekStart();

    const mealPlan = await MealPlan.findOne({
      user: userId,
      weekStart,
    });

    let mealsThisWeek = 0;

    if (mealPlan?.days) {
      Object.values(mealPlan.days).forEach((day) => {
        if (day?.breakfast?.recipeId) mealsThisWeek++;
        if (day?.lunch?.recipeId) mealsThisWeek++;
        if (day?.dinner?.recipeId) mealsThisWeek++;
      });
    }

    /* ---------------- Grocery Items ---------------- */
    const groceryList = await GroceryList.findOne({ user: userId });
    const groceryItems = groceryList?.items?.length || 0;

    return res.json({
      savedRecipes,
      mealsThisWeek,
      groceryItems,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ---------------- Helper ---------------- */
function getWeekStart() {
  const now = new Date();
  const day = now.getDay(); // 0 (Sun) - 6 (Sat)
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().slice(0, 10);
}