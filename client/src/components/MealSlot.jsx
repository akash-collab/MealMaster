import { useDroppable } from "@dnd-kit/core";

export default function MealSlot({ day, mealType, meal }) {
  const id = `${day}-${mealType}`;
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`h-20 w-32 p-2 border-2 border-dashed rounded ${
        isOver ? "bg-blue-100" : "bg-gray-100"
      } flex items-center justify-center text-sm text-center`}
    >
      {meal ? meal.name : "Drop here"}
    </div>
  );
}