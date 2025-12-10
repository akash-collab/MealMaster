// src/services/recipeService.js
const API_BASE = `${import.meta.env.VITE_API_URL}/recipes`;

export const searchRecipes = async (query) => {
  if (!query || !query.trim()) return { meals: [] };

  const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
  return res.json();
};

export const getRecipeDetails = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`);
  return res.json();
};

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