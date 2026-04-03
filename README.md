# 2QA Apartment — Cổng Thông Tin Cư Dân

Hệ thống quản lý chung cư: hóa đơn, thông báo, phản ánh cho cư dân và ban quản lý.

---

## Yêu cầu

- Node.js >= 18
- MySQL >= 8 (HeidiSQL, XAMPP, hoặc MySQL Workbench đều được)

---

## Cài đặt & Chạy

### 1. Clone repo

```bash
git clone <repo-url>
```

### 2. Backend

```bash
cd backend
npm install
```

Tạo file `.env` từ mẫu:

```bash
cp .env.example .env
```

Mở `.env` và điền mật khẩu MySQL của bạn:

```
PORT=5000
JWT_SECRET=your_secret_key_here
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=ql_chungcu
```

> **Lưu ý:** Không cần tạo database thủ công. Backend sẽ tự tạo database `ql_chungcu` và tất cả bảng khi khởi động lần đầu.

Chạy backend:

```bash
npm start
```

Server chạy tại `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

Frontend chạy tại `http://localhost:3000`

---

## Tài khoản mẫu

Sau khi backend khởi động lần đầu, thêm user mẫu bằng cách chạy lệnh sau trong thư mục `backend`:

```bash
node scripts/seed.js
```

Hoặc dùng tính năng **Kích hoạt tài khoản** trên giao diện để tạo tài khoản mới.

---

## Cấu trúc dự án

```
├── backend/
│   ├── src/
│   │   ├── config/db.js        # Kết nối DB, tự tạo bảng
│   │   ├── controllers/        # Logic xử lý
│   │   ├── middlewares/        # Auth, phân quyền
│   │   └── routes/             # Định nghĩa API
│   ├── .env.example            # Mẫu cấu hình môi trường
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/              # Các trang (Login, Home, Dashboard)
│   │   └── mock/               # Dữ liệu mock fallback
│   └── package.json
└── database/
    └── setup.sql               # SQL tham khảo (không bắt buộc)
```

---

## Công nghệ

- Frontend: React.js, Tailwind CSS, React Router
- Backend: Node.js, Express.js
- Database: MySQL (tự động khởi tạo)
- Auth: JWT
