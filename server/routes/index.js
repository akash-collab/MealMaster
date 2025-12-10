import express from "express";
import authRoutes from "./authRoutes.js";
import communityRoutes from "./communityRoutes.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "API working" });
});

router.use("/auth", authRoutes);
router.use("/community", communityRoutes);

export default router;