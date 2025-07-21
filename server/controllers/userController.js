const User = require("../models/User");

exports.updatePreferences = async (req, res) => {
  try {
    const { dietary, allergies, fitnessGoals } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        preferences: {
          dietary,
          allergies,
          fitnessGoals,
          completed: true,
        },
      },
      { new: true }
    );

    res.status(200).json({ message: "Preferences updated", user });
  } catch (err) {
    res.status(500).json({ message: "Failed to update preferences", error: err.message });
  }
};