import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { toggleBookmark, getMyBookmarks } from "../controllers/bookmarkController.js";

const router = express.Router();

router.post("/:postId/toggle", protect, toggleBookmark);
router.get("/me", protect, getMyBookmarks);

export default router;