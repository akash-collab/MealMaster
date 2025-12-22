// utils/geminiNutrition.js
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function getNutritionFromGemini(recipe) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const prompt = `
You are a nutrition expert.

Given this recipe, estimate nutrition PER SERVING.
Return ONLY valid JSON.

Recipe Name: ${recipe.name}
Ingredients: ${recipe.ingredients.join(", ")}
Instructions: ${recipe.instructions}

JSON FORMAT:
{
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  return JSON.parse(text);
}