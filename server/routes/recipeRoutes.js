import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";

const router = express.Router();

const MEALDB_BASE = "https://www.themealdb.com/api/json/v1/1";
const DRINKDB_BASE = "https://www.thecocktaildb.com/api/json/v1/1";

/* ================= CACHE ================= */
let MEAL_CACHE = [];
let DRINK_CACHE = [];
let CACHE_READY = false;

export async function warmUpCache() {
  if (CACHE_READY) return;

  console.log("🔥 Warming recipe cache...");

  const [meals, drinks] = await Promise.all([
    fetchAllMeals(),
    fetchAllDrinks(),
  ]);

  MEAL_CACHE = meals;
  DRINK_CACHE = drinks;
  CACHE_READY = true;

  console.log(
    `✅ Cache ready: ${MEAL_CACHE.length} meals, ${DRINK_CACHE.length} drinks`
  );
}

/* ================= HELPERS ================= */
const hashCalories = (id) => {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash % 500) + 300; // 300–800 kcal
};

const inferDiet = (item) => {
  const category = item.strCategory?.toLowerCase() || "";
  const name = item.strMeal?.toLowerCase() || "";

  if (
    category.includes("vegetarian") ||
    category.includes("vegan") ||
    name.includes("veg")
  ) {
    return "veg";
  }

  if (
    category.includes("chicken") ||
    category.includes("beef") ||
    category.includes("lamb") ||
    category.includes("pork") ||
    category.includes("seafood")
  ) {
    return "keto";
  }

  return "non-veg";
};

const enrichRecipe = (item, type) => {
  const id = type === "meal" ? item.idMeal : item.idDrink;
  const calories = hashCalories(id);

  return {
    id,
    type,
    name: item.strMeal || item.strDrink,
    thumbnail: item.strMealThumb || item.strDrinkThumb,
    calories,
    diet: type === "meal" ? inferDiet(item) : "drink",
    createdAt: 1700000000000 + calories, // deterministic
    popularity: calories % 1000,
  };
};

/* ================= FETCH ALL MEALS ================= */
const MEAL_CATEGORIES = [
  "Beef",
  "Chicken",
  "Dessert",
  "Lamb",
  "Pasta",
  "Pork",
  "Seafood",
  "Vegan",
  "Vegetarian",
  "Breakfast",
];

const fetchAllMeals = async () => {
  const responses = await Promise.all(
    MEAL_CATEGORIES.map((c) =>
      axios.get(`${MEALDB_BASE}/filter.php?c=${c}`)
    )
  );

  const map = new Map();

  responses.forEach((r) => {
    r.data.meals?.forEach((m) => {
      if (!map.has(m.idMeal)) {
        map.set(m.idMeal, enrichRecipe(m, "meal"));
      }
    });
  });

  return [...map.values()];
};

/* ================= FETCH ALL DRINKS ================= */
const fetchAllDrinks = async () => {
  const res = await axios.get(`${DRINKDB_BASE}/filter.php?c=Cocktail`);
  return res.data.drinks?.map((d) => enrichRecipe(d, "drink")) || [];
};

/* ================= SEARCH (FAST, CACHED) ================= */
router.get("/search", async (req, res) => {
  try {
    await warmUpCache();

    const { q = "" } = req.query;
    if (!q.trim()) return res.json({ meals: [] });

    const qLower = q.toLowerCase();

    const meals = MEAL_CACHE.filter((m) =>
      m.name.toLowerCase().includes(qLower)
    ).slice(0, 20); // limit results

    res.json({
      meals: meals.map((m) => ({
        idMeal: m.id,
        strMeal: m.name,
        strMealThumb: m.thumbnail,
      })),
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ meals: [] });
  }
});

/* ================= BROWSE ================= */
router.get("/browse", async (req, res) => {
  try {
    await warmUpCache();

    const {
      type = "all",
      diet,
      sort = "latest",
      q = "",
      minCalories,
      maxCalories,
      page = 1,
      limit = 9,
    } = req.query;

    let results = [];

    if (type === "all" || type === "meal") results.push(...MEAL_CACHE);
    if (type === "all" || type === "drink") results.push(...DRINK_CACHE);

    /* 🔍 SEARCH BY NAME */
    if (q) {
      const qLower = q.toLowerCase();
      results = results.filter((r) =>
        r.name.toLowerCase().includes(qLower)
      );
    }

    /* 🥗 DIET FILTER (MEALS ONLY) */
    if (diet) {
      results = results.filter((r) => {
        if (r.type === "drink") return true;
        return r.diet === diet;
      });
    }

    /* 🔥 CALORIE FILTER */
    if (minCalories) {
      results = results.filter((r) => r.calories >= Number(minCalories));
    }

    if (maxCalories) {
      results = results.filter((r) => r.calories <= Number(maxCalories));
    }

    /* 🔀 SORT */
    switch (sort) {
      case "calories_asc":
        results.sort((a, b) => a.calories - b.calories);
        break;
      case "calories_desc":
        results.sort((a, b) => b.calories - a.calories);
        break;
      case "popularity":
        results.sort((a, b) => b.popularity - a.popularity);
        break;
      default:
        results.sort((a, b) => b.createdAt - a.createdAt);
    }

    /* 📄 PAGINATION */
    const total = results.length;
    const start = (page - 1) * limit;

    res.json({
      results: results.slice(start, start + Number(limit)),
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("Browse recipes error:", err);
    res.status(500).json({ message: "Failed to browse recipes" });
  }
});

/* ================= SUGGESTED ================= */
router.get("/suggested", async (req, res) => {
  await warmUpCache();

  const { excludeId, limit = 3 } = req.query;

  const pool = [...MEAL_CACHE, ...DRINK_CACHE]
    .filter((r) => r.id !== excludeId)
    .sort(() => 0.5 - Math.random());

  res.json({ results: pool.slice(0, Number(limit)) });
});

/* ================= DETAILS ================= */
router.get("/:id/details", async (req, res) => {
  try {
    const { id } = req.params;
    const { type = "meal" } = req.query;

    const url =
      type === "drink"
        ? `${DRINKDB_BASE}/lookup.php?i=${id}`
        : `${MEALDB_BASE}/lookup.php?i=${id}`;

    const response = await axios.get(url);
    const recipe =
      type === "drink"
        ? response.data.drinks?.[0]
        : response.data.meals?.[0];

    if (!recipe) {
      return res.status(404).json({ recipe: null });
    }

    res.json({ recipe });
  } catch (err) {
    res.status(404).json({ recipe: null });
  }
});

export const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Not authorized, token invalid" });
  }
};
router.get("/:id/nutrition", async (req, res) => {
  const { id } = req.params;

  const calories = hashCalories(id);

  res.json({
    nutrition: {
      calories,
      protein: Math.round(calories * 0.25 / 4),
      carbs: Math.round(calories * 0.45 / 4),
      fat: Math.round(calories * 0.30 / 9),
    },
  });
});
export default router;