import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";

export default function App({ children }) {
  const initAuth = useAuthStore((s) => s.initAuth);

  useEffect(() => {
    initAuth();
  }, []);

  return children;
}