import User from "../models/User.js";

export const saveOnboarding = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      dietPreferences,
      allergies,
      cuisinePreferences,
      calorieGoal,
      macroGoals,
    } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        dietPreferences,
        allergies,
        cuisinePreferences,
        calorieGoal,
        macroGoals,
        onboardingCompleted: true,
      },
      { new: true }
    ).select("-password -refreshToken");

    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: "Onboarding failed" });
  }
};