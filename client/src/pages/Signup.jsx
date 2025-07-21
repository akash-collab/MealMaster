import React, { useState } from "react";
import API from "../services/api";
import { useNavigate, Link } from "react-router-dom";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    preferences: {
      dietary: "",
      allergies: "",
      fitnessGoals: ""
    }
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["dietary", "allergies", "fitnessGoals"].includes(name)) {
      setFormData({
        ...formData,
        preferences: { ...formData.preferences, [name]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      const res = await API.post("/auth/register", formData);
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setErrorMsg(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <form
        className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md"
        onSubmit={handleSubmit}
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Create your <span className="text-green-600">MealMaster</span> account
        </h2>

        {errorMsg && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm">
            {errorMsg}
          </div>
        )}

        <input
          name="name"
          type="text"
          placeholder="Full Name"
          required
          value={formData.name}
          onChange={handleChange}
          className="w-full px-4 py-2 mb-4 border rounded"
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 mb-4 border rounded"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-2 mb-4 border rounded"
        />

        {/* Dietary Preference Dropdown */}
        <select
          name="dietary"
          required
          value={formData.preferences.dietary}
          onChange={handleChange}
          className="w-full px-4 py-2 mb-4 border rounded"
        >
          <option value="">Select Dietary Preference</option>
          <option value="Vegetarian">Vegetarian</option>
          <option value="Non-Vegetarian">Non-Vegetarian</option>
          <option value="Vegan">Vegan</option>
          <option value="Pescatarian">Pescatarian</option>
          <option value="Other">Other</option>
        </select>

        {/* Allergies Dropdown */}
        <select
          name="allergies"
          required
          value={formData.preferences.allergies}
          onChange={handleChange}
          className="w-full px-4 py-2 mb-4 border rounded"
        >
          <option value="">Select Allergy</option>
          <option value="None">None</option>
          <option value="Nuts">Nuts</option>
          <option value="Dairy">Dairy</option>
          <option value="Gluten">Gluten</option>
          <option value="Shellfish">Shellfish</option>
          <option value="Eggs">Eggs</option>
          <option value="Soy">Soy</option>
          <option value="Other">Other</option>
        </select>

        {/* Fitness Goals Dropdown */}
        <select
          name="fitnessGoals"
          required
          value={formData.preferences.fitnessGoals}
          onChange={handleChange}
          className="w-full px-4 py-2 mb-6 border rounded"
        >
          <option value="">Select Fitness Goal</option>
          <option value="Weight Loss">Weight Loss</option>
          <option value="Muscle Gain">Muscle Gain</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Endurance">Endurance</option>
          <option value="Other">Other</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded text-white ${
            loading ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </button>

        <p className="text-sm text-center text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-green-600 hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}