const dbPromise = require("../config/db");

// Lấy room_id từ user (thử room_id trực tiếp, fallback qua room_number)
const getUserRoomId = async (db, userId) => {
  try {
    const [rows] = await db.query(
      `SELECT room_number FROM users WHERE id = ?`, [userId]
    );
    if (!rows.length || !rows[0].room_number) return null;

    const [rooms] = await db.query(
      `SELECT id FROM rooms WHERE room_number = ?`, [rows[0].room_number]
    );
    return rooms.length ? rooms[0].id : null;
  } catch {
    return null;
  }
};

const listResident = async (req, res) => {
  const db = await dbPromise;
  const roomId = await getUserRoomId(db, req.user.id);
  if (!roomId) {
    // Trả về mảng rỗng thay vì lỗi để frontend không bị crash
    return res.json([]);
  }
  const [rows] = await db.query(
    `SELECT b.*, r.room_number FROM bills b JOIN rooms r ON r.id = b.room_id WHERE b.room_id = ? ORDER BY b.month_year DESC`,
    [roomId]
  );
  return res.json(rows);
};

const listAdmin = async (_req, res) => {
  const db = await dbPromise;
  const [rows] = await db.query(
    `SELECT b.*, r.room_number FROM bills b JOIN rooms r ON r.id = b.room_id ORDER BY b.created_at DESC`
  );
  return res.json(rows);
};

const create = async (req, res) => {
  const db = await dbPromise;
  const { room_id, room_number, bill_type, amount, usage_value, month_year, due_date, status } = req.body || {};

  let resolvedRoomId = room_id;
  if (!resolvedRoomId && room_number) {
    const [rooms] = await db.query(`SELECT id FROM rooms WHERE room_number = ?`, [room_number]);
    resolvedRoomId = rooms.length ? rooms[0].id : null;
  }
  if (!resolvedRoomId)
    return res.status(400).json({ message: "Thiếu room_id hoặc room_number hợp lệ" });

  const [result] = await db.query(
    `INSERT INTO bills (room_id, bill_type, amount, usage_value, month_year, due_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [resolvedRoomId, bill_type, amount, usage_value || null, month_year, due_date || null, status || "unpaid"]
  );
  const [rows] = await db.query(`SELECT * FROM bills WHERE id = ?`, [result.insertId]);
  return res.status(201).json(rows[0]);
};

const updateStatus = async (req, res) => {
  const db = await dbPromise;
  const { id } = req.params;
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ message: "Thiếu status" });
  await db.query(`UPDATE bills SET status = ? WHERE id = ?`, [status, id]);
  const [rows] = await db.query(`SELECT * FROM bills WHERE id = ?`, [id]);
  return res.json(rows[0]);
};

const update = async (req, res) => {
  const db = await dbPromise;
  const { id } = req.params;
  const { room_id, room_number, bill_type, amount, usage_value, month_year, due_date, status } = req.body || {};

  let resolvedRoomId = room_id;
  if (!resolvedRoomId && room_number) {
    const [rooms] = await db.query(`SELECT id FROM rooms WHERE room_number = ?`, [room_number]);
    resolvedRoomId = rooms.length ? rooms[0].id : null;
  }
  if (!resolvedRoomId) {
    const [current] = await db.query(`SELECT room_id FROM bills WHERE id = ?`, [id]);
    if (!current.length) return res.status(404).json({ message: "Không tìm thấy hóa đơn" });
    resolvedRoomId = current[0].room_id;
  }

  await db.query(
    `UPDATE bills SET room_id=?, bill_type=?, amount=?, usage_value=?, month_year=?, due_date=?, status=? WHERE id=?`,
    [resolvedRoomId, bill_type, amount, usage_value || null, month_year, due_date || null, status || "unpaid", id]
  );
  const [rows] = await db.query(`SELECT * FROM bills WHERE id = ?`, [id]);
  return res.json(rows[0]);
};

const pay = async (req, res) => {
  const db = await dbPromise;
  const { id } = req.params;
  await db.query(`UPDATE bills SET status = 'paid' WHERE id = ?`, [id]);
  const [rows] = await db.query(`SELECT * FROM bills WHERE id = ?`, [id]);
  return res.json(rows[0]);
};

const remove = async (req, res) => {
  const db = await dbPromise;
  const { id } = req.params;
  await db.query(`DELETE FROM bills WHERE id = ?`, [id]);
  return res.json({ message: "Đã xóa hóa đơn" });
};

module.exports = { listResident, listAdmin, create, updateStatus, update, pay, remove };
