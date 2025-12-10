import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { registerUser } from "../../services/authService";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

export default function Register() {
  const setAuth = useAuthStore((state) => state.loginSuccess);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

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
    mutation.mutate(form);
  };

  return (
    <form
      className="w-96 bg-white p-8 rounded-lg shadow space-y-4"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-bold text-center">Create Account</h2>

      <Input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

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
        Register
      </Button>
    </form>
  );
}