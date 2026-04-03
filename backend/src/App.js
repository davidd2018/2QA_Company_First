// backend/src/app.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

// Khởi tạo DB trước (tạo database + bảng nếu chưa có)
const dbPromise = require("./config/db");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const residentNotificationsRoutes = require("./routes/residentNotificationsRoutes");
const adminNotificationsRoutes = require("./routes/adminNotificationsRoutes");
const residentBillsRoutes = require("./routes/residentBillsRoutes");
const adminBillsRoutes = require("./routes/adminBillsRoutes");
const residentFeedbackRoutes = require("./routes/residentFeedbackRoutes");
const adminFeedbackRoutes = require("./routes/adminFeedbackRoutes");

const app = express();

// --- 1. MIDDLEWARES ---
// Cho phép Frontend (ví dụ localhost:3000) gọi API vào Backend
//app.use(cors());
// Thay vì app.use(cors()); hãy thử:
app.use(
  cors({
    origin: "http://localhost:3000", // Cho phép đúng port của React
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

// Xử lý dữ liệu gửi lên dưới dạng JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- 2. ROUTES ---
// Tất cả các route liên quan đến Auth sẽ bắt đầu bằng /api/auth
app.use("/api/auth", authRoutes);

// =========================
// PHAN VUNG RESIDENT/ADMIN
// =========================
app.use("/api/resident/notifications", residentNotificationsRoutes);
app.use("/api/admin/notifications", adminNotificationsRoutes);

app.use("/api/resident/bills", residentBillsRoutes);
app.use("/api/admin/bills", adminBillsRoutes);

app.use("/api/resident/feedback", residentFeedbackRoutes);
app.use("/api/admin/feedback", adminFeedbackRoutes);

// Route kiểm tra trạng thái server (tùy chọn)
app.get("/", (req, res) => {
  res.send("Server Cổng Thông Tin Cư Dân đang chạy...");
});

// --- 3. XỬ LÝ LỖI (Error Handling) ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Đã xảy ra lỗi hệ thống!" });
});

// --- 4. KHỞI CHẠY SERVER (sau khi DB sẵn sàng) ---
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await dbPromise; // đợi DB init + tạo bảng xong
    app.listen(PORT, () => {
      console.log(`------------------------------------------`);
      console.log(`🚀 Server started on port: ${PORT}`);
      console.log(`🔗 API Login: http://localhost:${PORT}/api/auth/login`);
      console.log(`------------------------------------------`);
    });
  } catch (err) {
    console.error("❌ Không thể khởi động server:", err.message);
    process.exit(1);
  }
})();
