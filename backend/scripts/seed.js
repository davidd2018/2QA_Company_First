/**
 * Seed dữ liệu mẫu vào database.
 * Chạy: node scripts/seed.js
 *
 * Tự động dùng MySQL hoặc Firestore theo DB_MODE trong .env
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const bcrypt = require("bcryptjs");

const mode = process.env.DB_MODE || "mysql";
console.log(`🔧 Seed mode: ${mode}`);

// ── DATA MẪU ──────────────────────────────────────────────────────────────────
async function getSeedData() {
  const hash = await bcrypt.hash("123456", 10);
  return { hash };
}

// ── MYSQL SEED ─────────────────────────────────────────────────────────────────
async function seedMySQL() {
  const db = await require("../src/config/db");
  const { hash } = await getSeedData();

  await db.query(
    "INSERT IGNORE INTO rooms (room_number, floor, area, status) VALUES (?, ?, ?, ?)",
    ["A1-101", 1, 65.5, "occupied"]
  );
  await db.query(
    "INSERT IGNORE INTO users (fullname, email, phone, password, role, status) VALUES (?, ?, ?, ?, ?, ?)",
    ["Admin Tổng", "admin@gmail.com", "0900000001", hash, "admin", "active"]
  );
  await db.query(
    "INSERT IGNORE INTO users (fullname, email, phone, password, role, status, room_number) VALUES (?, ?, ?, ?, ?, ?, ?)",
    ["Nguyễn Văn A", "resident@gmail.com", "0901234567", hash, "resident", "active", "A1-101"]
  );
  await db.query(
    "INSERT IGNORE INTO notifications (title, content, category) VALUES (?, ?, ?), (?, ?, ?)",
    [
      "Bảo trì thang máy", "Thang máy block A sẽ bảo trì vào sáng thứ 2.", "maintenance",
      "Lễ hội cư dân 2026", "Chào mừng ngày thành lập chung cư tại sảnh chính.", "event",
    ]
  );
  const [[room]] = await db.query("SELECT id FROM rooms WHERE room_number = 'A1-101'");
  if (room) {
    await db.query(
      "INSERT IGNORE INTO bills (room_id, bill_type, amount, month_year, status) VALUES (?,?,?,?,?),(?,?,?,?,?),(?,?,?,?,?)",
      [
        room.id, "electricity", 350000, "03-2026", "unpaid",
        room.id, "water",       120000, "03-2026", "unpaid",
        room.id, "service",     200000, "03-2026", "paid",
      ]
    );
  }
}

// ── FIRESTORE SEED ─────────────────────────────────────────────────────────────
async function seedFirestore() {
  const db = require("../src/config/firebase");
  const { hash } = await getSeedData();
  const now = new Date().toISOString();

  // Helper: chỉ tạo nếu chưa có (kiểm tra theo field unique)
  const upsert = async (collection, field, value, data) => {
    const snap = await db.collection(collection).where(field, "==", value).limit(1).get();
    if (!snap.empty) {
      console.log(`  ↩ ${collection}/${value} đã tồn tại, bỏ qua.`);
      return snap.docs[0].id;
    }
    const ref = await db.collection(collection).add({ ...data, created_at: now });
    console.log(`  ✚ ${collection}/${value} đã tạo (id: ${ref.id})`);
    return ref.id;
  };

  // Rooms
  await upsert("rooms", "room_number", "A1-101", {
    room_number: "A1-101", floor: 1, area: 65.5, status: "occupied",
  });

  // Users
  await upsert("users", "phone", "0900000001", {
    fullname: "Admin Tổng", email: "admin@gmail.com",
    phone: "0900000001", password: hash,
    role: "admin", status: "active", room_number: null,
  });

  const residentId = await upsert("users", "phone", "0901234567", {
    fullname: "Nguyễn Văn A", email: "resident@gmail.com",
    phone: "0901234567", password: hash,
    role: "resident", status: "active", room_number: "A1-101",
  });

  // Notifications
  await upsert("notifications", "title", "Bảo trì thang máy", {
    title: "Bảo trì thang máy",
    content: "Thang máy block A sẽ bảo trì vào sáng thứ 2.",
    category: "maintenance", author_id: null,
  });
  await upsert("notifications", "title", "Lễ hội cư dân 2026", {
    title: "Lễ hội cư dân 2026",
    content: "Chào mừng ngày thành lập chung cư tại sảnh chính.",
    category: "event", author_id: null,
  });

  // Bills (gắn với resident)
  const billsSnap = await db.collection("bills").where("room_number", "==", "A1-101").get();
  if (billsSnap.empty) {
    const billData = [
      { bill_type: "electricity", amount: 350000, status: "unpaid" },
      { bill_type: "water",       amount: 120000, status: "unpaid" },
      { bill_type: "service",     amount: 200000, status: "paid"   },
    ];
    for (const b of billData) {
      await db.collection("bills").add({
        ...b, room_number: "A1-101", resident_id: residentId,
        month_year: "03-2026", created_at: now,
      });
      console.log(`  ✚ bills/${b.bill_type} đã tạo`);
    }
  } else {
    console.log("  ↩ bills/A1-101 đã tồn tại, bỏ qua.");
  }
}

// ── MAIN ───────────────────────────────────────────────────────────────────────
async function main() {
  if (mode === "firestore") {
    await seedFirestore();
  } else {
    await seedMySQL();
  }

  console.log("\n✅ Seed xong! Tài khoản mẫu:");
  console.log("   Resident: 0901234567 / 123456");
  console.log("   Admin:    0900000001 / 123456");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed lỗi:", err.message);
  process.exit(1);
});
