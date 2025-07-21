const express = require("express");
const router = express.Router();
const Recipe = require("../models/Recipe");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

// GET: Search recipes by ingredient, dietary preference, and meal type
router.get("/", async (req, res) => {
  const { ingredient, dietary, mealType } = req.query;
  const filter = {};

  if (ingredient) {
    filter.ingredients = { $regex: ingredient, $options: "i" };
  }
  if (dietary) {
    filter.dietaryPreferences = dietary;
  }
  if (mealType) {
    filter.mealType = mealType;
  }

  try {
    const recipes = await Recipe.find(filter);
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recipes" });
  }
});

// POST: Create new recipe with nutritional info
router.post("/", async (req, res) => {
  const {
    name,
    ingredients,
    instructions,
    mealType,
    dietaryPreferences,
    calories,
    protein,
    carbs,
    fat,
  } = req.body;

  if (!name || !ingredients || !mealType || !calories) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const recipe = new Recipe({
      name,
      ingredients,
      instructions,
      mealType,
      dietaryPreferences,
      calories,
      protein,
      carbs,
      fat,
    });

    await recipe.save();
    res.status(201).json(recipe);
  } catch (err) {
    res.status(400).json({ error: "Invalid recipe data" });
  }
});

// POST: Add recipe to user's favorites
router.post("/favorite", authMiddleware, async (req, res) => {
  try {
    const { recipeId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.favorites.includes(recipeId)) {
      user.favorites.push(recipeId);
      await user.save();
    }

    res.json({ message: "Added to favorites" });
  } catch (err) {
    res.status(500).json({ error: "Failed to save favorite" });
  }
});

// GET: Get user's favorite recipes (populated)
router.get("/favorites", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("favorites");
    res.json(user.favorites);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch favorites" });
  }
});

module.exports = router;