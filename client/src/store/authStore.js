// client/src/store/authStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      hasTriedRefresh: false,
      isAuthenticated: () => !!get().accessToken,

      loginSuccess: (user, token) => set({ user, accessToken: token }),

      setUser: (user) => set({ user }),
      setAccessToken: (token) => set({ accessToken: token }),

      logout: () => {
        set({
          user: null,
          accessToken: null,
          hasTriedRefresh: true,
        });
      },
      initAuth: async () => {
        const { hasTriedRefresh } = get();
        if (hasTriedRefresh) return;

        set({ hasTriedRefresh: true });

        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/refresh`, {
            method: "POST",
            credentials: "include",
          });
          if (!res.ok) {
            return;
          }
          const data = await res.json();
          if (!data.accessToken) return;
          set({ accessToken: data.accessToken });

          const me = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${data.accessToken}` },
            credentials: "include",
          });
          const meJson = await me.json();
          if (meJson?.user) set({ user: meJson.user });
        } catch (err) {
          console.log("initAuth failed:", err);
        }
      }
    }),
    {
      name: "auth-storage",
      skipHydration: false,
    }
  )
);