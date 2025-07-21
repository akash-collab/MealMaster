const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { updatePreferences } = require("../controllers/userController");

router.put("/preferences", auth, updatePreferences);

module.exports = router;