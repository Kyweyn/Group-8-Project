// main.jsx - this is where React starts.
// It grabs the <div id="root"> from index.html and puts our App inside it.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
