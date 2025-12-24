// client/src/services/groceryService.js
import { useAuthStore } from "../store/authStore";

const BASE_URL = `${import.meta.env.VITE_API_URL}/grocery`;

const authHeaders = () => {
  const token = useAuthStore.getState().accessToken;
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

export const fetchGroceryList = async () => {
  const res = await fetch(BASE_URL, {
    method: "GET",
    headers: authHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch grocery list");
  }

  return res.json(); 
};

export const saveGroceryList = async (items) => {
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ items }),
  });

  if (!res.ok) {
    throw new Error("Failed to save grocery list");
  }

  return res.json(); // { message, list }
};