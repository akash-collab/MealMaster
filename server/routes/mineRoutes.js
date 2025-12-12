import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getMyPosts } from "../controllers/mineController.js";

const router = express.Router();

router.get("/mine", protect, getMyPosts);

export default router;