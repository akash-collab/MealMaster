// client/src/pages/planner/MealPlanner.jsx
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMealPlan, saveMealPlan } from "../../services/mealPlanService";
import { saveGroceryList } from "../../services/groceryService";
import toast from "react-hot-toast";
import { extractIngredients } from "../../utils/ingredientParser";
import { categorizeIngredient } from "../../utils/ingredientCategories";
import { normalizeIngredientName } from "../../utils/ingredientNormalize";

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

const makeEmptyDays = () => {
  const empty = { breakfast: null, lunch: null, dinner: null };
  return DAYS.reduce((obj, d) => ({ ...obj, [d]: { ...empty } }), {});
};

const getCurrentWeekStart = () => {
  const today = new Date();
  const weekday = today.getDay(); // 0 = Sun
  const diff = (weekday === 0 ? -6 : 1) - weekday; // shift so Monday is first
  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + diff
  );
};

const formatDate = (date) => date.toISOString().slice(0, 10);

const searchRecipes = async (query) => {
  if (!query) return { meals: [] };

  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/recipes/search?q=${encodeURIComponent(
      query
    )}`
  );
  if (!res.ok) throw new Error("Search failed");
  return res.json();
};

export const generateGroceryFromDays = async (days) => {
  const map = new Map();

  for (const day of Object.keys(days)) {
    const d = days[day];
    if (!d) continue;

    for (const mealType of MEALS) {
      const meal = d[mealType];
      if (!meal?.recipeId) continue;

      const res = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.recipeId}`
      );
      const data = await res.json();
      if (!data.meals) continue;

      const details = data.meals[0];
      const ingredients = extractIngredients(details);

      ingredients.forEach((ing) => {
        const key = normalizeIngredientName(ing.name);
        const category = categorizeIngredient(ing.name);

        if (!map.has(key)) {
          map.set(key, {
            _id: crypto.randomUUID(),
            name: ing.name,
            quantity: ing.quantity,
            unit: "",
            checked: false,
            category,
          });
        } else {
          const existing = map.get(key);
          existing.quantity += ` + ${ing.quantity}`;
        }
      });
    }
  }

  return Array.from(map.values());
};

export default function MealPlanner() {
  const queryClient = useQueryClient();

  const weekStartDate = useMemo(getCurrentWeekStart, []);
  const weekStartStr = useMemo(
    () => formatDate(weekStartDate),
    [weekStartDate]
  );

  const [days, setDays] = useState(makeEmptyDays());
  const [activeSlot, setActiveSlot] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [aiMode, setAiMode] = useState(null);

  // Fetch meal plan
  const { data, isLoading } = useQuery({
    queryKey: ["mealplan", weekStartStr],
    queryFn: () => fetchMealPlan(weekStartStr),
  });

  // Hydrate from backend
  useEffect(() => {
    if (data?.plan?.days) {
      setDays((prev) => ({ ...makeEmptyDays(), ...data.plan.days }));
    }
  }, [data]);

  // Search
  const {
    data: searchData,
    isLoading: isSearching,
    refetch: refetchSearch,
  } = useQuery({
    queryKey: ["planner-search", searchTerm],
    queryFn: () => searchRecipes(searchTerm),
    enabled: !!searchTerm,
  });

  const meals = searchData?.meals || [];

  // Save meal plan
  const saveMutation = useMutation({
    mutationFn: () => saveMealPlan(weekStartStr, days),
    onSuccess: () => {
      queryClient.invalidateQueries(["mealplan", weekStartStr]);
      toast.success("Meal plan saved! ✅");
    },
    onError: () => toast.error("Failed to save meal plan"),
  });

  // Build grocery list
  const groceryMutation = useMutation({
    mutationFn: async () => {
      const items = await generateGroceryFromDays(days);
      return saveGroceryList(items);
    },
    onSuccess: () => toast.success("Grocery list updated from ingredients! 🛒"),
    onError: () => toast.error("Failed to generate grocery list"),
  });

  const handleSelectRecipe = (meal) => {
    if (!activeSlot) return;

    setDays((prev) => {
      const updated = { ...prev };
      updated[activeSlot.day] = {
        ...prev[activeSlot.day],
        [activeSlot.mealType]: {
          recipeId: meal.idMeal,
          name: meal.strMeal,
          thumbnail: meal.strMealThumb,
        },
      };
      return updated;
    });
  };

  const handleClearSlot = (day, mealType) => {
    setDays((prev) => ({
      ...prev,
      [day]: { ...prev[day], [mealType]: null },
    }));
  };

  const handleAiPreset = (mode) => {
    setAiMode(mode);

    const presetMap = {
      highProtein: "chicken",
      quick: "pasta",
      veg: "vegetarian",
    };

    const term = presetMap[mode] || "";
    setSearchTerm(term);
    if (mode) refetchSearch();
  };

  if (isLoading) return <p>Loading weekly plan...</p>;

  return (
    <div className="flex gap-6">
      {/* LEFT: Planner Grid */}
      <div className="flex-1 space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="text-3xl font-bold">Meal Planner</h1>
            <p className="text-muted-foreground text-sm">
              Week starting{" "}
              <span className="font-medium">{weekStartStr}</span>
            </p>
          </div>

          <div className="flex gap-3">
            {/* Save plan button – theme aware */}
            <button
              onClick={() => saveMutation.mutate()}
              className="px-4 py-2 rounded-full bg-green-500 text-primary-foreground text-sm font-semibold shadow-md hover:-translate-y-0.5 transition"
            >
              Save Plan
            </button>

            {/* Generate grocery list – theme aware outline */}
            <button
              onClick={() => groceryMutation.mutate()}
              className="px-4 py-2 rounded-full bg-card text-card-foreground text-sm font-semibold border border-border shadow-sm hover:-translate-y-0.5 transition"
            >
              Generate Grocery List
            </button>
          </div>
        </div>

        {/* Planner Table */}
        <div className="overflow-x-auto rounded-2xl bg-card shadow-sm border border-border">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-muted/60">
                <th className="p-3 text-left text-xs font-semibold text-muted-foreground border-b border-border">
                  Day
                </th>
                {MEALS.map((meal) => (
                  <th
                    key={meal}
                    className="p-3 text-left text-xs font-semibold text-muted-foreground border-b border-border capitalize"
                  >
                    {meal}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {DAYS.map((day) => (
                <tr key={day} className="hover:bg-muted/40">
                  <td className="p-3 text-sm font-semibold border-b border-border">
                    {day}
                  </td>

                  {MEALS.map((mealType) => {
                    const slot = days[day][mealType];
                    const isActive =
                      activeSlot?.day === day &&
                      activeSlot?.mealType === mealType;

                    return (
                      <td
                        key={mealType}
                        className="p-3 border-b border-border align-top cursor-pointer"
                        onClick={() => setActiveSlot({ day, mealType })}
                      >
                        <div
                          className={`relative rounded-2xl border transition ${
                            slot
                              ? "bg-card shadow-sm hover:shadow-lg"
                              : "border-dashed border-border bg-background/40 hover:bg-background/70"
                          } ${isActive ? "ring-2 ring-primary/80" : ""}`}
                        >
                          {slot ? (
                            <div className="flex items-center gap-3 p-3">
                              <img
                                src={slot.thumbnail}
                                alt={slot.name}
                                className="w-12 h-12 rounded-xl object-cover"
                              />

                              <div className="flex-1">
                                <p className="text-sm font-semibold truncate">
                                  {slot.name}
                                </p>
                                <p className="text-xs text-muted-foreground capitalize">
                                  {mealType}
                                </p>
                              </div>

                              <button
                                className="absolute top-2 right-2 bg-card text-card-foreground rounded-full w-7 h-7 flex items-center justify-center text-xs shadow hover:bg-destructive/10"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleClearSlot(day, mealType);
                                }}
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center p-6">
                              <span className="text-xs text-muted-foreground">
                                + Add meal
                              </span>
                            </div>
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

      {/* RIGHT: Search & AI */}
      <div className="w-80 space-y-4">
        {/* AI suggestions card */}
        <div className="rounded-2xl bg-card text-card-foreground shadow-sm border border-border p-4">
          <h2 className="text-sm font-semibold mb-2">AI Suggestions</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Choose a preset or search manually.
          </p>

          <div className="flex flex-wrap gap-2">
            {["highProtein", "quick", "veg"].map((mode) => (
              <button
                key={mode}
                onClick={() => handleAiPreset(mode)}
                className={`
                  px-3 py-1 rounded-full text-xs border border-border
                  bg-card text-card-foreground hover:bg-muted
                  ${
                    aiMode === mode
                      ? "bg-primary text-primary-foreground border-primary"
                      : ""
                  }
                `}
              >
                {mode === "highProtein"
                  ? "High protein"
                  : mode === "quick"
                  ? "Quick meals"
                  : "Veg friendly"}
              </button>
            ))}

            <button
              onClick={() => handleAiPreset(null)}
              className="px-3 py-1 rounded-full text-xs border border-border bg-card text-card-foreground hover:bg-muted"
            >
              Clear
            </button>
          </div>
        </div>

        {/* SEARCH RESULTS */}
        <div className="rounded-2xl bg-card text-card-foreground shadow-sm border border-border p-4 h-[520px] flex flex-col">
          <h2 className="text-sm font-semibold mb-2">Search recipes</h2>

          <input
            type="text"
            placeholder="Search meals (e.g. chicken curry)"
            className="w-full border border-border rounded-full px-3 py-2 text-sm mb-3 outline-none bg-background text-foreground focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="flex-1 overflow-y-auto space-y-3">
            {isSearching && (
              <p className="text-xs text-muted-foreground">Searching…</p>
            )}

            {!isSearching && meals.length === 0 && searchTerm && (
              <p className="text-xs text-muted-foreground">
                No recipes found.
              </p>
            )}

            {!searchTerm && (
              <p className="text-xs text-muted-foreground">
                Start typing or use an AI preset above.
              </p>
            )}

            {meals.map((meal) => (
              <button
                key={meal.idMeal}
                onClick={() => handleSelectRecipe(meal)}
                className="w-full text-left rounded-2xl border border-border bg-card text-card-foreground shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition flex gap-3 p-2"
              >
                <img
                  src={meal.strMealThumb}
                  alt={meal.strMeal}
                  className="w-14 h-14 rounded-xl object-cover"
                />

                <div className="flex-1">
                  <p className="text-xs font-semibold truncate">
                    {meal.strMeal}
                  </p>

                  {meal.strArea && (
                    <p className="text-[10px] text-muted-foreground">
                      {meal.strArea} • {meal.strCategory}
                    </p>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}