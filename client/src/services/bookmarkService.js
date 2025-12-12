import { useAuthStore } from "../store/authStore";

const BASE = `${import.meta.env.VITE_API_URL}/bookmarks`;

export const toggleBookmark = async (postId) => {
  const token = useAuthStore.getState().accessToken;

  const res = await fetch(`${BASE}/${postId}/toggle`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error("Failed to toggle bookmark");
  return res.json();
};

export const getMyBookmarks = async () => {
  const token = useAuthStore.getState().accessToken;

  const res = await fetch(`${BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to load bookmarks");
  return res.json(); // { bookmarks: [] }
};