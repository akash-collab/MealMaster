import React, { useEffect, useState } from "react";
import { CalendarDays, XCircle } from "lucide-react"; 
import API from "../services/api";

export default function MealList() {
  const [meals, setMeals] = useState([]);
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [totalCalories, setTotalCalories] = useState(0);

  // Fetch meals
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const res = await API.get("/meals");
        const data = res.data;
        setMeals(data);
        setFilteredMeals(data);
      } catch (err) {
        console.error("Failed to fetch meals", err);
      }
    };

    fetchMeals();
  }, []);

  // Calculate total calories for current filtered list
  useEffect(() => {
    const total = filteredMeals.reduce(
      (acc, curr) => acc + (curr.calories || 0),
      0
    );
    setTotalCalories(total);
  }, [filteredMeals]);

  // Filter meals by date
  useEffect(() => {
    if (!fromDate || !toDate) {
      setFilteredMeals(meals);
      return;
    }

    const filtered = meals.filter((meal) => {
      const date = new Date(meal.date);
      return (
        date >= new Date(fromDate) && date <= new Date(toDate)
      );
    });
    setFilteredMeals(filtered);
  }, [fromDate, toDate, meals]);

  const handleClear = () => {
    setFromDate("");
    setToDate("");
    setFilteredMeals(meals);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-4xl font-bold text-center text-gray-800 mb-6">
        🍽️ Your Meal History
      </h2>

      {/* Total Calorie Summary */}
      <div className="text-center text-xl font-semibold text-green-700 mb-6">
        Total Calories: <span className="text-green-900">{totalCalories}</span> kcal
      </div>

      {/* Filter */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <CalendarDays className="text-gray-600" size={20} />
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <CalendarDays className="text-gray-600" size={20} />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="border px-3 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          onClick={handleClear}
          className="flex items-center gap-1 bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded-md text-sm font-medium"
        >
          <XCircle size={18} />
          Reset
        </button>
      </div>

      {/* Meal Cards */}
      {filteredMeals.length === 0 ? (
        <div className="text-center text-gray-500">No meals found.</div>
      ) : (
        <ul className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
          {filteredMeals.map((meal) => (
            <li
              key={meal._id}
              className="bg-white bg-opacity-70 backdrop-blur-md p-5 rounded-xl shadow-md transition hover:shadow-xl"
            >
              <div className="flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">{meal.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(meal.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="mt-4 text-right text-green-600 font-bold text-xl">
                  {meal.calories} cal
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}