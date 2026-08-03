-- ============================================================
--  HOTEL BOOKING DATABASE - schema.sql
--  Made by: Kyle Wayne Darjuan (Database Designer)
--
--  Creates the database and all 5 tables from our Milestone 2
--  design, then inserts some sample rows so the API returns data.
--
--  Run this file in MySQL Workbench, OR from the project folder run:
--     node setup-db.js
--  (Run once. Re-running the INSERTs would add duplicate sample rows.)
-- ============================================================

CREATE DATABASE IF NOT EXISTS hotel_booking;
USE hotel_booking;

-- ---------- users (customer accounts) ----------
-- Milestone 5: the password column now holds a bcrypt hash, never plain text.
-- A bcrypt hash is always 60 characters and starts with $2b$, so VARCHAR(255)
-- is more than enough. The "role" column decides who is allowed to add or
-- delete hotels and rooms ('admin') and who can only book ('user').
CREATE TABLE IF NOT EXISTS users (
  user_id   INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  email     VARCHAR(255) NOT NULL UNIQUE,
  phone     VARCHAR(20),
  password  VARCHAR(255) NOT NULL,         -- bcrypt hash, NEVER the plain password
  role      VARCHAR(20)  NOT NULL DEFAULT 'user'
) ENGINE=InnoDB;

-- ---------- hotels ----------
CREATE TABLE IF NOT EXISTS hotels (
  hotel_id     INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(150) NOT NULL,
  city         VARCHAR(100) NOT NULL,
  address      TEXT NOT NULL,
  star_rating  INT CHECK (star_rating BETWEEN 1 AND 5),
  description  TEXT
) ENGINE=InnoDB;

-- ---------- rooms (room types of each hotel) ----------
CREATE TABLE IF NOT EXISTS rooms (
  room_id             INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id            INT NOT NULL,
  type                VARCHAR(50) NOT NULL,        -- Single, Double, Suite ...
  price_per_night     DECIMAL(10,2) NOT NULL,
  max_guests          INT NOT NULL,
  quantity_available  INT NOT NULL,                -- how many rooms of this type exist
  FOREIGN KEY (hotel_id) REFERENCES hotels(hotel_id)
) ENGINE=InnoDB;

-- ---------- bookings (reservations) ----------
CREATE TABLE IF NOT EXISTS bookings (
  booking_id      INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT NOT NULL,
  room_id         INT NOT NULL,
  check_in_date   DATE NOT NULL,
  check_out_date  DATE NOT NULL,
  total_price     DECIMAL(10,2) NOT NULL,
  status          VARCHAR(20) NOT NULL DEFAULT 'confirmed',  -- confirmed / cancelled / completed
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (room_id) REFERENCES rooms(room_id),
  CHECK (check_out_date > check_in_date)
) ENGINE=InnoDB;

-- ---------- reviews (optional - ratings and comments) ----------
CREATE TABLE IF NOT EXISTS reviews (
  review_id  INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  hotel_id   INT NOT NULL,
  rating     INT CHECK (rating BETWEEN 1 AND 5),
  comment    TEXT,
  date       DATE DEFAULT (CURRENT_DATE),
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (hotel_id) REFERENCES hotels(hotel_id)
) ENGINE=InnoDB;


-- ============================================================
--  SAMPLE DATA
-- ============================================================

-- The two hashes below are bcrypt hashes of the demo passwords, they are NOT
-- the passwords themselves. We generated them once with bcrypt.hashSync().
--   admin@example.com -> Admin123
--   shiv@example.com  -> Password123
--   daiju@example.com -> Password123
INSERT INTO users (name, email, phone, password, role) VALUES
  ('Admin User', 'admin@example.com', '519-555-0100', '$2b$10$aa28uinkGzNuIYU8w0l64eaC9IQQhfs5mZkVm7X64z06jFwaLzjtK', 'admin'),
  ('Shiv Patel', 'shiv@example.com', '519-555-0101', '$2b$10$ootm54OklnUu6ZGSYPbJ0OJWWqO3ltdOOf0K.VrPmkfsB3/lUPYR.', 'user'),
  ('Daiju Saji', 'daiju@example.com', '519-555-0102', '$2b$10$ootm54OklnUu6ZGSYPbJ0OJWWqO3ltdOOf0K.VrPmkfsB3/lUPYR.', 'user');

INSERT INTO hotels (name, city, address, star_rating, description) VALUES
  ('Grand Conestoga Hotel', 'Kitchener', '123 King St W, Kitchener, ON', 4, 'Modern hotel in downtown Kitchener.'),
  ('Waterloo Inn', 'Waterloo', '45 University Ave, Waterloo, ON', 3, 'Cozy inn close to the universities.'),
  ('Cambridge Riverside', 'Cambridge', '78 Water St, Cambridge, ON', 5, 'Luxury rooms by the Grand River.');

INSERT INTO rooms (hotel_id, type, price_per_night, max_guests, quantity_available) VALUES
  (1, 'Single', 89.00,  1, 5),
  (1, 'Double', 129.00, 2, 4),
  (1, 'Suite',  199.00, 4, 2),
  (2, 'Single', 75.00,  1, 6),
  (2, 'Double', 110.00, 2, 3),
  (3, 'Suite',  249.00, 4, 2);

-- user_id 2 = Shiv, user_id 3 = Daiju (user_id 1 is the admin account)
INSERT INTO bookings (user_id, room_id, check_in_date, check_out_date, total_price, status) VALUES
  (2, 2, '2026-07-01', '2026-07-04', 387.00, 'confirmed'),
  (3, 4, '2026-08-10', '2026-08-12', 150.00, 'confirmed');

INSERT INTO reviews (user_id, hotel_id, rating, comment) VALUES
  (2, 1, 5, 'Great stay, clean rooms and friendly staff.'),
  (3, 3, 4, 'Beautiful view of the river.');
