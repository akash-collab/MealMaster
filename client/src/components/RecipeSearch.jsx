// src/components/RecipeSearch.jsx
import React, { useState } from "react";
import API from "../services/api";

export default function RecipeSearch({ onAddToMealPlan }) {
  const [ingredient, setIngredient] = useState("");
  const [dietary, setDietary] = useState("");
  const [mealType, setMealType] = useState("");
  const [recipes, setRecipes] = useState([]);

  const handleSearch = async () => {
    try {
      const params = new URLSearchParams();
      if (ingredient) params.append("ingredient", ingredient);
      if (dietary) params.append("dietary", dietary);
      if (mealType) params.append("mealType", mealType);

      const res = await API.get(`/recipes?${params.toString()}`);
      setRecipes(res.data);
    } catch (err) {
      console.error("Search error:", err);
    }
  };

  return (
    <div className="bg-white p-4 shadow rounded mb-6">
      <h2 className="text-lg font-bold mb-3">🔍 Search Recipes</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <input
          className="border p-2 rounded"
          value={ingredient}
          onChange={(e) => setIngredient(e.target.value)}
          placeholder="Ingredient (e.g., chicken)"
        />
        <select
          className="border p-2 rounded"
          value={dietary}
          onChange={(e) => setDietary(e.target.value)}
        >
          <option value="">Dietary Preference</option>
          <option value="vegetarian">Vegetarian</option>
          <option value="vegan">Vegan</option>
          <option value="non-vegetarian">Non-Vegetarian</option>
        </select>
        <select
          className="border p-2 rounded"
          value={mealType}
          onChange={(e) => setMealType(e.target.value)}
        >
          <option value="">Meal Type</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
        </select>
      </div>

      <button
        onClick={handleSearch}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4"
      >
        Search
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {recipes.map((recipe) => (
          <div
            key={recipe._id}
            className="border p-4 rounded shadow hover:bg-gray-50"
          >
            <h3 className="font-semibold text-lg mb-1">{recipe.name}</h3>
            <p className="text-sm text-gray-600 mb-1 capitalize">
              🍽 {recipe.mealType} | 🥗 {recipe.dietaryPreferences}
            </p>
            <p className="text-sm text-gray-800 mb-2">
              🔥 {recipe.calories} cal | 🥩 {recipe.protein}g P | 🍞 {recipe.carbs}g C | 🧈 {recipe.fat}g F
            </p>

            <div className="flex justify-between items-center">
              <button
                onClick={() => onAddToMealPlan(recipe)}
                className="text-sm text-blue-500 hover:underline"
              >
                ➕ Add to planner
              </button>
              <button
                onClick={async () => {
                  await API.post("/recipes/favorite", { recipeId: recipe._id });
                  alert("Saved to favorites");
                }}
                className="text-sm text-red-500 hover:underline"
              >
                ❤️ Save
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}