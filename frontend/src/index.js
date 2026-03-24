// frontend/src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // Nếu bạn chưa có file index.css, hãy tạo 1 file trống hoặc xóa dòng này
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
