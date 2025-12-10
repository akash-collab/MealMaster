// src/pages/recipes/RecipeDetails.jsx
import { useParams, useLocation } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { addFavorite } from "../../services/favoriteService";

export default function RecipeDetails() {
  const { id } = useParams();
  const location = useLocation();
  const type = new URLSearchParams(location.search).get("type") || "meal";

  const fetchDetails = async () => {
    const url =
      type === "drink"
        ? `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${id}`
        : `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`;

    const res = await fetch(url);
    const data = await res.json();
    return type === "drink" ? data.drinks?.[0] : data.meals?.[0];
  };

  const { data: details, isLoading } = useQuery({
    queryKey: ["recipe-details", id, type],
    queryFn: fetchDetails,
  });

  // Suggested drink (only for meals)
  const { data: drinkData } = useQuery({
    queryKey: ["suggested-drink"],
    queryFn: async () => {
      const res = await fetch("https://www.thecocktaildb.com/api/json/v1/1/random.php");
      return res.json();
    },
    enabled: type === "meal",
  });

  const mutation = useMutation({
    mutationFn: addFavorite,
    onSuccess: () => toast.success("Added to favorites ❤️"),
  });

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;
  if (!details) return <p className="text-muted-foreground">Recipe not found.</p>;

  const name = details.strMeal || details.strDrink;
  const thumb = details.strMealThumb || details.strDrinkThumb;

  const handleFavorite = () => {
    mutation.mutate({
      recipeId: id,
      name,
      thumbnail: thumb,
      type,
    });
  };

  return (
    <div className="p-6 space-y-8 text-foreground">

      {/* MAIN CARD */}
      <div className="bg-card text-card-foreground rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden max-w-4xl">
        <img src={thumb} className="w-full max-h-[380px] object-cover" alt={name} />

        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start">

            {/* Title */}
            <div>
              <h1 className="text-3xl font-bold">{name}</h1>
              <p className="text-muted-foreground mt-1">
                {details.strArea || "International"} • {details.strCategory}
              </p>
            </div>

            {/* Favorite Button */}
            <button
              onClick={handleFavorite}
              className="
                px-4 py-2 rounded-full
                bg-primary text-primary-foreground
                shadow hover:shadow-lg hover:bg-primary/90 transition
              "
            >
              ❤️ Add to Favorites
            </button>
          </div>

          {/* Instructions Section */}
          {details.strInstructions && (
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Instructions</h2>
              <p className="whitespace-pre-line text-foreground/90">
                {details.strInstructions}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Suggested Drinks Section */}
      {drinkData?.drinks && type === "meal" && (
        <div className="max-w-md">
          <h3 className="text-xl font-semibold mb-3">Suggested Drink 🍹</h3>

          {drinkData.drinks.slice(0, 2).map((drink) => (
            <div
              key={drink.idDrink}
              className="
                bg-card text-card-foreground
                rounded-2xl shadow hover:shadow-lg transition 
                flex gap-4 mb-4 overflow-hidden
              "
            >
              <img
                src={drink.strDrinkThumb}
                alt={drink.strDrink}
                className="w-24 h-24 object-cover"
              />

              <div className="p-4">
                <p className="font-semibold">{drink.strDrink}</p>
                <p className="text-muted-foreground text-sm">From CocktailDB</p>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}