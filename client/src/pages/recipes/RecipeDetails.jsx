import { useParams, useLocation, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";

import { addFavorite } from "../../services/favoriteService";
import {
  getRecipeDetails,
  getSuggestedRecipes,
  getRecipeNutrition,
} from "../../services/recipeService";

/* ================= HELPERS ================= */

function extractIngredientsForUI(recipe) {
  const items = [];
  if (!recipe) return items;

  for (let i = 1; i <= 20; i++) {
    const name = recipe[`strIngredient${i}`];
    const measure = recipe[`strMeasure${i}`];

    if (name && name.trim()) {
      items.push({
        name: name.trim(),
        measure: measure?.trim() || "",
      });
    }
  }
  return items;
}

function parseInstructions(text) {
  if (!text) return [];
  return text
    .split(/\r?\n|\. /)
    .map((step) => step.trim())
    .filter((step) => step.length > 5);
}

function NutritionBox({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  );
}

/* ================= COMPONENT ================= */

export default function RecipeDetails() {
  const { id } = useParams();
  const location = useLocation();
  const type = new URLSearchParams(location.search).get("type") || "meal";

  const [checked, setChecked] = useState({});

  const toggleIngredient = (index) => {
    setChecked((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  /* ---------- MAIN RECIPE ---------- */
  const {
    data: recipeData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["recipe-details", id, type],
    queryFn: () => getRecipeDetails({ id, type }),
  });

  /* ---------- NUTRITION ---------- */
  const { data: nutritionData, error: nutritionError } = useQuery({
  queryKey: ["recipe-nutrition", id, type],
  queryFn: () => getRecipeNutrition({ id, type }),

  retry: false,               
  refetchOnWindowFocus: false,  
  staleTime: 1000 * 60 * 60,  
});

  /* ---------- SUGGESTED ---------- */
  const { data: suggestionsData } = useQuery({
    queryKey: ["suggested-recipes", id],
    queryFn: () =>
      getSuggestedRecipes({
        type: "all",
        excludeId: id,
        limit: 3,
      }),
  });

  const mutation = useMutation({
    mutationFn: addFavorite,
    onSuccess: () => toast.success("Added to favorites ❤️"),
  });

  if (isLoading) return <p className="p-6">Loading…</p>;
  if (isError || !recipeData?.recipe)
    return <p className="p-6">Recipe not found.</p>;

  const recipe = recipeData.recipe;
  const name = recipe.strMeal || recipe.strDrink;
  const thumb = recipe.strMealThumb || recipe.strDrinkThumb;

  const ingredients = extractIngredientsForUI(recipe);

  const handleFavorite = () => {
    mutation.mutate({
      recipeId: id,
      name,
      thumbnail: thumb,
      type,
    });
  };

  return (
    <div className="h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-4 gap-6 p-6 text-foreground">

      {/* ================= LEFT: RECIPE ================= */}
      <section className="lg:col-span-3 flex flex-col overflow-hidden rounded-2xl bg-card shadow">

        <img
          src={thumb}
          alt={name}
          className="w-full h-80 object-cover"
        />

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl font-bold">{name}</h1>
              <p className="text-muted-foreground mt-1">
                {recipe.strArea || "International"} • {recipe.strCategory}
              </p>
            </div>

            <button
              onClick={handleFavorite}
              className="px-4 py-2 rounded-full bg-primary text-primary-foreground shadow"
            >
              ❤️ Favorite
            </button>
          </div>

          {/* NUTRITION */}
          {nutritionData?.nutrition && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-muted/40 p-4 rounded-xl">
              <NutritionBox label="Calories" value={`${nutritionData.nutrition.calories} kcal`} />
              <NutritionBox label="Protein" value={`${nutritionData.nutrition.protein} g`} />
              <NutritionBox label="Carbs" value={`${nutritionData.nutrition.carbs} g`} />
              <NutritionBox label="Fat" value={`${nutritionData.nutrition.fat} g`} />
            </div>
          )}

          {/* INGREDIENTS */}
          {ingredients.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">🧺 Ingredients</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ingredients.map((item, index) => (
                  <label
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition
                      ${checked[index]
                        ? "bg-green-50 line-through text-muted-foreground"
                        : "hover:bg-muted"
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!checked[index]}
                      onChange={() => toggleIngredient(index)}
                      className="accent-primary"
                    />
                    <span>
                      <strong>{item.name}</strong>
                      {item.measure && (
                        <span className="text-sm text-muted-foreground">
                          {" "}— {item.measure}
                        </span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* COOKING STEPS */}
          {recipe.strInstructions && (
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">👩‍🍳 Let’s Cook</h2>

              {parseInstructions(recipe.strInstructions).map((step, index) => (
                <div key={index} className="flex gap-4 bg-background p-4 rounded-xl shadow-sm">
                  <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-white font-bold">
                    {index + 1}
                  </div>
                  <p>{step}.</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ================= RIGHT: SUGGESTED ================= */}
      <aside className="hidden lg:flex flex-col overflow-hidden rounded-2xl bg-card shadow">
        <div className="p-4 border-b font-semibold">
          You may also like 🍽️
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {suggestionsData?.results?.map((item) => (
            <Link
              key={`${item.type}-${item.id}`}
              to={`/dashboard/recipes/${item.id}?type=${item.type}`}
              className="block rounded-xl overflow-hidden hover:bg-muted"
            >
              <img src={item.thumbnail} className="h-28 w-full object-cover" />
              <div className="p-3 text-sm font-medium">{item.name}</div>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}