const dbPromise = require("../config/db");

const listResident = async (req, res) => {
  const db = await dbPromise;
  const [rows] = await db.query(
    `SELECT * FROM feedback WHERE resident_id = ? ORDER BY created_at DESC`,
    [req.user.id]
  );
  return res.json(rows);
};

const listAdmin = async (_req, res) => {
  const db = await dbPromise;
  const [rows] = await db.query(
    `SELECT f.*, r.fullname AS resident_fullname, a.fullname AS assigned_fullname
     FROM feedback f
     JOIN users r ON r.id = f.resident_id
     LEFT JOIN users a ON a.id = f.assigned_to
     ORDER BY f.created_at DESC`
  );
  return res.json(rows);
};

const create = async (req, res) => {
  const db = await dbPromise;
  const { title, content } = req.body || {};
  if (!title || !content)
    return res.status(400).json({ message: "Thiếu title hoặc content" });

  const [result] = await db.query(
    `INSERT INTO feedback (resident_id, title, content, status, assigned_to) VALUES (?, ?, ?, 'open', NULL)`,
    [req.user.id, title, content]
  );
  const [rows] = await db.query(`SELECT * FROM feedback WHERE id = ?`, [result.insertId]);
  return res.status(201).json(rows[0]);
};

const update = async (req, res) => {
  const db = await dbPromise;
  const { id } = req.params;
  const { status, assigned_to } = req.body || {};
  if (!status) return res.status(400).json({ message: "Thiếu status" });

  await db.query(
    `UPDATE feedback SET status = ?, assigned_to = ? WHERE id = ?`,
    [status, assigned_to || null, id]
  );
  const [rows] = await db.query(`SELECT * FROM feedback WHERE id = ?`, [id]);
  return res.json(rows[0]);
};

const remove = async (req, res) => {
  const db = await dbPromise;
  const { id } = req.params;
  await db.query(`DELETE FROM feedback WHERE id = ?`, [id]);
  return res.json({ message: "Đã xóa phản ánh" });
};

module.exports = { listResident, listAdmin, create, update, remove };
