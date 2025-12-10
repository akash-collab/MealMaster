const API_URL = `${import.meta.env.VITE_API_URL}/auth`;

export const registerUser = async (data) => {
  const res = await fetch(`${API_URL}/register`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

export const loginUser = async (data) => {
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return res.json();
};

export const fetchMe = async (token) => {
  const res = await fetch(`${API_URL}/me`, {
    credentials: "include",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.json();
};