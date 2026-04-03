const dbPromise = require("../config/db");

const listAll = async (_req, res) => {
  const db = await dbPromise;
  const [rows] = await db.query(
    `SELECT id, title, content, category, author_id, created_at FROM notifications ORDER BY created_at DESC`
  );
  return res.json(rows);
};

const listAdmin = async (_req, res) => {
  const db = await dbPromise;
  const [rows] = await db.query(
    `SELECT id, title, content, category, author_id, created_at FROM notifications ORDER BY created_at DESC`
  );
  return res.json(rows);
};

const create = async (req, res) => {
  const db = await dbPromise;
  const { title, content, category } = req.body || {};
  if (!title || !content)
    return res.status(400).json({ message: "Thiếu title hoặc content" });

  const [result] = await db.query(
    `INSERT INTO notifications (title, content, category, author_id) VALUES (?, ?, ?, ?)`,
    [title, content, category || "general", req.user.id]
  );
  const [rows] = await db.query(
    `SELECT id, title, content, category, author_id, created_at FROM notifications WHERE id = ?`,
    [result.insertId]
  );
  return res.status(201).json(rows[0]);
};

const update = async (req, res) => {
  const db = await dbPromise;
  const { title, content, category } = req.body || {};
  const { id } = req.params;
  if (!title || !content)
    return res.status(400).json({ message: "Thiếu title hoặc content" });

  await db.query(
    `UPDATE notifications SET title = ?, content = ?, category = ? WHERE id = ?`,
    [title, content, category || "general", id]
  );
  const [rows] = await db.query(
    `SELECT id, title, content, category, author_id, created_at FROM notifications WHERE id = ?`,
    [id]
  );
  return res.json(rows[0]);
};

const remove = async (req, res) => {
  const db = await dbPromise;
  const { id } = req.params;
  await db.query(`DELETE FROM notifications WHERE id = ?`, [id]);
  return res.json({ message: "Đã xóa thông báo" });
};

module.exports = { listAll, listAdmin, create, update, remove };
