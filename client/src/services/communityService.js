// client/src/services/communityService.js
import { useAuthStore } from "../store/authStore";

const BASE_URL = `${import.meta.env.VITE_API_URL}/community`;

// PUBLIC — feed
export const fetchCommunityRecipes = async (sort = "trending") => {
  const res = await fetch(`${BASE_URL}?sort=${sort}`);
  if (!res.ok) throw new Error("Failed to load community recipes");
  return res.json();
};

// PUBLIC — single post
export const fetchCommunityPost = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`);
  if (!res.ok) throw new Error("Failed to load post");
  return res.json(); // { recipe }
};

// PUBLIC — comments
export const fetchCommunityComments = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}/comments`);
  if (!res.ok) throw new Error("Failed to load comments");
  return res.json(); // { comments, commentsCount }
};

// PROTECTED — create post (multipart)
export const createCommunityRecipe = async (payload) => {
  const token = useAuthStore.getState().accessToken;
  const formData = new FormData();

  formData.append("title", payload.title);
  formData.append("description", payload.description);
  if (payload.imageFile) {
    formData.append("image", payload.imageFile);
  } else if (payload.imageUrl) {
    formData.append("imageUrl", payload.imageUrl);
  }

  (payload.ingredients || []).forEach((ing) =>
    formData.append("ingredients[]", ing)
  );
  (payload.steps || []).forEach((s) => formData.append("steps[]", s));
  (payload.tags || []).forEach((t) => formData.append("tags[]", t));

  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error("Failed to create recipe");
  return res.json(); // { recipe }
};



// PROTECTED — add comment
export const addComment = async ({ id, text }) => {
  const token = useAuthStore.getState().accessToken;

  const res = await fetch(`${BASE_URL}/${id}/comments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) throw new Error("Failed to add comment");
  return res.json(); 
};

// PROTECTED — react to post
export const reactToPost = async ({ id, emoji }) => {
  const token = useAuthStore.getState().accessToken;
  const res = await fetch(`${BASE_URL}/${id}/react`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ emoji }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || "Failed to react to post");
  }
  return res.json(); 
};