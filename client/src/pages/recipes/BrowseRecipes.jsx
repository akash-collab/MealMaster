// src/pages/recipes/BrowseRecipes.jsx
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  searchRecipes,
  getCuratedMeals,
  getCuratedDrinks,
} from "../../services/recipeService";
import RecipeCard from "../../components/RecipeCard";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function BrowseRecipes() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();

  // 🔍 search query
  const {
    data: searchData,
    isLoading: isSearchLoading,
  } = useQuery({
    queryKey: ["recipes", query],
    queryFn: () => searchRecipes(query),
    enabled: query.trim().length > 0,
  });

  // curated meals
  const { data: curatedMealsData, isLoading: isCuratedMealsLoading } = useQuery({
    queryKey: ["curated-meals"],
    queryFn: getCuratedMeals,
  });

  // curated drinks
  const {
    data: curatedDrinksData,
    isLoading: isCuratedDrinksLoading,
  } = useQuery({
    queryKey: ["curated-drinks"],
    queryFn: getCuratedDrinks,
  });

  const meals = searchData?.meals || [];
  const curatedMeals = curatedMealsData?.meals || [];
  const curatedDrinks = curatedDrinksData?.drinks || [];

  const hasSearch = query.trim().length > 0;

  const handleChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim()) setSearchParams({ q: value });
    else setSearchParams({});
  };

  return (
    <div className="p-6 space-y-8 text-foreground">

      <h1 className="text-3xl font-bold mb-2">Browse Recipes</h1>

      {/* SEARCH INPUT */}
      <input
        type="text"
        placeholder="Search meals (e.g. chicken, pasta, curry)"
        value={query}
        onChange={handleChange}
        className="
          w-full max-w-xl rounded-lg px-4 py-2 shadow-sm border border-border 
          bg-card text-foreground
          focus:outline-none focus:ring-2 focus:ring-primary
        "
      />

      {/* SEARCH RESULTS */}
      {hasSearch && (
        <div className="space-y-4">
          {isSearchLoading && (
            <p className="text-muted-foreground">Searching...</p>
          )}

          {!isSearchLoading && meals.length === 0 && (
            <p classistaName="text-muted-foreground mt-2">
              No meals found. Try another keyword.
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {meals.map((meal) => (
              <RecipeCard
                key={meal.idMeal}
                meal={{
                  recipeId: meal.idMeal,
                  name: meal.strMeal,
                  thumbnail: meal.strMealThumb,
                }}
                linkTo={`/dashboard/recipes/${meal.idMeal}?type=meal`}
              />
            ))}
          </div>
        </div>
      )}

      {/* DEFAULT STATE */}
      {!hasSearch && (
        <>
          {/* curated meals */}
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold">Popular Recipes 🍽️</h2>

            {isCuratedMealsLoading && (
              <p className="text-muted-foreground">Loading recipes...</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {curatedMeals.map((meal) => (
                <RecipeCard
                  key={meal.id}
                  meal={{
                    recipeId: meal.id,
                    name: meal.name,
                    thumbnail: meal.thumbnail,
                  }}
                  linkTo={`/dashboard/recipes/${meal.id}?type=meal`}
                />
              ))}
            </div>
          </section>

          {/* curated drinks */}
          <section className="space-y-3">
            <h2 className="text-2xl font-semibold mt-6">Popular Drinks 🥤</h2>

            {isCuratedDrinksLoading && (
              <p className="text-muted-foreground">Loading drinks...</p>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {curatedDrinks.map((drink) => (
                <div
                  key={drink.id}
                  onClick={() =>
                    navigate(`/dashboard/recipes/${drink.id}?type=drink`)
                  }
                  className="
                    cursor-pointer rounded-2xl overflow-hidden
                    bg-card text-card-foreground
                    shadow-md hover:shadow-xl hover:scale-[1.02]
                    transition-all duration-200
                  "
                >
                  <img
                    src={drink.thumbnail}
                    alt={drink.name}
                    className="w-full h-48 object-cover"
                  />

                  <div className="p-4">
                    <h3 className="font-semibold text-lg truncate text-foreground">
                      {drink.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Cocktail • Tap to view
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}