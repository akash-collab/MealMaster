import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useEffect, useState, useRef } from "react";
import { useThemeStore } from "../store/themeStore";

const SIDEBAR_KEY = "mm_sidebar_open";

export default function DashboardLayout() {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  const [hydrated, setHydrated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(
    () => JSON.parse(localStorage.getItem(SIDEBAR_KEY)) ?? false
  );

  const touchStartX = useRef(null);

  /* ---------- HYDRATION ---------- */
  useEffect(() => setHydrated(true), []);

  useEffect(() => {
    if (hydrated && !user) navigate("/");
  }, [hydrated, user, navigate]);

  /* ---------- PERSIST STATE ---------- */
  useEffect(() => {
    localStorage.setItem(SIDEBAR_KEY, JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  /* ---------- SWIPE GESTURES ---------- */
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;

    if (diff > 80) setSidebarOpen(true);    // swipe right
    if (diff < -80) setSidebarOpen(false);  // swipe left

    touchStartX.current = null;
  };

  if (!hydrated) return null;

  return (
    <div
      className="min-h-screen flex bg-background text-foreground"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ---------- MOBILE OVERLAY ---------- */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}

      {/* ---------- SIDEBAR ---------- */}
      <aside
        className={`
          fixed z-40 top-0 left-0 h-full w-60
          bg-sidebar text-sidebar-foreground
          border-r border-sidebar-border shadow-xl
          flex flex-col justify-between p-5
          transform transition-transform duration-300 ease-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
      >
        {/* TOP */}
        <div>
          <div className="text-2xl font-extrabold mb-6 text-center">
            MealMaster
          </div>

          <nav className="space-y-2 text-sm">
            <SidebarLink to="/dashboard" close={() => setSidebarOpen(false)}>🏠 Home</SidebarLink>
            <SidebarLink to="/dashboard/recipes" close={() => setSidebarOpen(false)}>🍲 Recipes</SidebarLink>
            <SidebarLink to="/dashboard/planner" close={() => setSidebarOpen(false)}>📅 Planner</SidebarLink>
            <SidebarLink to="/dashboard/grocery" close={() => setSidebarOpen(false)}>🛒 Grocery</SidebarLink>
            <SidebarLink to="/dashboard/community" close={() => setSidebarOpen(false)}>👥 Community</SidebarLink>
            <SidebarLink to="/dashboard/favorites" close={() => setSidebarOpen(false)}>❤️ Favorites</SidebarLink>
            <SidebarLink to="/dashboard/profile" close={() => setSidebarOpen(false)}>👤 Profile</SidebarLink>
          </nav>
        </div>

        {/* BOTTOM */}
        <div className="pt-5 border-t border-sidebar-border">
          <button
            onClick={toggleTheme}
            className="w-full flex justify-between items-center px-2 py-2 mb-4 rounded-lg hover:bg-sidebar-accent transition"
          >
            <span>{theme === "light" ? "Light Mode" : "Dark Mode"}</span>
            <span className="w-10 h-5 bg-muted rounded-full p-1">
              <span
                className={`block w-4 h-4 bg-card rounded-full transition ${
                  theme === "dark" ? "translate-x-5" : ""
                }`}
              />
            </span>
          </button>

          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="w-full py-2 rounded-xl bg-destructive text-primary-foreground font-semibold"
          >
            Logout
          </button>

          <p className="text-xs text-muted-foreground mt-3 text-center">
            {user?.email}
          </p>
        </div>
      </aside>

      {/* ---------- MAIN ---------- */}
      <main className="flex-1 p-4 sm:p-6 lg:ml-60">
        {/* MOBILE TOP BAR */}
        <div className="lg:hidden flex items-center mb-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="relative w-8 h-6"
          >
            {/* Animated hamburger */}
            <span className={`bar ${sidebarOpen && "open"}`} />
            <span className={`bar ${sidebarOpen && "open"}`} />
            <span className={`bar ${sidebarOpen && "open"}`} />
          </button>
        </div>

        <Outlet />
      </main>
    </div>
  );
}

/* ---------- SIDEBAR LINK ---------- */
function SidebarLink({ to, children, close }) {
  return (
    <NavLink
      to={to}
      end={to === "/dashboard"}
      onClick={close}
      className={({ isActive }) =>
        `block px-3 py-2 rounded-xl font-medium transition ${
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "hover:bg-sidebar-accent"
        }`
      }
    >
      {children}
    </NavLink>
  );
}