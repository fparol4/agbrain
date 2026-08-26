import React from "react";
import ReactDOM from "react-dom/client";
import { Providers } from "./app/providers";
import { AppRoutes } from "./app/routes";
import "./index.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <Providers>
        <AppRoutes />
      </Providers>
    </React.StrictMode>,
  );
}
