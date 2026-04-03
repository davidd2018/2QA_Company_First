/*
-- Tạo Database nếu chưa có
CREATE DATABASE IF NOT EXISTS apartment_portal;
USE apartment_portal;

-- 1. Bảng Người dùng (Tất cả các đối tượng)
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    room_id INT NULL, -- Sẽ liên kết với bảng rooms ở dưới
    
    -- Phân quyền: 
    -- admin: Toàn quyền hệ thống
    -- manager: Ban quản lý (duyệt hóa đơn, đăng tin)
    -- staff: Nhân viên kỹ thuật/vệ sinh (xử lý phản ánh)
    -- resident: Cư dân (xem tin, đóng tiền)
    role ENUM('admin', 'manager', 'staff', 'resident') DEFAULT 'resident',
    
    status ENUM('active', 'inactive', 'pending') DEFAULT 'pending', 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
*/

-- 2. Bảng Căn hộ (Để quản lý diện tích, vị trí)
CREATE TABLE IF NOT EXISTS rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(10) UNIQUE NOT NULL, -- Ví dụ: A1-102
    floor INT NOT NULL,
    area DECIMAL(5, 2), -- Diện tích để tính phí quản lý
    status ENUM('occupied', 'empty', 'repairing') DEFAULT 'empty'
);

-- 3. Bảng Thông báo (Cho trang Landing Page và Dashboard)
CREATE TABLE IF NOT EXISTS notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category ENUM('emergency', 'maintenance', 'general', 'event') DEFAULT 'general',
    author_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. Bảng Hóa đơn (Cho trang Home Resident)
CREATE TABLE IF NOT EXISTS bills (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_id INT, 
    bill_type ENUM('electricity', 'water', 'service', 'parking') NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    usage_value FLOAT NULL, -- Số điện/nước tiêu thụ
    month_year VARCHAR(7) NOT NULL, -- Định dạng: 03-2026
    due_date DATE,
    status ENUM('unpaid', 'paid', 'overdue') DEFAULT 'unpaid',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE CASCADE
);

-- 5. Bảng Phản ánh (Dành cho Cư dân và Staff)
CREATE TABLE IF NOT EXISTS feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    resident_id INT,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    assigned_to INT NULL, -- Nhân viên (staff) xử lý
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (resident_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
);

ALTER TABLE users 
ADD CONSTRAINT fk_user_room 
FOREIGN KEY (room_id) REFERENCES rooms(id) ON DELETE SET NULL;

