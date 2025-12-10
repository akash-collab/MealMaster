import { create } from "zustand";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("theme") || "light",

  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";

      // Apply to HTML element
      if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }

      // Persist
      localStorage.setItem("theme", newTheme);

      return { theme: newTheme };
    }),
}));