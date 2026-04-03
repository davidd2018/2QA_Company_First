const mysql = require("mysql2/promise");
require("dotenv").config();
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "Quang@12345";
const DB_NAME = process.env.DB_NAME || "ql_chungcu";
async function initDatabase() {
  const tempConn = await mysql.createConnection({ host: DB_HOST, user: DB_USER, password: DB_PASSWORD });
  await tempConn.query("CREATE DATABASE IF NOT EXISTS `" + DB_NAME + "`");
  await tempConn.end();
  const pool = mysql.createPool({ host: DB_HOST, user: DB_USER, password: DB_PASSWORD, database: DB_NAME, waitForConnections: true, connectionLimit: 10 });
  await pool.query("CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, fullname VARCHAR(100) NOT NULL, email VARCHAR(100) UNIQUE, password VARCHAR(255) NOT NULL, phone VARCHAR(15) UNIQUE, room_number VARCHAR(10) NULL, role ENUM('admin','manager','staff','resident') DEFAULT 'resident', status ENUM('active','inactive','pending') DEFAULT 'pending', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP)");
  await pool.query("CREATE TABLE IF NOT EXISTS rooms (id INT AUTO_INCREMENT PRIMARY KEY, room_number VARCHAR(10) UNIQUE NOT NULL, floor INT NOT NULL, area DECIMAL(5,2), status ENUM('occupied','empty','repairing') DEFAULT 'empty')");
  await pool.query("CREATE TABLE IF NOT EXISTS notifications (id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NOT NULL, content TEXT NOT NULL, category ENUM('emergency','maintenance','general','event') DEFAULT 'general', author_id INT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
  await pool.query("CREATE TABLE IF NOT EXISTS bills (id INT AUTO_INCREMENT PRIMARY KEY, room_id INT, bill_type ENUM('electricity','water','service','parking') NOT NULL, amount DECIMAL(15,2) NOT NULL, usage_value FLOAT NULL, month_year VARCHAR(7) NOT NULL, due_date DATE, status ENUM('unpaid','paid','overdue') DEFAULT 'unpaid', created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
  await pool.query("CREATE TABLE IF NOT EXISTS feedback (id INT AUTO_INCREMENT PRIMARY KEY, resident_id INT, title VARCHAR(255) NOT NULL, content TEXT NOT NULL, status ENUM('open','in_progress','resolved','closed') DEFAULT 'open', assigned_to INT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
  console.log("DB and tables ready.");
  return pool;
}
module.exports = initDatabase();
