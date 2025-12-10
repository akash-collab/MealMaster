// client/src/store/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,

      // Derived state
      isAuthenticated: () => !!get().accessToken,

      // Login handler
      loginSuccess: (user, token) => set({ user, accessToken: token }),

      // Update accessToken only
      setAccessToken: (token) => set({ accessToken: token }),

      // Logout handler
      logout: () => {
        set({ user: null, accessToken: null });
        localStorage.removeItem("auth-storage");
      },
    }),
    {
      name: "auth-storage",
      skipHydration: false,
    }
  )
);