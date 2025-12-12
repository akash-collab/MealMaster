import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const accessToken = useAuthStore((s) => s.accessToken);
  const hasTriedRefresh = useAuthStore((s) => s.hasTriedRefresh);

  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated || !hasTriedRefresh) return <div>Loading...</div>;

  if (!accessToken) return <Navigate to="/login" replace />;

  return children;
}