// client/src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const [hydrated, setHydrated] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  // Try refresh before redirecting
  useEffect(() => {
    if (!hydrated) return;

    const tryRefresh = async () => {
      if (accessToken) {
        setChecked(true);
        return;
      }

      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          setAccessToken(data.accessToken);
        }
      } catch (err) {}

      setChecked(true);
    };

    tryRefresh();
  }, [hydrated]);

  if (!hydrated || !checked) return <div>Loading...</div>;

  if (!accessToken) return <Navigate to="/" />;

  return children;
}
