import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./routes/AppRoutes";
import QueryProvider from "./providers/QueryProvider";
import TokenRefresher from "./components/TokenRefresher";
import { Toaster } from "react-hot-toast";
import ThemeProvider from "./providers/ThemeProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <QueryProvider>
        <TokenRefresher>
          <AppRoutes />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 2500,
              style: {
                fontSize: "14px",
                background: "var(--card)",
                color: "var(--text)",
                border: "1px solid rgba(255,255,255,0.1)"
              },
            }}
          />
        </TokenRefresher>
      </QueryProvider>
    </ThemeProvider>
  </React.StrictMode>
);