import { useEffect } from "react";
import { useThemeStore } from "../store/themeStore";

export default function ThemeProvider({ children }) {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  return children;
}