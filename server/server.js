const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require("./routes/authRoutes");
const mealRoutes = require("./routes/mealRoutes");
const userRoutes = require("./routes/userRoutes");
const mealPlanRoutes = require("./routes/mealPlanRoutes");
const recipeRoutes = require("./routes/recipeRoutes");

dotenv.config();
const app = express();
connectDB();
app.use(express.json());

const allowedOrigins = [
  "http://localhost:5173",
  "https://mealmaster-frontend.onrender.com",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

app.get('/', (req, res) => {
    res.json({message:"MealMaster API is running..."});
});

app.use("/api/auth", authRoutes);
app.use("/api/meals", mealRoutes);
app.use("/api/users", userRoutes);
app.use("/api/meal-plan", require("./routes/mealPlanRoutes"));
app.use("/api/recipes", recipeRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});