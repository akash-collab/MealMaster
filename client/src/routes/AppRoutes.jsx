import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "../layout/RootLayout";
import DashboardLayout from "../layout/DashboardLayout";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import Home from "../pages/dashboard/Home";
import Profile from "../pages/dashboard/Profile";

import BrowseRecipes from "../pages/recipes/BrowseRecipes";
import RecipeDetails from "../pages/recipes/RecipeDetails";

import MealPlanner from "../pages/planner/MealPlanner";
import GroceryList from "../pages/grocery/GroceryList";

import CommunityRecipes from "../pages/community/CommunityRecipes";
import ProtectedRoute from "../components/ProtectedRoute";

import Favorites from "../pages/dashboard/Favorites";
import PublicRecipePage from "../pages/recipes/PublicRecipePage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },

  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Home /> },
      { path: "profile", element: <Profile /> },
      { path: "recipes", element: <BrowseRecipes /> },
      { path: "recipes/:id", element: <RecipeDetails /> },
      { path: "planner", element: <MealPlanner /> },
      { path: "grocery", element: <GroceryList /> },
      { path: "community", element: <CommunityRecipes /> },
      { path: "favorites", element: <Favorites /> },
    ],
  },
  {
    path: "/p/:id",
    element: <PublicRecipePage />,
  }
]);

export default function AppRoutes() {
  return <RouterProvider router={router} />;
}