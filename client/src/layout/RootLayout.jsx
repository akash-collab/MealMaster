import { Outlet } from "react-router-dom";

export default function RootLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Outlet />
    </div>
  );
}