-- setup-db.sql - one-time script to create the database and seed sample rows
-- run with: mysql -u root -p < setup-db.sql

CREATE DATABASE IF NOT EXISTS inclass_part1;
USE inclass_part1;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL
);

-- seed a couple of rows so the endpoints show real data (only if tables are empty)
INSERT INTO users (name, email)
SELECT * FROM (
  SELECT 'Shiv Patel', 'shiv@gmail.com'
  UNION ALL
  SELECT 'Test User', 'test@gmail.com'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM users);

INSERT INTO products (name, price)
SELECT * FROM (
  SELECT 'Keyboard', 49.99
  UNION ALL
  SELECT 'Mouse', 19.99
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM products);
