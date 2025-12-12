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
        if (data.accessToken) {
          setAccessToken(data.accessToken);
        }
      }
    } catch (err) {
      console.log("Token refresh failed:", err);
    }
  };

  useEffect(() => {
    // First refresh on load
    refreshToken();

    // Every 10 minutes
    const interval = setInterval(refreshToken, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return children;
}