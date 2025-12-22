import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";

import indexRoutes from "./routes/index.js";
import authRoutes from "./routes/authRoutes.js";
import oauthRoutes from "./routes/oauthRoutes.js";

import recipeRoutes from "./routes/recipeRoutes.js";
import { warmUpCache } from "./routes/recipeRoutes.js";

import favoriteRoutes from "./routes/favoriteRoutes.js";
import mealPlanRoutes from "./routes/mealPlanRoutes.js";
import groceryRoutes from "./routes/groceryRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import bookmarkRoutes from "./routes/bookmarkRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

app.use("/api", indexRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/auth", oauthRoutes);
app.use("/api/user", userRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/grocery", groceryRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/mealplan", mealPlanRoutes);
app.use("/api/bookmarks", bookmarkRoutes);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadsPath = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// Static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const PORT = process.env.PORT || 8000;

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await connectDB();
  await warmUpCache();
});