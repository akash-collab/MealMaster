const express = require("express");
const router = express.Router();
const {
  createMeal,
  getMeals,
  updateMeal,
  deleteMeal,
} = require("../controllers/mealController");

const authMiddleware = require("../middleware/auth");

router.use(authMiddleware);

router.post("/", createMeal);
router.get("/", getMeals);
router.put("/:id", updateMeal);
router.delete("/:id", deleteMeal);

module.exports = router;