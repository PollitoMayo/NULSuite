import * as Sentry from "@sentry/electron/renderer";
import { StrictMode } from "react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
});
import { createRoot } from "react-dom/client";
import App from "./App.js";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("Root element not found");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
);
