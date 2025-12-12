import { useAuthStore } from "../store/authStore";
const BASE = `${import.meta.env.VITE_API_URL}/user`;

export const updateProfile = async (payload) => {
  const token = useAuthStore.getState().accessToken;

  const res = await fetch(`${BASE}/me`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("Failed to update profile");
  return res.json();
};

export const changePassword = async (data) => {
  const token = useAuthStore.getState().accessToken;

  const res = await fetch(`${BASE}/change-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to change password");
  return res.json();
};

export const uploadAvatar = async (file) => {
  const token = useAuthStore.getState().accessToken;
  const form = new FormData();
  form.append("avatar", file);

  const res = await fetch(`${BASE}/avatar`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) throw new Error("Failed to upload avatar");
  return res.json();
};