import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import "./index.css";
import App from "./App";

const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </React.StrictMode>
  );
}
