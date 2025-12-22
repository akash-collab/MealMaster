import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/token.js";

const sendOAuthTokens = (user, res) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return res.redirect(
    `${process.env.CLIENT_URL}/oauth-success?accessToken=${accessToken}`
  );
};

export const googleAuthURL = (req, res) => {
  const redirect = encodeURIComponent(process.env.GOOGLE_REDIRECT_URI);

  const googleURL =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    `client_id=${process.env.GOOGLE_CLIENT_ID}` +
    `&redirect_uri=${redirect}` +
    "&response_type=code" +
    "&scope=profile email";

  res.redirect(googleURL);
};

export const googleCallback = async (req, res) => {
  const code = req.query.code;

  try {
    const tokenRes = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
        code,
      }
    );

    const { access_token } = tokenRes.data;

    const googleUser = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      { headers: { Authorization: `Bearer ${access_token}` } }
    );

    const { id, email, name, picture } = googleUser.data;

    let user = await User.findOne({ oauthId: id, oauthProvider: "google" });

    if (!user) {
      user = await User.create({
        name,
        email,
        oauthId: id,
        oauthProvider: "google",
        onboardingCompleted: false,
      });
    }

    return sendOAuthTokens(user, res);
  } catch (err) {
    console.error("Google OAuth Error:", err.response?.data || err);
    return res.status(500).send("Google OAuth failed");
  }
};