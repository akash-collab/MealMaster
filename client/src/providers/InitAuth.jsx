// client/src/providers/InitAuth.jsx
import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";

export default function InitAuth({ children }) {
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    initAuth();
  }, []);

  return children;
}