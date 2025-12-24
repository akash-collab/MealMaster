import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useEffect, useState } from "react";
import { useThemeStore } from "../store/themeStore";

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const [hydrated, setHydrated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated && !user) navigate("/");
  }, [hydrated, user, navigate]);

  if (!hydrated) return null;

  return (
    <div className="min-h-screen flex bg-background text-foreground">

      {/* ============ MOBILE OVERLAY ============ */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}

      {/* ============ SIDEBAR ============ */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-full w-60
          bg-sidebar text-sidebar-foreground
          border-r border-sidebar-border shadow-xl
          flex flex-col justify-between p-5
          transform transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* ---------- TOP ---------- */}
        <div>
          <div className="text-2xl font-extrabold tracking-tight mb-6 text-center">
            MealMaster
          </div>

          <nav className="space-y-2 text-sm">
            <SidebarLink to="/dashboard" onClick={() => setSidebarOpen(false)}>
              🏠 Home
            </SidebarLink>
            <SidebarLink to="/dashboard/recipes" onClick={() => setSidebarOpen(false)}>
              🍲 Browse Recipes
            </SidebarLink>
            <SidebarLink to="/dashboard/planner" onClick={() => setSidebarOpen(false)}>
              📅 Meal Planner
            </SidebarLink>
            <SidebarLink to="/dashboard/grocery" onClick={() => setSidebarOpen(false)}>
              🛒 Grocery List
            </SidebarLink>
            <SidebarLink to="/dashboard/community" onClick={() => setSidebarOpen(false)}>
              👥 Community
            </SidebarLink>
            <SidebarLink to="/dashboard/favorites" onClick={() => setSidebarOpen(false)}>
              ❤️ Favorites
            </SidebarLink>
            <SidebarLink to="/dashboard/profile" onClick={() => setSidebarOpen(false)}>
              👤 Profile
            </SidebarLink>
          </nav>
        </div>

        {/* ---------- BOTTOM ---------- */}
        <div className="pt-6 border-t border-sidebar-border">
          {/* THEME TOGGLE */}
          <button
            onClick={toggleTheme}
            className="
              w-full flex items-center justify-between
              px-2 py-2 mb-4
              rounded-lg text-sm font-medium
              hover:bg-sidebar-accent/60 transition
            "
          >
            <span>{theme === "light" ? "Light Mode" : "Dark Mode"}</span>
            <span className="w-10 h-5 flex items-center rounded-full p-1 bg-muted">
              <span
                className={`w-4 h-4 bg-card rounded-full shadow transition ${
                  theme === "light" ? "translate-x-0" : "translate-x-5"
                }`}
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
              bg-destructive text-primary-foreground
              rounded-xl text-sm font-semibold
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

      {/* ============ MAIN CONTENT ============ */}
      <main className="flex-1 p-6 lg:ml-60 bg-background text-foreground">

        {/* MOBILE HEADER */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="px-4 py-2 rounded-lg border text-sm font-medium"
          >
            ☰ Menu
          </button>
        </div>

        <Outlet />
      </main>
    </div>
  );
}

/* ============ SIDEBAR LINK ============ */
function SidebarLink({ to, children, onClick }) {
  return (
    <NavLink
      to={to}
      end={to === "/dashboard"}
      onClick={onClick}
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