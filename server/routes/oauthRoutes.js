import express from "express";
import {
  googleAuthURL,
  googleCallback,
} from "../controllers/oauthController.js";

const router = express.Router();

// GOOGLE
router.get("/google", googleAuthURL);
router.get("/google/callback", googleCallback);

export default router;