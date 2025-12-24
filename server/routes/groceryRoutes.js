// server/routes/groceryRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getGroceryList,
  saveGroceryList,
} from "../controllers/groceryController.js";
import cache from "../middleware/cache.js";

const router = express.Router();

router.get("/", protect,cache("5 minutes"), getGroceryList);
router.post("/", protect, saveGroceryList);

export default router;