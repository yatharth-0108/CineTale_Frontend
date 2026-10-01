import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";

import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { SocialProvider } from "./context/SocialContext";
import { LibraryProvider } from "./context/LibraryContext";
import { ThemeProvider } from "./context/ThemeContext";

import "./styles/components.css";
import "./styles/global.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <ToastProvider>
            <LibraryProvider>
              <SocialProvider>
                <App />
              </SocialProvider>
            </LibraryProvider>
          </ToastProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>,
);
