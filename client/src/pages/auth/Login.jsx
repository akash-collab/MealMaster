import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export default function Login() {
  const setAuth = useAuthStore((state) => state.loginSuccess);

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
      className="w-96 bg-white p-8 rounded-lg shadow space-y-4"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-bold text-center">Welcome Back</h2>

      <Input
        type="email"
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <Input
        type="password"
        placeholder="Password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
      />

      <Button type="submit" className="w-full">
        Login
      </Button>
    </form>
  );
}