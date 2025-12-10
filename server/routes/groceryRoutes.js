// server/routes/groceryRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getGroceryList,
  saveGroceryList,
} from "../controllers/groceryController.js";

const router = express.Router();

router.get("/", protect, getGroceryList);
router.post("/", protect, saveGroceryList);

export default router;