import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import MealList from "./components/MealList";
import ProtectedRoute from "./components/ProtectedRoute";
// import WeeklyMealPlanner from "./components/WeeklyMealPlanner";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SmartMealPlanner from "./components/SmartMealPlanner";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/meals"
          element={
            <ProtectedRoute>
              <MealList />
            </ProtectedRoute>
          }
        />
        <Route path="/meal-planner" element={<SmartMealPlanner/>} />
      </Routes>
      <ToastContainer />
    </BrowserRouter>
  );
}