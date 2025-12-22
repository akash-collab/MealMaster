// src/pages/recipes/BrowseRecipes.jsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { browseRecipes } from "../../services/recipeService";
import RecipeCard from "../../components/RecipeCard";

export default function BrowseRecipes() {
  const [filters, setFilters] = useState({
    type: "all",
    diet: "",
    sort: "latest",
    minCalories: "",
    maxCalories: "",
    q: "",
    page: 1,
    limit: 9,
  });

  const { data, isLoading, isError } = useQuery({
    queryKey: ["browse-recipes", filters],
    queryFn: () => browseRecipes(filters),
    keepPreviousData: true,
  });

  const recipes = data?.results || [];
  const totalPages = data?.totalPages || 1;

  const updateFilter = (key, value) => {
    setFilters((f) => ({
      ...f,
      [key]: value,
      page: 1,
    }));
  };

  const jumpToPage = (value) => {
    let pageNum = Number(value);
    if (Number.isNaN(pageNum)) return;
    pageNum = Math.max(1, Math.min(pageNum, totalPages));
    setFilters((f) => ({ ...f, page: pageNum }));
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col p-4 text-foreground">
      {/* ---------- HEADER ---------- */}
      <div className="shrink-0 space-y-3">
        <h1 className="text-2xl font-bold">Browse Recipes</h1>

        {/* SEARCH BAR */}
        <input
          className="border rounded-lg px-3 py-2 bg-card col-span-2 md:col-span-5"
          placeholder="Search by recipe name…"
          value={filters.q}
          onChange={(e) => updateFilter("q", e.target.value)}
        />

        {/* FILTER BAR */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <select
            className="border rounded-lg px-3 py-2 bg-card"
            value={filters.type}
            onChange={(e) => updateFilter("type", e.target.value)}
          >
            <option value="all">All</option>
            <option value="meal">Meals</option>
            <option value="drink">Drinks</option>
          </select>

          <select
            className="border rounded-lg px-3 py-2 bg-card"
            value={filters.diet}
            onChange={(e) => updateFilter("diet", e.target.value)}
          >
            <option value="">All Diets</option>
            <option value="veg">Veg</option>
            <option value="keto">Keto</option>
            <option value="non-veg">Non-Veg</option>
          </select>

          <select
            className="border rounded-lg px-3 py-2 bg-card"
            value={filters.sort}
            onChange={(e) => updateFilter("sort", e.target.value)}
          >
            <option value="latest">Latest</option>
            <option value="calories_asc">Calories ↑</option>
            <option value="calories_desc">Calories ↓</option>
            <option value="popularity">Popularity</option>
          </select>

          <input
            className="border rounded-lg px-3 py-2 bg-card"
            placeholder="Min Calories"
            value={filters.minCalories}
            onChange={(e) => updateFilter("minCalories", e.target.value)}
          />

          <input
            className="border rounded-lg px-3 py-2 bg-card"
            placeholder="Max Calories"
            value={filters.maxCalories}
            onChange={(e) => updateFilter("maxCalories", e.target.value)}
          />
        </div>
      </div>

      {/* ---------- CONTENT (SCROLLABLE) ---------- */}
      <div className="flex-1 overflow-y-auto mt-4 pr-1">
        {isLoading && <p className="text-muted-foreground">Loading recipes…</p>}
        {isError && <p className="text-destructive">Failed to load recipes.</p>}
        {!isLoading && recipes.length === 0 && (
          <p className="text-muted-foreground">No recipes found.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
          {recipes.map((item) => (
            <RecipeCard
              key={`${item.type}-${item.id}`}
              meal={{
                recipeId: item.id,
                name: item.name,
                thumbnail: item.thumbnail,
              }}
              linkTo={`/dashboard/recipes/${item.id}?type=${item.type}`}
            />
          ))}
        </div>
      </div>

      {/* ---------- PAGINATION (FIXED FOOTER) ---------- */}
      {totalPages > 1 && (
        <div className="shrink-0 border-t pt-3 flex justify-center items-center gap-4">
          <button
            disabled={filters.page === 1}
            onClick={() =>
              setFilters((f) => ({ ...f, page: f.page - 1 }))
            }
            className="px-4 py-2 rounded-lg border disabled:opacity-50"
          >
            ⬅ Prev
          </button>

          <input
            type="number"
            min={1}
            max={totalPages}
            value={filters.page}
            onChange={(e) => jumpToPage(e.target.value)}
            className="w-16 text-center rounded-lg border px-2 py-2 bg-card"
          />

          <span className="text-sm text-muted-foreground">
            / {totalPages}
          </span>

          <button
            disabled={filters.page === totalPages}
            onClick={() =>
              setFilters((f) => ({ ...f, page: f.page + 1 }))
            }
            className="px-4 py-2 rounded-lg border disabled:opacity-50"
          >
            Next ➡
          </button>
        </div>
      )}
    </div>
  );
}