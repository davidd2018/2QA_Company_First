// frontend/src/App.js
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

// Import các trang bạn đã tạo
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import HomeResident from "./pages/Resident/Home";
import Dashboard from "./pages/Admin/Dashboard";
import ActivateAccount from "./pages/ActivateAccount";

function App() {
  return (
    <Router>
      <Routes>
        {/* Trang công khai */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/activate" element={<ActivateAccount />} />

        {/* Trang cho cư dân */}
        <Route path="/home-resident" element={<HomeResident />} />

        {/* Trang cho Admin & Manager */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Chuyển hướng nếu đường dẫn không tồn tại */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
