import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { uploadImage } from "../middleware/uploadImage.js";
import {
  updateProfile,
  changePassword,
  updateAvatar,
  getAvatar,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/avatar/:id", getAvatar);
router.put("/me", protect, updateProfile);                     router.post("/change-password", protect, changePassword);      
router.post("/avatar", protect, uploadImage.single("avatar"), updateAvatar); 

export default router;