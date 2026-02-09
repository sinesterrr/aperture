import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import "./globals.css";
import App from "./App";
import "./lib/fonts";

hydrateRoot(
  document.getElementById("root") as HTMLElement,
  <StrictMode>
    <App />
  </StrictMode>,
);
