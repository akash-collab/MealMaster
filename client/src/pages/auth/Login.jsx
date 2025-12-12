import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import toast from "react-hot-toast";
import AuthLayout from "../../layout/AuthLayout";

export default function Login() {
  const setAuth = useAuthStore((s) => s.loginSuccess);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const mutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      if (data.user && data.accessToken) {
        setAuth(data.user, data.accessToken);
        window.location.href = "/dashboard";
      } else {
        toast.error(data.message || "Login failed");
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="
          w-full max-w-sm p-8 rounded-2xl shadow-lg border
          bg-white dark:bg-neutral-900
          border-neutral-200 dark:border-neutral-700
          space-y-6
        "
    >
      <h2 className="text-3xl font-bold text-center">Welcome Back 👋</h2>

      <p className="text-sm text-center text-neutral-500 dark:text-neutral-400">
        Log in to continue your journey
      </p>

      <Input
        type="email"
        placeholder="Email address"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <Input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <Button type="submit" className="w-full h-10 text-base">
        {mutation.isPending ? "Logging in…" : "Login"}
      </Button>

      <div className="border-t pt-4 space-y-2">
        <SocialLogin />
      </div>

      <p className="text-sm text-center text-neutral-600 dark:text-neutral-400">
        Don't have an account?{" "}
        <a href="/register" className="text-primary hover:underline">
          Create one
        </a>
      </p>
    </form>
  );
}

function SocialLogin() {
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`}
        className="
          w-full border py-2.5 rounded-lg flex items-center justify-center gap-2
          border-neutral-300 dark:border-neutral-700
          bg-neutral-50 dark:bg-neutral-800
          text-neutral-900 dark:text-neutral-100
        "
      >
        <img src="/google.svg" className="w-5" alt="google" />
        Continue with Google
      </button>
    </div>
  );
}