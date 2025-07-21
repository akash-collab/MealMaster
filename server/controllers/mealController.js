const Meal = require("../models/Meal");

// CREATE Meal
exports.createMeal = async (req, res) => {
  try {
    const newMeal = new Meal({ ...req.body, user: req.userId });
    const savedMeal = await newMeal.save();
    res.status(201).json(savedMeal);
  } catch (err) {
    res.status(500).json({ message: "Error creating meal" });
  }
};

// GET All Meals for a user
exports.getMeals = async (req, res) => {
  try {
    const meals = await Meal.find({ user: req.userId });
    res.json(meals);
  } catch (err) {
    res.status(500).json({ message: "Error fetching meals" });
  }
};

// UPDATE Meal
exports.updateMeal = async (req, res) => {
  try {
    const updatedMeal = await Meal.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );
    if (!updatedMeal) return res.status(404).json({ message: "Meal not found" });
    res.json(updatedMeal);
  } catch (err) {
    res.status(500).json({ message: "Error updating meal" });
  }
};

// DELETE Meal
exports.deleteMeal = async (req, res) => {
  try {
    const deleted = await Meal.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!deleted) return res.status(404).json({ message: "Meal not found" });
    res.json({ message: "Meal deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting meal" });
  }
};