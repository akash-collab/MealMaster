// services/aiService.js
import API from "./api";

export const fetchSuggestedMeals = async () => {
  try {
    const response = await API.get("/ai/suggested-meals");

    return response.data; // array of { name, source }
  } catch (error) {
    console.error("Error fetching AI suggested meals:", error);
    return [];
  }
};