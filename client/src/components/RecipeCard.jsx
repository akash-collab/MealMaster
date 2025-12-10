// src/components/RecipeCard.jsx
export default function RecipeCard({ meal, onRemove, linkTo }) {
  return (
    <div
      className="
        relative rounded-2xl overflow-hidden shadow-md
        hover:shadow-xl hover:scale-[1.02] transition-all duration-200
        cursor-pointer
        bg-card text-card-foreground
      "
    >
      <a href={linkTo}>
        {meal.thumbnail && (
          <img
            src={meal.thumbnail}
            alt={meal.name}
            className="w-full h-48 object-cover"
          />
        )}

        <div className="p-4">
          {/* Title */}
          <h3 className="font-semibold text-lg truncate text-foreground">
            {meal.name}
          </h3>

          {/* View link */}
          <p
            className="
              text-muted-foreground hover:text-primary 
              hover:underline text-sm mt-1 transition
            "
          >
            View Recipe →
          </p>
        </div>
      </a>

      {/* Remove button */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRemove(meal.recipeId);
          }}
          className="
            absolute top-3 right-3 rounded-full p-2
            shadow-md bg-card text-card-foreground
            hover:bg-destructive/20 transition
          "
        >
          ❌
        </button>
      )}
    </div>
  );
}