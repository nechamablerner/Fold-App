import "./amplify-config.js"; // <-- Make this the absolute first line! Configures Amplify/Cognito.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "@aws-amplify/ui-react/styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
