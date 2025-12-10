import { useQuery } from "@tanstack/react-query";
import { getFavorites } from "../../services/favoriteService";
import { Link } from "react-router-dom";

export default function Favorites() {
  const { data, isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: getFavorites,
  });

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  const items = data?.favorites || [];

  return (
    <div className="text-foreground">
      <h1 className="text-3xl font-bold mb-6">Your Favorites ❤️</h1>

      {items.length === 0 && (
        <p className="text-muted-foreground">No favorites yet.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {items.map((f) => (
          <Link
            key={f._id}
            to={`/dashboard/recipes/${f.recipeId}?type=${f.type}`}
            className="
              rounded-2xl overflow-hidden 
              bg-card text-card-foreground 
              border border-border 
              shadow hover:shadow-xl transition
            "
          >
            <img
              src={f.thumbnail}
              alt={f.name}
              className="h-40 w-full object-cover"
            />

            <div className="p-3">
              <p className="font-semibold">{f.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {f.type}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}