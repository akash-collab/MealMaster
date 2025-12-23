import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import { fetchMealPlan, saveMealPlan } from "../../services/mealPlanService";
import { saveGroceryList } from "../../services/groceryService";
import { getRecipeNutritionCached } from "../../services/recipeService";
import { extractIngredients } from "../../utils/ingredientParser";
import { categorizeIngredient } from "../../utils/ingredientCategories";
import { normalizeIngredientName } from "../../utils/ingredientNormalize";

/* ================= CONSTANTS ================= */

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MEALS = ["breakfast", "lunch", "dinner"];
const DAILY_CAL_TARGET = 2000;

const makeEmptyDays = () => {
  const empty = { breakfast: null, lunch: null, dinner: null };
  return DAYS.reduce((acc, d) => ({ ...acc, [d]: { ...empty } }), {});
};

const getCurrentWeekStart = () => {
  const today = new Date();
  const weekday = today.getDay();
  const diff = (weekday === 0 ? -6 : 1) - weekday;
  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + diff
  );
};

const formatDate = (date) => date.toISOString().slice(0, 10);

/* ================= SEARCH ================= */

const searchRecipes = async (query) => {
  if (!query || query.length < 3) return { meals: [] };

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/recipes/search?q=${encodeURIComponent(
      query
    )}`
  );

  if (!res.ok) throw new Error("Search failed");
  return res.json();
};

/* ================= UI COMPONENTS ================= */

function CalorieRing({ value, target }) {
  const percent = Math.min(100, Math.round((value / target) * 100));
  const stroke = 10;
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="flex items-center gap-4">
      <svg width="110" height="110" className="-rotate-90">
        <circle
          cx="55"
          cy="55"
          r={radius}
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-muted"
          fill="transparent"
        />
        <circle
          cx="55"
          cy="55"
          r={radius}
          stroke="url(#grad)"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          fill="transparent"
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="grad">
            <stop offset="0%" stopColor="#22c55e" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
        </defs>
      </svg>

      <div>
        <p className="text-xs text-muted-foreground">Today</p>
        <p className="text-2xl font-bold">
          {Math.round(value)}
          <span className="text-sm text-muted-foreground">
            /{target} kcal
          </span>
        </p>
        <p className="text-xs text-muted-foreground">{percent}% of goal</p>
      </div>
    </div>
  );
}

/* ================= MAIN ================= */

export default function MealPlanner() {
  const queryClient = useQueryClient();

  const weekStart = useMemo(() => formatDate(getCurrentWeekStart()), []);
  const [days, setDays] = useState(makeEmptyDays());
  const [activeSlot, setActiveSlot] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [aiMode, setAiMode] = useState(null);

  /* -------- debounce search -------- */
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  /* ================= MEAL PLAN ================= */

  const { data, isLoading } = useQuery({
    queryKey: ["mealplan", weekStart],
    queryFn: () => fetchMealPlan(weekStart),
  });

  useEffect(() => {
    if (data?.plan?.days) {
      setDays({ ...makeEmptyDays(), ...data.plan.days });
    }
  }, [data]);

  /* ================= SEARCH RESULTS ================= */

  const { data: searchData, isLoading: isSearching } = useQuery({
    queryKey: ["planner-search", debouncedSearch],
    queryFn: () => searchRecipes(debouncedSearch),
    enabled: debouncedSearch.length >= 3,
  });

  const meals = searchData?.meals || [];

  /* ================= NUTRITION ================= */

  const recipeIds = useMemo(() => {
    const ids = new Set();
    DAYS.forEach((d) =>
      MEALS.forEach((m) => {
        const r = days[d]?.[m];
        if (r?.recipeId) ids.add(r.recipeId);
      })
    );
    return [...ids];
  }, [days]);

  const nutritionQuery = useQuery({
    queryKey: ["planner-nutrition", recipeIds],
    enabled: recipeIds.length > 0,
    queryFn: async () => {
      const entries = await Promise.all(
        recipeIds.map(async (id) => {
          const res = await getRecipeNutritionCached(id);
          return [id, res.nutrition];
        })
      );
      return Object.fromEntries(entries);
    },
  });

  const totals = useMemo(() => {
    let calories = 0, protein = 0, carbs = 0, fat = 0;
    if (!nutritionQuery.data) return { calories, protein, carbs, fat };

    DAYS.forEach((d) =>
      MEALS.forEach((m) => {
        const slot = days[d]?.[m];
        const n = nutritionQuery.data[slot?.recipeId];
        if (!n) return;
        calories += n.calories || 0;
        protein += n.protein || 0;
        carbs += n.carbs || 0;
        fat += n.fat || 0;
      })
    );

    return { calories, protein, carbs, fat };
  }, [days, nutritionQuery.data]);

  /* ================= ACTIONS ================= */

  const saveMutation = useMutation({
    mutationFn: () => saveMealPlan(weekStart, days),
    onSuccess: () => toast.success("Meal plan saved ✅"),
  });

  const groceryMutation = useMutation({
    mutationFn: async () => {
      const map = new Map();
      for (const d of DAYS) {
        for (const m of MEALS) {
          const slot = days[d]?.[m];
          if (!slot?.recipeId) continue;

          const res = await fetch(
            `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${slot.recipeId}`
          );
          const data = await res.json();
          const ingredients = extractIngredients(data.meals[0]);

          ingredients.forEach((ing) => {
            const key = normalizeIngredientName(ing.name);
            const cat = categorizeIngredient(ing.name);
            if (!map.has(key)) {
              map.set(key, {
                _id: crypto.randomUUID(),
                name: ing.name,
                quantity: ing.quantity,
                checked: false,
                category: cat,
              });
            }
          });
        }
      }
      return saveGroceryList([...map.values()]);
    },
    onSuccess: () => toast.success("Grocery list updated 🛒"),
  });

  const handleSelectRecipe = (meal) => {
    if (!activeSlot) return;
    setDays((prev) => ({
      ...prev,
      [activeSlot.day]: {
        ...prev[activeSlot.day],
        [activeSlot.mealType]: {
          recipeId: meal.idMeal,
          name: meal.strMeal,
          thumbnail: meal.strMealThumb,
        },
      },
    }));
  };

  if (isLoading) return <p className="p-6">Loading…</p>;

  /* ================= RENDER ================= */

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-background">

      {/* HEADER */}
      <header className="px-6 py-4 border-b bg-card flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Meal Planner</h1>
          <p className="text-xs text-muted-foreground">Week of {weekStart}</p>
        </div>

        <div className="flex items-center gap-6">
          <CalorieRing value={totals.calories} target={DAILY_CAL_TARGET} />
          <div className="text-sm text-muted-foreground">
            Protein {Math.round(totals.protein)}g ·
            Carbs {Math.round(totals.carbs)}g ·
            Fat {Math.round(totals.fat)}g
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => saveMutation.mutate()}
            className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm"
          >
            Save
          </button>
          <button
            onClick={() => groceryMutation.mutate()}
            className="px-4 py-2 rounded-full border text-sm"
          >
            Grocery
          </button>
        </div>
      </header>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT: TABLE */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="rounded-2xl bg-card border overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-muted/60">
                <tr>
                  <th className="p-3 text-left text-xs">Day</th>
                  {MEALS.map((m) => (
                    <th key={m} className="p-3 text-left text-xs capitalize">
                      {m}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DAYS.map((d) => (
                  <tr key={d} className="hover:bg-muted/40">
                    <td className="p-3 text-sm font-medium">{d}</td>
                    {MEALS.map((m) => {
                      const slot = days[d][m];
                      return (
                        <td
                          key={m}
                          className="p-3 cursor-pointer"
                          onClick={() => setActiveSlot({ day: d, mealType: m })}
                        >
                          <div
                            className={`h-20 rounded-xl border flex items-center gap-3 px-3 transition
                            ${activeSlot?.day === d && activeSlot?.mealType === m
                                ? "ring-2 ring-primary border-primary bg-primary/5"
                                : slot
                                  ? "bg-background hover:border-muted-foreground/30"
                                  : "justify-center text-muted-foreground hover:border-muted-foreground/40"
                              }`}
                          >
                            {slot ? (
                              <>
                                <img
                                  src={slot.thumbnail}
                                  alt={slot.name}
                                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                                />

                                <div className="flex-1">
                                  <p className="text-sm font-medium truncate">{slot.name}</p>
                                  <p className="text-xs text-muted-foreground capitalize">{m}</p>
                                </div>
                              </>
                            ) : (
                              <span className="text-xs">+ Add meal</span>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: SEARCH */}
        <aside className="w-[360px] border-l bg-card p-4 flex flex-col">
          <input
            className="px-4 py-2 rounded-full bg-muted text-sm outline-none"
            placeholder="Search meals…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="flex flex-wrap gap-2 mt-3">
            {[
              { label: "High protein", q: "chicken" },
              { label: "Quick", q: "pasta" },
              { label: "Veg", q: "vegetarian" },
            ].map(({ label, q }) => (
              <button
                key={label}
                onClick={() => setSearchTerm(q)}
                className="px-3 py-1 rounded-full border text-xs"
              >
                {label}
              </button>
            ))}
          </div>

          <div className="mt-4 flex-1 overflow-y-auto rounded-xl border">
            {isSearching && (
              <p className="p-3 text-xs text-muted-foreground">Searching…</p>
            )}

            {meals.map((meal) => (
              <button
                key={meal.idMeal}
                onClick={() => handleSelectRecipe(meal)}
                className="w-full flex items-center gap-3 p-3 hover:bg-muted border-b"
              >
                <img
                  src={meal.strMealThumb}
                  alt={meal.strMeal}
                  className="w-10 h-10 rounded-lg object-cover"
                />
                <span className="text-sm truncate">{meal.strMeal}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}