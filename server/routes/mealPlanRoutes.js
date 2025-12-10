// server/routes/mealPlanRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getMealPlan,
  saveMealPlan,
} from "../controllers/mealPlanController.js";

const router = express.Router();

// weekStart is "YYYY-MM-DD"
router.get("/:weekStart", protect, getMealPlan);
router.post("/:weekStart", protect, saveMealPlan);

export default router;