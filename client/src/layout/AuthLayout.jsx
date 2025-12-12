import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 dark:bg-neutral-950 transition-colors">
      <Outlet />
    </div>
  );
}