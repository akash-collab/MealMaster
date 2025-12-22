import { GoogleGenerativeAI } from "@google/generative-ai";

let geminiModel = null;

if (process.env.GEMINI_API_KEY) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });
    console.log("✅ Gemini initialized");
  } catch (err) {
    console.warn("⚠️ Gemini disabled:", err.message);
  }
} else {
  console.warn("⚠️ GEMINI_API_KEY not set. Nutrition disabled.");
}

export { geminiModel };