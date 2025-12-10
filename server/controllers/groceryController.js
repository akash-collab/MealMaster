// server/controllers/groceryController.js
import GroceryList from "../models/GroceryList.js";

export const getGroceryList = async (req, res) => {
  try {
    const userId = req.userId;

    let list = await GroceryList.findOne({ user: userId });

    if (!list) {
      // Return an empty list if none exists yet
      return res.json({ list: { user: userId, items: [] } });
    }

    res.json({ list });
  } catch (err) {
    console.error("Get grocery list error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const saveGroceryList = async (req, res) => {
  try {
    const userId = req.userId;
    const { items } = req.body;      // MUST be { items }

    if (!Array.isArray(items)) {
      return res.status(400).json({ message: "Items must be an array" });
    }

    let list = await GroceryList.findOne({ user: userId });

    if (!list) {
      list = await GroceryList.create({ user: userId, items });
    } else {
      list.items = items;
      await list.save();
    }

    res.json({ list });
  } catch (err) {
    console.error("Save grocery list error:", err);
    res.status(500).json({ message: "Server error" });
  }
};