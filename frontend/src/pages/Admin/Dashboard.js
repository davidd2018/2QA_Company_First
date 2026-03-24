// frontend/src/pages/Admin/Dashboard.js
import React from "react";

const Dashboard = () => {
  // Giả sử lấy role từ localStorage để phân quyền nút bấm
  const role = localStorage.getItem("role");

  return (
    <div className="admin-container">
      <nav className="admin-nav">
        <h2>Hệ Thống Quản Trị</h2>
        <span>Quyền: {role?.toUpperCase()}</span>
      </nav>
      <div className="admin-grid">
        <div className="stat-box">Tổng cư dân: 150</div>
        <div className="stat-box">Yêu cầu chưa xử lý: 5</div>
        <div className="stat-box">Doanh thu phí dịch vụ: 200tr</div>
      </div>

      <div className="actions">
        <h3>Chức năng nhanh</h3>
        <button>Đăng thông báo mới</button>
        <button>Tạo hóa đơn tháng hàng loạt</button>
        {role === "admin" && (
          <button style={{ color: "red" }}>
            Quản lý nhân viên (Chỉ Admin)
          </button>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
