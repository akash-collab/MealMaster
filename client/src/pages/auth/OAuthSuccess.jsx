import { useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function OAuthSuccess() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const token = params.get("accessToken");
    if (!token) {
      navigate("/login");
      return;
    }

    const completeOAuthLogin = async () => {
      setAccessToken(token);
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "include",
        }
      );
      const data = await res.json();
      if (!data?.user) {
        navigate("/login");
        return;
      }
      setUser(data.user);
      if (!data.user.onboardingCompleted) {
        navigate("/register");
      } else {
        navigate("/dashboard");
      }
    };

    completeOAuthLogin();
  }, []);

  return <div className="p-6">Finishing Google login…</div>;
}