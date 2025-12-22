import { geminiModel } from "../config/gemini.js";

export async function calculateNutrition(ingredients) {
  if (!geminiModel) {
    return null;
  }

  const prompt = `
You are a nutrition expert.

Calculate approximate nutrition values for the following recipe.

Ingredients:
${ingredients.map(i => `- ${i.name}: ${i.quantity}`).join("\n")}

Return ONLY valid JSON:
{
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number
}
`;

  try {
    const result = await geminiModel.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (err) {
    console.warn("⚠️ Gemini nutrition failed:", err.message);
    return null;
  }
}