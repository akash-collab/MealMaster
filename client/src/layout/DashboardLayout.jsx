import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useEffect, useState } from "react";
import { useThemeStore } from "../store/themeStore";

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !user) navigate("/");
  }, [hydrated, user, navigate]);

  if (!hydrated) return null;

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* SIDEBAR */}
      <aside
        className="
          w-60 
          bg-sidebar text-sidebar-foreground
          shadow-xl 
          border-r border-sidebar-border
          fixed top-0 left-0 h-full
          flex flex-col justify-between
          p-5
        "
      >
        {/* TOP */}
        <div>
          <div
            className="
              text-2xl font-extrabold tracking-tight mb-6 
              text-center
            "
          >
            MealMaster
          </div>

          <nav className="space-y-2 text-sm">
            <SidebarLink to="/dashboard">🏠 Home</SidebarLink>
            <SidebarLink to="/dashboard/recipes">🍲 Browse Recipes</SidebarLink>
            <SidebarLink to="/dashboard/planner">📅 Meal Planner</SidebarLink>
            <SidebarLink to="/dashboard/grocery">🛒 Grocery List</SidebarLink>
            <SidebarLink to="/dashboard/community">👥 Community</SidebarLink>
            <SidebarLink to="/dashboard/favorites">❤️ Favorites</SidebarLink>
            <SidebarLink to="/dashboard/profile">👤 Profile</SidebarLink>
          </nav>
        </div>

        {/* BOTTOM */}
        <div className="mt-auto pt-6 border-t border-sidebar-border">
          {/* THEME SWITCH */}
          <button
            onClick={toggleTheme}
            className="
              w-full flex items-center justify-between 
              px-2 py-2 mb-4
              rounded-lg text-sm font-medium
              hover:bg-sidebar-accent/60
              transition
            "
          >
            <span>{theme === "light" ? "Light Mode" : "Dark Mode"}</span>

            {/* Slider */}
            <span
              className="
                w-10 h-5 flex items-center rounded-full p-1
                bg-muted dark:bg-muted
                transition
              "
            >
              <span
                className={`
                  w-4 h-4 bg-card rounded-full shadow transform transition
                  ${theme === "light" ? "translate-x-0" : "translate-x-5"}
                `}
              />
            </span>
          </button>

          {/* LOGOUT */}
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="
              w-full px-4 py-2 
              bg-destructive text-primary-foreground rounded-xl text-sm font-semibold 
              shadow hover:opacity-90 transition
            "
          >
            Logout
          </button>

          <p className="text-[11px] text-muted-foreground mt-3 text-center">
            Logged in as <span className="font-medium">{user?.email}</span>
          </p>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 ml-60 p-10 bg-background text-foreground">
        <Outlet />
      </main>
    </div>
  );
}

function SidebarLink({ to, children }) {
  return (
    <NavLink
      to={to}
      end={to === "/dashboard"}
      className={({ isActive }) =>
        `
        block px-3 py-2 rounded-xl font-medium transition
        ${
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground shadow"
            : "text-sidebar-foreground hover:bg-sidebar-accent"
        }
      `
      }
    >
      {children}
    </NavLink>
  );
}