import bcrypt from "bcryptjs";
import User from "../models/User.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

/* Helper for saving avatar */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsPath = path.join(__dirname, "../uploads/avatars");

// Ensure folder exists
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

/* -------------------- EDIT PROFILE -------------------- */
export const updateProfile = async (req, res) => {
  try {
    const { name, dietPreferences, allergies, cuisinePreferences } = req.body;

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (typeof name === "string" && name.trim()) {
      user.name = name.trim();
    }

    if (Array.isArray(dietPreferences)) {
      user.dietPreferences = dietPreferences;
    }
    if (Array.isArray(allergies)) {
      user.allergies = allergies;
    }
    if (Array.isArray(cuisinePreferences)) {
      user.cuisinePreferences = cuisinePreferences;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        hasAvatar: !!user.avatar?.data,
      },
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

/* -------------------- CHANGE PASSWORD -------------------- */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Both fields required" });

    const user = await User.findById(req.userId);
    if (!user || !user.password)
      return res.status(400).json({ message: "User has no password" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Current password incorrect" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    await user.save();

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to change password" });
  }
};

/* -------------------- UPDATE AVATAR -------------------- */
export const updateAvatar = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No image uploaded" });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Save image buffer to MongoDB
    user.avatar = {
      data: req.file.buffer,
      contentType: req.file.mimetype,
    };

    await user.save();

    res.json({
      message: "Avatar updated",
      avatarUrl: `/api/user/avatar/${user._id}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to upload avatar" });
  }
};

export const getAvatar = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || !user.avatar?.data) {
    return res.status(404).end();
  }

  res.set("Content-Type", user.avatar.contentType);
  res.send(user.avatar.data);
};

export const saveOnboarding = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.userId,
    {
      ...req.body,
      onboardingCompleted: true,
    },
    { new: true }
  ).select("-password -refreshToken");

  res.json({ user });
};