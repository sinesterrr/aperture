import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import "./globals.css";
import App from "./App";
import "./lib/fonts";

export function render(_url: string) {
  const html = renderToString(
    <StrictMode>
      <App url={_url} />
    </StrictMode>,
  );
  return { html };
}
