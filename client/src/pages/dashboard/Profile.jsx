import { useQuery } from "@tanstack/react-query";
import { getFavorites } from "../../services/favoriteService";
import { useAuthStore } from "../../store/authStore";
import RecipeCard from "../../components/RecipeCard";

export default function Profile() {
  const token = useAuthStore((s) => s.accessToken);

  const { data, isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: getFavorites,
    enabled: !!token,
  });

  const favorites = data?.favorites || [];

  return (
    <div className="p-6 space-y-6 text-foreground">
      <h1 className="text-3xl font-bold">Your Profile</h1>

      <section>
        <h2 className="text-xl font-semibold mb-3">Your Favorite Recipes ❤️</h2>

        {isLoading && <p className="text-muted-foreground">Loading...</p>}

        {favorites.length === 0 && (
          <p className="text-muted-foreground">
            You haven't saved any recipes yet.
          </p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {favorites.slice(0, 6).map((meal) => (
            <RecipeCard
              key={meal.recipeId}
              meal={meal}
              linkTo={`/dashboard/recipes/${meal.recipeId}?type=${meal.type}`}
            />
          ))}
        </div>

        {favorites.length > 6 && (
          <a
            href="/dashboard/favorites"
            className="text-primary hover:underline mt-2 inline-block"
          >
            View all favorites →
          </a>
        )}
      </section>
    </div>
  );
}