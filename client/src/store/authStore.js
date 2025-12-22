import { create } from "zustand";
import { persist } from "zustand/middleware";

const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    _id: user._id || user.id,
  };
};

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      hasTriedRefresh: false,

      isAuthenticated: () => !!get().accessToken,

      loginSuccess: (user, token) =>
        set({ user: normalizeUser(user), accessToken: token }),

      setUser: (user) => set({ user: normalizeUser(user) }),
      setAccessToken: (token) => set({ accessToken: token }),

      logout: () => {
        set({
          user: null,
          accessToken: null,
          hasTriedRefresh: true,
        });
      },

      /** ✅ OAuth support + refresh-safe init */
      initAuth: async () => {
        const { hasTriedRefresh } = get();
        if (hasTriedRefresh) return;

        set({ hasTriedRefresh: true });

        try {
          // 1️⃣ Check OAuth redirect token
          const params = new URLSearchParams(window.location.search);
          const oauthToken = params.get("accessToken");

          if (oauthToken) {
            set({ accessToken: oauthToken });

            // fetch user
            const me = await fetch(
              `${import.meta.env.VITE_API_URL}/auth/me`,
              {
                headers: { Authorization: `Bearer ${oauthToken}` },
                credentials: "include",
              }
            );
            const data = await me.json();
            if (data?.user) set({ user: normalizeUser(data.user) });

            // clean URL
            window.history.replaceState({}, "", window.location.pathname);
            return;
          }

          // 2️⃣ Normal refresh flow
          const res = await fetch(
            `${import.meta.env.VITE_API_URL}/auth/refresh`,
            {
              method: "POST",
              credentials: "include",
            }
          );
          if (!res.ok) return;

          const data = await res.json();
          if (!data.accessToken) return;

          set({ accessToken: data.accessToken });

          const me = await fetch(
            `${import.meta.env.VITE_API_URL}/auth/me`,
            {
              headers: {
                Authorization: `Bearer ${data.accessToken}`,
              },
              credentials: "include",
            }
          );
          const meJson = await me.json();
          if (meJson?.user) set({ user: normalizeUser(meJson.user) });
        } catch (err) {
          console.error("initAuth failed:", err);
        }
      },
    }),
    {
      name: "auth-storage",
    }
  )
);