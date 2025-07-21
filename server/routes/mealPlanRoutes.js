const express = require("express");
const router = express.Router();
const { saveMealPlan, getMealPlan } = require("../controllers/mealPlanController");
const auth = require("../middleware/auth");

router.get("/", auth, getMealPlan);
router.put("/", auth, saveMealPlan);

module.exports = router;