const mysql = require("mysql2");
require("dotenv").config();

const pool = mysql.createPool({
  host: "localhost",
  user: "root", // Thay bằng user HeidiSQL của bạn
  password: "Kquynh@2911", // Thay bằng pass HeidiSQL của bạn
  database: "apartment_portal",
  waitForConnections: true,
  connectionLimit: 10,
});

module.exports = pool.promise();
