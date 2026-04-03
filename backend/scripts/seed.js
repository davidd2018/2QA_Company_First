/**
 * Seed dữ liệu mẫu vào database.
 * Chạy: node scripts/seed.js
 */
const bcrypt = require("bcryptjs");
const dbPromise = require("../src/config/db");

async function seed() {
  const db = await dbPromise;
  const hash = await bcrypt.hash("123456", 10);

  // Phòng mẫu
  await db.query(
    "INSERT IGNORE INTO rooms (room_number, floor, area, status) VALUES (?, ?, ?, ?)",
    ["A1-101", 1, 65.5, "occupied"]
  );

  // Admin
  await db.query(
    "INSERT IGNORE INTO users (fullname, email, phone, password, role, status) VALUES (?, ?, ?, ?, ?, ?)",
    ["Admin Tổng", "admin@gmail.com", "0900000001", hash, "admin", "active"]
  );

  // Resident
  await db.query(
    "INSERT IGNORE INTO users (fullname, email, phone, password, role, status, room_number) VALUES (?, ?, ?, ?, ?, ?, ?)",
    ["Nguyễn Văn A", "resident@gmail.com", "0901234567", hash, "resident", "active", "A1-101"]
  );

  // Thông báo mẫu
  await db.query(
    "INSERT IGNORE INTO notifications (title, content, category) VALUES (?, ?, ?), (?, ?, ?)",
    [
      "Bảo trì thang máy", "Thang máy block A sẽ bảo trì vào sáng thứ 2.", "maintenance",
      "Lễ hội cư dân 2026", "Chào mừng ngày thành lập chung cư tại sảnh chính.", "event",
    ]
  );

  // Hóa đơn mẫu
  const [[room]] = await db.query("SELECT id FROM rooms WHERE room_number = 'A1-101'");
  if (room) {
    await db.query(
      "INSERT IGNORE INTO bills (room_id, bill_type, amount, month_year, status) VALUES (?,?,?,?,?),(?,?,?,?,?),(?,?,?,?,?)",
      [
        room.id, "electricity", 350000, "03-2026", "unpaid",
        room.id, "water", 120000, "03-2026", "unpaid",
        room.id, "service", 200000, "03-2026", "paid",
      ]
    );
  }

  console.log("✅ Seed xong! Tài khoản mẫu:");
  console.log("   Resident: 0901234567 / 123456");
  console.log("   Admin:    0900000001 / 123456");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed lỗi:", err.message);
  process.exit(1);
});
