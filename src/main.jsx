import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";

// Import your pages
import App from "./App.jsx";
import AdminDashboard from "./admindashboard.jsx";
import UserDashboard from "./userdasboard.jsx";


createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Default login page */}
        <Route path="/" element={<App />} />

        {/* After login redirects */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
