import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import toast from "react-hot-toast";
import AuthLayout from "../../layout/AuthLayout";

function MultiSelect({ label, options, selected, setSelected }) {
  const toggle = (opt) => {
    if (selected.includes(opt)) {
      setSelected(selected.filter((x) => x !== opt));
    } else {
      setSelected([...selected, opt]);
    }
  };

  return (
    <div className="space-y-2">
      <p className="font-medium text-sm">{label}</p>

      <div className="grid grid-cols-2 gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`px-3 py-2 rounded-lg border text-sm transition ${
              selected.includes(opt)
                ? "bg-primary text-white border-primary"
                : "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Register() {
  const setAuth = useAuthStore((s) => s.loginSuccess);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [dietPreferences, setDietPreferences] = useState([]);
  const [allergies, setAllergies] = useState([]);
  const [cuisinePreferences, setCuisinePreferences] = useState([]);

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: (data) => {
      if (data.user && data.accessToken) {
        setAuth(data.user, data.accessToken);
        window.location.href = "/dashboard";
      } else {
        toast.error(data.message || "Registration failed");
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({
      ...form,
      dietPreferences,
      allergies,
      cuisinePreferences,
    });
  };

  return (
      <form
        onSubmit={handleSubmit}
        className="
          w-full max-w-lg p-10 rounded-2xl shadow-lg border
          bg-white dark:bg-neutral-900
          border-neutral-200 dark:border-neutral-700
          space-y-8
        "
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold">Create Account ✨</h2>
          <p className="text-neutral-500 dark:text-neutral-400">
            Personalize your meal experience
          </p>
        </div>

        <div className="space-y-4">
          <Input
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <Input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <Input
            type="password"
            placeholder="Password (min 6 chars)"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <div className="space-y-6">
          <MultiSelect
            label="Diet Preferences"
            options={["Vegetarian", "Vegan", "Keto", "Paleo", "Low-Carb"]}
            selected={dietPreferences}
            setSelected={setDietPreferences}
          />

          <MultiSelect
            label="Allergies"
            options={["Peanuts", "Dairy", "Soy", "Gluten", "Seafood"]}
            selected={allergies}
            setSelected={setAllergies}
          />

          <MultiSelect
            label="Cuisine Preferences"
            options={["Indian", "Italian", "Mexican", "Chinese", "American", "Thai"]}
            selected={cuisinePreferences}
            setSelected={setCuisinePreferences}
          />
        </div>

        <Button type="submit" className="w-full h-11 text-base">
          {mutation.isPending ? "Creating…" : "Register"}
        </Button>

        <div className="border-t pt-4 space-y-3">
          <SocialLogin />
        </div>

        <p className="text-center text-sm text-neutral-600 dark:text-neutral-400">
          Already have an account?{" "}
          <a href="/login" className="text-primary hover:underline">
            Login here
          </a>
        </p>
      </form>
  );
}

function SocialLogin() {
  return (
    <div className="grid gap-3">
      <button
        type="button"
        className="
          w-full border py-2.5 rounded-lg flex items-center justify-center gap-2
          border-neutral-300 dark:border-neutral-700
          bg-neutral-50 dark:bg-neutral-800
        "
      >
        <img src="/google.svg" className="w-5" alt="google" />
        Continue with Google
      </button>
    </div>
  );
}