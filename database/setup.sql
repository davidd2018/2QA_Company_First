-- Tạo và sử dụng database
CREATE DATABASE IF NOT EXISTS ql_chungcu;
USE ql_chungcu;

-- 1. Bảng users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15) UNIQUE,
    room_number VARCHAR(10) NULL,
    role ENUM('admin', 'manager', 'staff', 'resident') DEFAULT 'resident',
    status ENUM('active', 'inactive', 'pending') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Bảng rooms
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(10) UNIQUE NOT NULL,
    floor INT NOT NULL,
    area DECIMAL(5, 2),
    status ENUM('occupied', 'empty', 'repairing') DEFAULT 'empty'
);

-- 3. Bảng notifications
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category ENUM('emergency', 'maintenance', 'general', 'event') DEFAULT 'general',
    author_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Bảng bills (dùng room_id FK tới rooms)
CREATE TABLE IF NOT EXISTS bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT,
    bill_type ENUM('electricity', 'water', 'service', 'parking') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    usage_value FLOAT NULL,
    month_year VARCHAR(7) NOT NULL,
    due_date DATE,
    status ENUM('unpaid', 'paid', 'overdue') DEFAULT 'unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- 5. Bảng feedback
CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    assigned_to INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resident_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

-- Dữ liệu mẫu
-- Phòng mẫu
INSERT IGNORE INTO rooms (room_number, floor, area, status) VALUES
('A1-101', 1, 65.5, 'occupied'),
('A1-102', 1, 70.0, 'empty');

-- Users mẫu (password: 123456)
-- Hash bcrypt của '123456'
INSERT IGNORE INTO users (fullname, email, phone, password, role, status, room_number) VALUES
('Admin Tổng', 'admin@gmail.com', '0900000001', '$2b$10$to7h/OfGu997ZNezzxtkQeSLp0coR2Wa6s5CDFQbgBHMULWVrPTW2', 'admin', 'active', NULL),
('Nguyễn Văn A', 'resident@gmail.com', '0901234567', '$2b$10$to7h/OfGu997ZNezzxtkQeSLp0coR2Wa6s5CDFQbgBHMULWVrPTW2', 'resident', 'active', 'A1-101');

-- Thông báo mẫu
INSERT IGNORE INTO notifications (title, content, category) VALUES
('Bảo trì thang máy', 'Thang máy block A sẽ bảo trì vào sáng thứ 2.', 'maintenance'),
('Lễ hội cư dân 2026', 'Chào mừng ngày thành lập chung cư tại sảnh chính.', 'event');

-- Hóa đơn mẫu cho phòng A1-101
INSERT IGNORE INTO bills (room_id, bill_type, amount, month_year, status) VALUES
((SELECT id FROM rooms WHERE room_number = 'A1-101'), 'electricity', 350000, '03-2026', 'unpaid'),
((SELECT id FROM rooms WHERE room_number = 'A1-101'), 'water', 120000, '03-2026', 'unpaid'),
((SELECT id FROM rooms WHERE room_number = 'A1-101'), 'service', 200000, '03-2026', 'paid');
