// server/controllers/communityController.js
import mongoose from "mongoose";
import CommunityRecipe from "../models/CommunityRecipe.js";

// Helper — produce reaction summary object { emoji: count, ... }
function buildReactionSummary(reactions = []) {
  const map = {};
  reactions.forEach((r) => {
    if (!r || !r.emoji) return;
    map[r.emoji] = (map[r.emoji] || 0) + 1;
  });
  return map;
}

// GET /api/community?sort=trending|new
export const getCommunityRecipes = async (req, res) => {
  try {
    const { sort = "trending" } = req.query;

    // Fetch last 200 posts then compute and sort in JS (safe and flexible)
    const docs = await CommunityRecipe.find({})
      .populate("user", "name email")
      .populate("comments.user", "name")
      .lean()
      .exec();

    // build lightweight view
    const recipes = docs.map((d) => {
      const reactionCounts = buildReactionSummary(d.reactions);
      const reactionsTotal = Object.values(reactionCounts).reduce(
        (s, v) => s + v,
        0
      );
      return {
        ...d,
        reactionCounts,
        reactionsTotal,
        commentsCount: (d.comments || []).length,
      };
    });

    // sort
    if (sort === "trending") {
      recipes.sort((a, b) => {
        // trending by reactionsTotal then newest
        return (b.reactionsTotal || 0) - (a.reactionsTotal || 0) || new Date(b.createdAt) - new Date(a.createdAt);
      });
    } else {
      recipes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // limit
    const limited = recipes.slice(0, 50);

    res.json({ recipes: limited });
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
      .populate("comments.user", "name")
      .lean()
      .exec();

    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }

    const reactionCounts = buildReactionSummary(recipe.reactions);
    const reactionsTotal = Object.values(reactionCounts).reduce((s, v) => s + v, 0);

    res.json({
      recipe: {
        ...recipe,
        reactionCounts,
        reactionsTotal,
        commentsCount: (recipe.comments || []).length,
      },
    });
  } catch (err) {
    console.error("getCommunityRecipe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET image — serve buffer if stored, otherwise 404
export const getCommunityImage = async (req, res) => {
  try {
    const recipe = await CommunityRecipe.findById(req.params.id);
    if (!recipe || !recipe.image || !recipe.image.data) {
      return res.status(404).send("No image");
    }

    res.set("Content-Type", recipe.image.contentType);
    return res.send(recipe.image.data);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Image error");
  }
};

// POST /api/community  (protected) — accepts multipart/form-data or imageUrl
export const createCommunityRecipe = async (req, res) => {
  try {
    const userId = req.userId;

    const {
      title,
      description,
      // arrays may come as multiple form fields names or JSON
      ingredients = [],
      steps = [],
      tags = [],
      imageUrl: fallbackUrl,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const recipeData = {
      title,
      description,
      ingredients: Array.isArray(ingredients) ? ingredients : [ingredients].filter(Boolean),
      steps: Array.isArray(steps) ? steps : [steps].filter(Boolean),
      tags: Array.isArray(tags) ? tags : (tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : []),
      user: userId || null,
      reactions: [],
      comments: [],
    };

    // If client provided image file via multer with `uploadImage.single("image")`
    // NOTE: ensure your multer uploads are configured to store buffer (see note below)
    if (req.file && req.file.buffer) {
      recipeData.image = {
        data: req.file.buffer,
        contentType: req.file.mimetype,
      };
    } else if (req.file && req.file.path) {
      // Fallback: if multer stored file to disk, read into buffer
      const fs = await import("fs/promises");
      const buf = await fs.readFile(req.file.path);
      recipeData.image = {
        data: buf,
        contentType: req.file.mimetype,
      };
    } else if (fallbackUrl) {
      recipeData.imageUrl = fallbackUrl;
    }

    const recipe = await CommunityRecipe.create(recipeData);
    res.status(201).json({ recipe });
  } catch (err) {
    console.error("createCommunityRecipe error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/community/:id/react  (protected) — body: { emoji }
export const reactToPost = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { emoji } = req.body;

    if (emoji === undefined) {
    return res.status(400).json({ message: "Emoji is missing" });
}

    const allowed = ["❤️","😂","😍","🤤","🔥","😢"]; // keep same set as frontend
    if (!allowed.includes(emoji)) {
      return res.status(400).json({ message: "Emoji not allowed" });
    }

    const recipe = await CommunityRecipe.findById(id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    // find existing reaction by user
    const idx = (recipe.reactions || []).findIndex((r) => r.user?.toString() === userId.toString());

    if (idx === -1) {
      // add new reaction
      recipe.reactions.push({ user: userId, emoji });
    } else {
      const existingEmoji = recipe.reactions[idx].emoji;
      if (existingEmoji === emoji) {
        // toggle off (remove)
        recipe.reactions.splice(idx, 1);
      } else {
        // change emoji
        recipe.reactions[idx].emoji = emoji;
      }
    }

    await recipe.save();

    const reactionCounts = buildReactionSummary(recipe.reactions);
    const reactionsTotal = Object.values(reactionCounts).reduce((s, v) => s + v, 0);

    // user reaction
    const userReactionObj = recipe.reactions.find((r) => r.user?.toString() === userId.toString());
    const userReaction = userReactionObj ? userReactionObj.emoji : null;

    return res.json({ reactionCounts, reactionsTotal, userReaction });
  } catch (err) {
    console.error("reactToPost error:", err);
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

    const recipe = await CommunityRecipe.findById(id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

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