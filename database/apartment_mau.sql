-- Thêm 1 tài khoản Admin mẫu (Mật khẩu giả định là '123456' - sau này bạn dùng Register để tạo pass mã hóa)
INSERT INTO users (fullname, email, password, role, status) 
VALUES ('Admin Tong', 'admin@gmail.com', '$2b$10$YourHashedPasswordHere', 'admin', 'active');

-- Thêm một vài căn hộ mẫu
INSERT INTO rooms (room_number, floor, area, status) VALUES 
('A1-101', 1, 65.5, 'occupied'),
('A1-102', 1, 70.0, 'occupied'),
('B2-305', 3, 55.0, 'empty');

-- Thêm thông báo mẫu để hiện ở Landing Page
INSERT INTO notifications (title, content, category) VALUES 
('Thông báo bảo trì thang máy', 'Thang máy block A sẽ bảo trì vào sáng thứ 2...', 'maintenance'),
('Lễ hội cư dân 2026', 'Chào mừng ngày thành lập chung cư tại sảnh chính...', 'event');