// client/src/components/TokenRefresher.jsx
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

export default function TokenRefresher({ children }) {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  const refreshToken = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        setAccessToken(data.accessToken);
      }
    } catch (err) {
      console.log("Token refresh failed:", err);
    }
  };

  useEffect(() => {
    refreshToken();
    const interval = setInterval(refreshToken, 600000);
    return () => clearInterval(interval);
  }, []);

  return children;
}