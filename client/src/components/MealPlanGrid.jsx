import React, { useEffect, useState } from "react";
import API from "../services/api";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const mealTypes = ["Breakfast", "Lunch", "Dinner"];

export default function MealPlanGrid() {
  const [mealPlan, setMealPlan] = useState({});

  useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        const res = await API.get("/meal-plan");
        setMealPlan(res.data.mealPlan || {});
      } catch (err) {
        console.error("Failed to load meal plan:", err);
      }
    };

    fetchMealPlan();
  }, []);

  return (
    <div className="bg-white shadow-md rounded-lg p-4 w-full">
      <h2 className="text-xl font-bold mb-4 text-green-700">Weekly Meal Plan</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr>
              <th className="border p-2 bg-gray-100 text-left">Meal</th>
              {days.map((day) => (
                <th key={day} className="border p-2 bg-gray-100 text-center">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mealTypes.map((type) => (
              <tr key={type}>
                <td className="border p-2 font-medium">{type}</td>
                {days.map((day) => {
                  const meal = mealPlan[`${day}-${type}`];
                  return (
                    <td
                      key={`${day}-${type}`}
                      className="border p-2 text-center text-sm"
                    >
                      {meal?.name || <span className="text-gray-400">—</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}