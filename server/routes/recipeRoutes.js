// server/routes/recipeRoutes.js
import express from "express";
import axios from "axios";

const router = express.Router();
const MEALDB_BASE = "https://www.themealdb.com/api/json/v1/1";
const DRINKDB_BASE = "https://www.thecocktaildb.com/api/json/v1/1";

// 👉 curated IDs (MealDB)
const CURATED_MEAL_IDS = [
  "52771", // Arrabiata
  "52807", // Butter Chicken
  "52805", // Lamb Biryani
  "52820", // Katsu Curry
  "52855", // Pad Thai
  "52844", // Lasagna
  "52795", // Chicken Handi
  "53065", // Sushi
  "52834", // Tacos
  "52982", // Carbonara
  "52819", // Beef Fried Rice
  "52796", // Teriyaki Chicken Casserole
];

// 👉 curated drink IDs (CocktailDB)
const CURATED_DRINK_IDS = [
  "11000",  // Mojito
  "11007",  // Margarita
  "12776",  // Iced Coffee
  "17207",  // Pina Colada
  "178366", // Long Island Iced Tea
  "12770",  // Strawberry Shake
];

// 🔹 Search meals
router.get("/search", async (req, res) => {
  try {
    const { q } = req.query;
    const response = await axios.get(`${MEALDB_BASE}/search.php?s=${q}`);
    res.json(response.data);
  } catch (err) {
    console.error("Meal search error:", err);
    res.status(500).json({ message: "Error searching meals" });
  }
});

// 🔹 Curated meals (minimal fields)
router.get("/curated", async (_req, res) => {
  try {
    const promises = CURATED_MEAL_IDS.map((id) =>
      axios.get(`${MEALDB_BASE}/lookup.php?i=${id}`)
    );

    const results = await Promise.all(promises);

    const meals = results
      .map((r) => r.data.meals?.[0])
      .filter(Boolean)
      .map((meal) => ({
        id: meal.idMeal,
        name: meal.strMeal,
        thumbnail: meal.strMealThumb,
      }));

    res.json({ meals });
  } catch (err) {
    console.error("Curated meals error:", err);
    res.status(500).json({ message: "Error fetching curated meals" });
  }
});

// 🔹 Curated drinks (minimal fields)
router.get("/drinks/curated", async (_req, res) => {
  try {
    const promises = CURATED_DRINK_IDS.map((id) =>
      axios.get(`${DRINKDB_BASE}/lookup.php?i=${id}`)
    );

    const results = await Promise.all(promises);

    const drinks = results
      .map((r) => r.data.drinks?.[0])
      .filter(Boolean)
      .map((drink) => ({
        id: drink.idDrink,
        name: drink.strDrink,
        thumbnail: drink.strDrinkThumb,
      }));

    res.json({ drinks });
  } catch (err) {
    console.error("Curated drinks error:", err);
    res.status(500).json({ message: "Error fetching curated drinks" });
  }
});

// 🔹 Random drink suggestion (for details page)
router.get("/drinks/random", async (_req, res) => {
  try {
    const response = await axios.get(`${DRINKDB_BASE}/random.php`);
    res.json(response.data);
  } catch (err) {
    console.error("Drink error:", err);
    res.status(500).json({ message: "Error fetching drink suggestion" });
  }
});

// 🔹 Meal details (keep LAST so it doesn't swallow other routes)
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const response = await axios.get(`${MEALDB_BASE}/lookup.php?i=${id}`);
    res.json(response.data);
  } catch (err) {
    console.error("Meal details error:", err);
    res.status(500).json({ message: "Error fetching meal details" });
  }
});

export default router;