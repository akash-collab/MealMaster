import { useAuthStore } from "../store/authStore";

export const fetchDashboardStats = async (token) => {
  let res = await fetch(
    `${import.meta.env.VITE_API_URL}/dashboard/stats`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    }
  );

  // 🔁 Access token expired → try refresh
  if (res.status === 401) {
    const refreshRes = await fetch(
      `${import.meta.env.VITE_API_URL}/auth/refresh`,
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (!refreshRes.ok) {
      throw new Error("Session expired");
    }

    const refreshData = await refreshRes.json();

    if (!refreshData.accessToken) {
      throw new Error("Refresh failed");
    }

    // ✅ Save new access token
    useAuthStore.getState().setAccessToken(refreshData.accessToken);

    // 🔁 Retry dashboard request
    res = await fetch(
      `${import.meta.env.VITE_API_URL}/dashboard/stats`,
      {
        headers: {
          Authorization: `Bearer ${refreshData.accessToken}`,
        },
        credentials: "include",
      }
    );
  }

  if (!res.ok) {
    throw new Error("Failed to fetch dashboard stats");
  }

  return res.json();
};