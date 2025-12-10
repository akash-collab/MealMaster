import { useAuthStore } from "../store/authStore";

const BASE_URL = `${import.meta.env.VITE_API_URL}/mealplan`;

const authHeaders = () => {
  const token = useAuthStore.getState().accessToken;
  // console.log("MealPlan Token:", token);
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

// FETCH MEAL PLAN
export const fetchMealPlan = async (weekStart) => {
  const res = await fetch(`${BASE_URL}/${weekStart}`, {
    method: "GET",
    credentials: "include",              
    headers: authHeaders(),
  });

  if (!res.ok) {
    const msg = await res.text();
    console.error("MealPlan Fetch Error:", msg);
    throw new Error("Failed to fetch meal plan");
  }

  return res.json();
};

// SAVE MEAL PLAN
export const saveMealPlan = async (weekStart, days) => {
  const sendRequest = async () => {
    return fetch(`${BASE_URL}/${weekStart}`, {
      method: "POST",
      credentials: "include",
      headers: authHeaders(),
      body: JSON.stringify({ days }),
    });
  };

  let res = await sendRequest();

  if (res.status === 401) {
    console.log("Access token expired. Refreshing...");

    const refreshRes = await fetch("http://localhost:8000/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      const data = await refreshRes.json();
      useAuthStore.getState().setAccessToken(data.accessToken);

      // retry request
      res = await sendRequest();
    }
  }

  if (!res.ok) {
    const msg = await res.text();
    console.error("MealPlan Save Error:", msg);
    throw new Error("Failed to save meal plan");
  }

  return res.json();
};