// src/services/recipeService.js
const API_BASE = `${import.meta.env.VITE_API_URL}/recipes`;

export const searchRecipes = async (query) => {
  if (!query || !query.trim()) return { meals: [] };

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/recipes/search?q=${encodeURIComponent(query)}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) throw new Error("Search failed");
  return res.json();
};

export async function getRecipeDetails({ id, type }) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/recipes/${id}/details?type=${type}`
  );
  if (!res.ok) throw new Error("Failed to fetch recipe");
  return res.json();
}

export const getRandomDrink = async () => {
  const res = await fetch(`${API_BASE}/drinks/random`);
  return res.json();
};

// 🔹 NEW: curated meals
export const getCuratedMeals = async () => {
  const res = await fetch(`${API_BASE}/curated`);
  return res.json(); // { meals: [...] }
};

// 🔹 NEW: curated drinks
export const getCuratedDrinks = async () => {
  const res = await fetch(`${API_BASE}/drinks/curated`);
  return res.json(); // { drinks: [...] }
};

export const browseRecipes = async (params) => {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/recipes/browse?${query}`
  );
  return res.json();
};

export const getSuggestedRecipes = async ({ type, excludeId }) => {
  const params = new URLSearchParams({
    type,
    excludeId,
    limit: 6,
  });

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/recipes/suggested?${params}`
  );

  if (!res.ok) throw new Error("Failed to load suggestions");
  return res.json();
};
export const getRecipeNutrition = async ({ id, type }) => {
  const res = await fetch(
    `${API_BASE}/${id}/nutrition?type=${type}`,
    { credentials: "include" }
  );

  if (res.status === 401) {
    throw new Error("SESSION_EXPIRED");
  }

  if (!res.ok) {
    throw new Error("Failed to fetch nutrition");
  }

  return res.json();
};

export const getRecipeNutritionCached = async (recipeId) => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/recipes/${recipeId}/nutrition?type=meal`
  );
  if (!res.ok) throw new Error("Nutrition fetch failed");
  return res.json();
};