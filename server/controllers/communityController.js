// server/controllers/communityController.js
import mongoose from "mongoose";
import CommunityRecipe from "../models/CommunityRecipe.js";

// Helper to safely normalize body fields into arrays
const normalizeArrayField = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
};

// GET /api/community?sort=trending|new
export const getCommunityRecipes = async (req, res) => {
  try {
    const { sort = "trending" } = req.query;

    let sortStage = { createdAt: -1 };
    if (sort === "trending") {
      sortStage = { reactionsCount: -1, createdAt: -1 };
    }

    const recipes = await CommunityRecipe.aggregate([
      {
        $addFields: {
          reactionsCount: {
            $size: { $ifNull: ["$reactions", []] },
          },
          commentsCount: {
            $size: { $ifNull: ["$comments", []] },
          },
        },
      },
      { $sort: sortStage },
      { $limit: 50 },
    ]);

    await CommunityRecipe.populate(recipes, {
      path: "user",
      select: "name email",
    });

    res.json({ recipes });
  } catch (err) {
    console.error("getCommunityRecipes error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/community/:id
export const getCommunityRecipe = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid recipe ID" });
    }

    const recipe = await CommunityRecipe.findById(id)
      .populate("user", "name email")
      .populate("comments.user", "name");

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json({ recipe });
  } catch (err) {
    console.error("getCommunityRecipe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/community  (protected, multipart)
export const createCommunityRecipe = async (req, res) => {
  try {
    const userId = req.userId;

    const {
      title,
      description,
      imageUrl, // optional text fallback
    } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    const ingredients = normalizeArrayField(
      req.body["ingredients[]"] || req.body.ingredients
    );
    const steps = normalizeArrayField(req.body["steps[]"] || req.body.steps);
    const tags = normalizeArrayField(req.body["tags[]"] || req.body.tags);

    const recipeData = {
      title,
      description,
      ingredients,
      steps,
      tags,
      user: userId || null,
      reactions: [],
      comments: [],
    };

    // If file uploaded, store in MongoDB as buffer
    if (req.file) {
      recipeData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    } else if (imageUrl) {
      recipeData.imageUrl = imageUrl;
    }

    const recipe = await CommunityRecipe.create(recipeData);

    res.status(201).json({ recipe });
  } catch (err) {
    console.error("createCommunityRecipe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/community/:id/react  (protected)
// One reaction per user; clicking same emoji again removes it
export const reactToCommunityRecipe = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { emoji } = req.body;

    if (!emoji || typeof emoji !== "string") {
      return res.status(400).json({ message: "Emoji is required" });
    }

    const recipe = await CommunityRecipe.findById(id);
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const idx = recipe.reactions.findIndex(
      (r) => r.user.toString() === userId.toString()
    );

    if (idx !== -1) {
      // Already reacted
      if (recipe.reactions[idx].emoji === emoji) {
        // Same emoji → remove reaction
        recipe.reactions.splice(idx, 1);
      } else {
        // Different emoji → update reaction
        recipe.reactions[idx].emoji = emoji;
      }
    } else {
      // First time reaction
      recipe.reactions.push({ user: userId, emoji });
    }

    await recipe.save();

    res.json({
      reactions: recipe.reactions,
      reactionsCount: recipe.reactions.length,
      userReaction:
        recipe.reactions.find(
          (r) => r.user.toString() === userId.toString()
        )?.emoji || null,
    });
  } catch (err) {
    console.error("reactToCommunityRecipe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/community/:id/comments  (protected)
export const addComment = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text required" });
    }

    const recipe = await CommunityRecipe.findById(id).populate(
      "comments.user",
      "name"
    );

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    recipe.comments.push({ user: userId, text: text.trim() });
    await recipe.save();
    await recipe.populate("comments.user", "name");

    res.status(201).json({
      comments: recipe.comments,
      commentsCount: recipe.comments.length,
    });
  } catch (err) {
    console.error("addComment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/community/:id/comments (public)
export const getComments = async (req, res) => {
  try {
    const recipe = await CommunityRecipe.findById(req.params.id).populate(
      "comments.user",
      "name"
    );

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    res.json({
      comments: recipe.comments,
      commentsCount: recipe.comments.length,
    });
  } catch (err) {
    console.error("getComments error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/community/:id/image  (public) — serves Mongo buffer
export const getCommunityImage = async (req, res) => {
  try {
    const recipe = await CommunityRecipe.findById(req.params.id);

    if (!recipe || !recipe.image || !recipe.image.data) {
      return res.status(404).send("No image found");
    }

    res.set("Content-Type", recipe.image.contentType || "image/jpeg");
    res.send(recipe.image.data);
  } catch (err) {
    console.error("getCommunityImage error:", err);
    res.status(500).send("Server error");
  }
};