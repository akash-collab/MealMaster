import User from "../models/User.js";

export const addFavorite = async (req, res) => {
  try {
    const { recipeId, name, thumbnail } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);

    // Prevent duplicates
    const exists = user.favorites.some(f => f.recipeId === recipeId);
    if (exists) return res.status(400).json({ message: "Already in favorites" });

    user.favorites.push({ recipeId, name, thumbnail });
    await user.save();

    res.json({ message: "Added to favorites", favorites: user.favorites });
  } catch (err) {
    console.error("Add favorite error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFavorites = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId);
    res.json({ favorites: user.favorites });
  } catch (err) {
    console.error("Get favorites error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const removeFavorite = async (req, res) => {
  try {
    const userId = req.userId;
    const { recipeId } = req.params;

    const user = await User.findById(userId);

    user.favorites = user.favorites.filter(f => f.recipeId !== recipeId);
    await user.save();

    res.json({ message: "Removed from favorites", favorites: user.favorites });
  } catch (err) {
    console.error("Remove favorite error:", err);
    res.status(500).json({ message: "Server error" });
  }
};