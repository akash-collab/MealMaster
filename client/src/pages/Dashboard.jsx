// src/pages/Dashboard.jsx
import React, { useEffect, useState, useContext } from "react";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import MealPlan from "../components/SmartMealPlanner";
import { LogOut, BarChart2, Edit2, Trash2 } from "lucide-react";
import API from "../services/api";
import MealPlanGrid from "../components/MealPlanGrid";
import RecipeSearch from "../components/RecipeSearch";

export default function Dashboard() {
    const [meals, setMeals] = useState([]);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        calories: "",
        ingredients: "",
    });
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    const { user, setUser, loadingUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const fetchMeals = async () => {
        try {
            setLoading(true);
            const res = await API.get("/meals");
            setMeals(res.data);
        } catch (err) {
            toast.error("Error fetching meals");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeals();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await API.put(`/meals/${editingId}`, formData);
                toast.success("Meal updated successfully!");
            } else {
                await API.post("/meals", formData);
                toast.success("Meal added successfully!");
            }

            setFormData({
                title: "",
                description: "",
                date: "",
                calories: "",
                ingredients: "",
            });
            setEditingId(null);
            fetchMeals();
        } catch (err) {
            toast.error("Error saving meal");
        }
    };

    const handleEdit = (meal) => {
        setFormData({
            title: meal.title,
            description: meal.description,
            date: meal.date.split("T")[0],
            calories: meal.calories,
            ingredients: meal.ingredients.join(", "),
        });
        setEditingId(meal._id);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this meal?")) {
            try {
                await API.delete(`/meals/${id}`);
                fetchMeals();
                toast.success("Meal deleted successfully!");
            } catch (err) {
                toast.error("Error deleting meal");
            }
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-800">🍱 Your Meal Plans</h1>
                <div className="flex gap-3">
                    <Link
                        to="/meal-planner"
                        className="inline-block bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
                    >
                        Weekly Meal Planner
                    </Link>
                    <button
                        onClick={() => navigate("/meals")}
                        className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded shadow"
                    >
                        <BarChart2 size={18} /> Summary
                    </button>
                    <button
                        onClick={() => {
                            localStorage.removeItem("token");
                            window.location.href = "/login";
                        }}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </div>

            <form
                onSubmit={handleSubmit}
                className="bg-gray-100 p-6 rounded-lg shadow space-y-4"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                        type="text"
                        name="title"
                        placeholder="Meal Title"
                        value={formData.title}
                        onChange={handleChange}
                        className="p-3 rounded border border-gray-300"
                        required
                    />
                    <input
                        type="text"
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleChange}
                        className="p-3 rounded border border-gray-300"
                    />
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                        className="p-3 rounded border border-gray-300"
                        required
                    />
                    <input
                        type="number"
                        name="calories"
                        placeholder="Calories"
                        value={formData.calories}
                        onChange={handleChange}
                        className="p-3 rounded border border-gray-300"
                    />
                    <input
                        type="text"
                        name="ingredients"
                        placeholder="Ingredients (comma-separated)"
                        value={formData.ingredients}
                        onChange={handleChange}
                        className="col-span-1 md:col-span-2 p-3 rounded border border-gray-300"
                    />
                </div>
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded shadow"
                >
                    {editingId ? "Update Meal" : "Add Meal"}
                </button>
            </form>

            <div className="mt-10">
                {loading ? (
                    <p className="text-center text-gray-500">Loading meals...</p>
                ) : meals.length === 0 ? (
                    <p className="text-center text-gray-600">No meals planned yet.</p>
                ) : (
                    <ul className="space-y-4">
                        {meals.map((meal) => (
                            <li
                                key={meal._id}
                                className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row justify-between items-start sm:items-center"
                            >
                                <div className="mb-2 sm:mb-0">
                                    <h2 className="text-xl font-semibold text-gray-800">{meal.title}</h2>
                                    <p className="text-gray-600 text-sm">{meal.description}</p>
                                    <p className="text-sm mt-1">
                                        📅 {new Date(meal.date).toLocaleDateString()} | 🔥 {meal.calories} cal
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        🧂 {meal.ingredients.join(", ")}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(meal)}
                                        className="flex items-center gap-1 bg-yellow-400 hover:bg-yellow-500 px-3 py-1 rounded text-sm"
                                    >
                                        <Edit2 size={16} /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(meal._id)}
                                        className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                                    >
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <RecipeSearch
                onAddToMealPlan={(recipe) => {
                    toast.success(`Added ${recipe.name} to planner!`);

                }}
            />
            <MealPlanGrid />

        </div>
    );
}