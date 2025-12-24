// server/routes/communityRoutes.js
import express from "express";
import {
  getCommunityRecipes,
  createCommunityRecipe,
  getCommunityRecipe,
  reactToPost,
  addComment,
  getComments,
  getCommunityImage,
} from "../controllers/communityController.js";
import { protect } from "../middleware/authMiddleware.js";
import { uploadImage } from "../middleware/uploadImage.js";
import { getMyPosts } from "../controllers/mineController.js";
import cache from "../middleware/cache.js";

const router = express.Router();

// Public feed + public single post
router.get("/", cache("2 minutes"), getCommunityRecipes);
router.get("/mine", protect, getMyPosts);
router.get("/:id", getCommunityRecipe);
router.get("/:id/comments", cache("1 minute"), getComments);
router.get("/:id/image", getCommunityImage);

// Protected actions
router.post("/", protect, uploadImage.single("image"), createCommunityRecipe);
router.post("/:id/react", protect, reactToPost);
router.post("/:id/comments", protect, addComment);
export default router;