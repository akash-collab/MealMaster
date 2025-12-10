// client/src/services/favoriteService.js
import { useAuthStore } from "../store/authStore";

const BASE_URL = `${import.meta.env.VITE_API_URL}/favorites`;

export const getFavorites = async () => {
  const token = useAuthStore.getState().accessToken;

  const res = await fetch(BASE_URL, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};

export const addFavorite = async (favorite) => {
  const token = useAuthStore.getState().accessToken;

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(favorite),
  });

  return res.json();
};

export const removeFavorite = async (recipeId) => {
  const token = useAuthStore.getState().accessToken;

  const res = await fetch(`${BASE_URL}/${recipeId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};

export const saveFavorite = async (item) => {
  const token = useAuthStore.getState().accessToken;

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(item),
  });

  if (!res.ok) throw new Error("Failed to save favorite");

  return res.json();
};