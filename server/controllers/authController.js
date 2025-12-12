// server/controllers/authController.js
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.js";

const COOKIE_NAME = "refreshToken";
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

async function sendTokens(user, res) {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Hash refresh token before saving
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(refreshToken, salt);

  // Save hashed refresh token on user
  user.refreshToken = hash;
  await user.save();

  // Set cookie
  res.cookie(COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: COOKIE_MAX_AGE,
  });

  return res.json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
    },
    accessToken,
  });
}

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name, email, password: hashedPassword,
    });

    return sendTokens(user, res);
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email });
    if (!user || !user.password) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    return sendTokens(user, res);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies[COOKIE_NAME];
    if (!token) return res.status(401).json({ message: "No refresh token" });

    // Verify token signature first
    jwt.verify(token, process.env.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        console.error("Refresh token verify error:", err);
        return res.status(403).json({ message: "Invalid refresh token" });
      }

      const user = await User.findById(decoded.userId);
      if (!user || !user.refreshToken) {
        return res.status(403).json({ message: "Refresh token revoked" });
      }

      // Compare cookie token with stored hashed token
      const ok = await bcrypt.compare(token, user.refreshToken);
      if (!ok) {
        // possible reuse / theft — clear stored token
        user.refreshToken = null;
        await user.save();
        return res.status(403).json({ message: "Refresh token invalid" });
      }

      // Rotate refresh token: issue new refresh token and replace saved hash
      const newAccessToken = generateAccessToken(user._id);
      const newRefreshToken = generateRefreshToken(user._id);
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(newRefreshToken, salt);

      user.refreshToken = newHash;
      await user.save();

      // Set new cookie
      res.cookie(COOKIE_NAME, newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: COOKIE_MAX_AGE,
      });

      return res.json({ accessToken: newAccessToken });
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (req, res) => {
  try {
    // Clear cookie
    res.clearCookie(COOKIE_NAME, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    // Optionally clear refresh token server-side if user is authenticated
    // If you want to clear it for the current user:
    try {
      if (req.userId) {
        const user = await User.findById(req.userId);
        if (user) {
          user.refreshToken = null;
          await user.save();
        }
      }
    } catch (err) {
      // ignore
    }

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password -refreshToken");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ user });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({ message: "Server error" });
  }
};