import { useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useSearchParams } from "react-router-dom";

export default function OAuthSuccess() {
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setUser = useAuthStore((s) => s.setUser);
  const [params] = useSearchParams();

  useEffect(() => {
    const token = params.get("accessToken");

    const finishLogin = async () => {
      if (!token) return;

      setAccessToken(token);

      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      const data = await res.json();
      if (data?.user) {
        setUser(data.user);
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/login";
      }
    };

    finishLogin();
  }, []);

  return <div>Finishing login...</div>;
}