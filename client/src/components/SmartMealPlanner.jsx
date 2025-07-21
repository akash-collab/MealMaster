import React, { useEffect, useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragOverlay,
} from "@dnd-kit/core";
import API from "../services/api";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const mealTypes = ["Breakfast", "Lunch", "Dinner"];

function DraggableMeal({ meal }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `meal-${meal.id}`,
    data: meal,
  });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    zIndex: 100,
    position: transform ? "absolute" : "relative",
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className="px-3 py-2 bg-emerald-500 text-white rounded-lg shadow cursor-move text-sm font-medium hover:bg-emerald-600 transition mb-2"
    >
      {meal.name}
    </div>
  );
}

function MealSlot({ id, meal }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`h-20 w-full border-2 border-dashed flex items-center justify-center text-sm rounded-md transition 
        ${isOver ? "bg-emerald-100 border-emerald-400" : "bg-gray-100"}
      `}
    >
      {meal ? meal.name : <span className="text-gray-400">Drop here</span>}
    </div>
  );
}

export default function SmartMealPlanner() {
  const [userMeals, setUserMeals] = useState([]);
  const [mealPlan, setMealPlan] = useState({});
  const [activeMeal, setActiveMeal] = useState(null);

  useEffect(() => {
    const fetchUserMeals = async () => {
      try {
        const res = await API.get("/meals");
        const data = res.data.map((meal) => ({
          id: meal._id,
          name: meal.title,
        }));
        setUserMeals(data);
      } catch (err) {
        console.error("Failed to fetch user meals:", err);
      }
    };

    const fetchMealPlan = async () => {
      try {
        const res = await API.get("/meal-plan");
        setMealPlan(res.data.mealPlan);
      } catch (err) {
        console.error("Failed to fetch meal plan:", err);
      }
    };

    fetchUserMeals();
    fetchMealPlan();
  }, []);

  const handleDragStart = (event) => {
    setActiveMeal(event.active.data.current);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (over && active) {
      const droppedMeal = active.data.current;
      const updatedPlan = {
        ...mealPlan,
        [over.id]: droppedMeal,
      };
      setMealPlan(updatedPlan);

      try {
        await API.put("/meal-plan", { mealPlan: updatedPlan });
      } catch (err) {
        console.error("Failed to save meal plan:", err);
      }
    }
    setActiveMeal(null);
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="bg-white border shadow-lg rounded-lg p-4 max-h-[80vh] overflow-y-auto">
          <h2 className="text-lg font-bold text-emerald-700 mb-3">Your Meals</h2>
          {userMeals.map((meal) => (
            <DraggableMeal key={meal.id} meal={meal} />
          ))}
        </div>

        {/* Weekly Grid */}
        <div className="lg:col-span-3 overflow-x-auto">
          <div className="grid grid-cols-8 border rounded-lg shadow overflow-hidden">
            {/* Header Row */}
            <div className="bg-emerald-600 text-white text-center font-semibold py-2">
              Meal Type
            </div>
            {days.map((day) => (
              <div
                key={day}
                className="bg-emerald-600 text-white text-center font-semibold py-2"
              >
                {day}
              </div>
            ))}

            {/* Meal Rows */}
            {mealTypes.map((mealType) => (
              <React.Fragment key={mealType}>
                <div className="bg-gray-100 text-center font-semibold py-3">
                  {mealType}
                </div>
                {days.map((day) => {
                  const slotId = `${day}-${mealType}`;
                  return <MealSlot key={slotId} id={slotId} meal={mealPlan[slotId]} />;
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeMeal && (
          <div className="px-3 py-2 bg-emerald-400 text-white rounded-lg shadow text-sm font-semibold">
            {activeMeal.name}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}