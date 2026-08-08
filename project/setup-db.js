// setup-db.js - one-time script to create the database, all tables and sample data.
// Run with:  node setup-db.js
// (You can also just run database/schema.sql in MySQL Workbench instead.)

const mysql = require("mysql2/promise");
const bcrypt = require("bcryptjs");

// read the same .env file the server uses, so the password is only in one place
require("dotenv").config();

async function main() {
  // connect WITHOUT selecting a database first so we can create it
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    multipleStatements: false,
  });

  // A database name cannot be a ? parameter in SQL, so we check it ourselves
  // and only allow letters, numbers and underscores. It comes from our own
  // .env file, but this way a typo cannot turn into a broken query.
  const dbName = process.env.DB_NAME || "hotel_booking";
  if (!/^[A-Za-z0-9_]+$/.test(dbName)) {
    throw new Error("DB_NAME may only contain letters, numbers and _");
  }

  await conn.query("CREATE DATABASE IF NOT EXISTS " + dbName);
  await conn.query("USE " + dbName);

  // ---- tables ----
  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      user_id   INT AUTO_INCREMENT PRIMARY KEY,
      name      VARCHAR(100) NOT NULL,
      email     VARCHAR(255) NOT NULL UNIQUE,
      phone     VARCHAR(20),
      password  VARCHAR(255) NOT NULL,
      role      VARCHAR(20)  NOT NULL DEFAULT 'user'
    ) ENGINE=InnoDB
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS hotels (
      hotel_id     INT AUTO_INCREMENT PRIMARY KEY,
      name         VARCHAR(150) NOT NULL,
      city         VARCHAR(100) NOT NULL,
      address      TEXT NOT NULL,
      star_rating  INT CHECK (star_rating BETWEEN 1 AND 5),
      description  TEXT
    ) ENGINE=InnoDB
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS rooms (
      room_id             INT AUTO_INCREMENT PRIMARY KEY,
      hotel_id            INT NOT NULL,
      type                VARCHAR(50) NOT NULL,
      price_per_night     DECIMAL(10,2) NOT NULL,
      max_guests          INT NOT NULL,
      quantity_available  INT NOT NULL,
      FOREIGN KEY (hotel_id) REFERENCES hotels(hotel_id)
    ) ENGINE=InnoDB
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      booking_id      INT AUTO_INCREMENT PRIMARY KEY,
      user_id         INT NOT NULL,
      room_id         INT NOT NULL,
      check_in_date   DATE NOT NULL,
      check_out_date  DATE NOT NULL,
      total_price     DECIMAL(10,2) NOT NULL,
      status          VARCHAR(20) NOT NULL DEFAULT 'confirmed',
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (room_id) REFERENCES rooms(room_id),
      CHECK (check_out_date > check_in_date)
    ) ENGINE=InnoDB
  `);

  await conn.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      review_id  INT AUTO_INCREMENT PRIMARY KEY,
      user_id    INT NOT NULL,
      hotel_id   INT NOT NULL,
      rating     INT CHECK (rating BETWEEN 1 AND 5),
      comment    TEXT,
      date       DATE DEFAULT (CURRENT_DATE),
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (hotel_id) REFERENCES hotels(hotel_id)
    ) ENGINE=InnoDB
  `);

  // ---- sample data (only if the tables are empty, so it is safe to re-run) ----
  const [u] = await conn.query("SELECT COUNT(*) AS c FROM users");
  if (u[0].c === 0) {
    // Milestone 5: we hash the demo passwords with bcrypt before inserting them.
    // Nothing plain text ever reaches the database.
    const adminPassword = bcrypt.hashSync("Admin123", 10);
    const demoPassword = bcrypt.hashSync("Password123", 10);

    await conn.query(
      "INSERT INTO users (name, email, phone, password, role) VALUES ?",
      [[
        ["Admin User", "admin@example.com", "519-555-0100", adminPassword, "admin"],
        ["Shiv Patel", "shiv@example.com", "519-555-0101", demoPassword, "user"],
        ["Daiju Saji", "daiju@example.com", "519-555-0102", demoPassword, "user"],
      ]]
    );

    await conn.query(
      "INSERT INTO hotels (name, city, address, star_rating, description) VALUES ?",
      [[
        ["Grand Conestoga Hotel", "Kitchener", "123 King St W, Kitchener, ON", 4, "Modern hotel in downtown Kitchener."],
        ["Waterloo Inn", "Waterloo", "45 University Ave, Waterloo, ON", 3, "Cozy inn close to the universities."],
        ["Cambridge Riverside", "Cambridge", "78 Water St, Cambridge, ON", 5, "Luxury rooms by the Grand River."],
      ]]
    );

    await conn.query(
      "INSERT INTO rooms (hotel_id, type, price_per_night, max_guests, quantity_available) VALUES ?",
      [[
        [1, "Single", 89.0, 1, 5],
        [1, "Double", 129.0, 2, 4],
        [1, "Suite", 199.0, 4, 2],
        [2, "Single", 75.0, 1, 6],
        [2, "Double", 110.0, 2, 3],
        [3, "Suite", 249.0, 4, 2],
      ]]
    );

    // user_id 2 = Shiv, user_id 3 = Daiju (user_id 1 is the admin account)
    await conn.query(
      "INSERT INTO bookings (user_id, room_id, check_in_date, check_out_date, total_price, status) VALUES ?",
      [[
        [2, 2, "2026-07-01", "2026-07-04", 387.0, "confirmed"],
        [3, 4, "2026-08-10", "2026-08-12", 150.0, "confirmed"],
      ]]
    );

    await conn.query(
      "INSERT INTO reviews (user_id, hotel_id, rating, comment) VALUES ?",
      [[
        [2, 1, 5, "Great stay, clean rooms and friendly staff."],
        [3, 3, 4, "Beautiful view of the river."],
      ]]
    );
  }

  console.log("Database '" + dbName + "' is ready with all tables and sample data.");
  console.log("Demo logins:  admin@example.com / Admin123   (admin)");
  console.log("              shiv@example.com  / Password123 (normal user)");
  await conn.end();
}

main().catch((err) => {
  console.error("Setup failed:", err.message);
  process.exit(1);
});
