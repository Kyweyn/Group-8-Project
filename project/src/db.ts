// db.ts - shared database connection for the Hotel Booking API
// We use the mysql2 library with a connection pool so that every route file
// can run async queries against the same connection. This is the single
// source of truth for the database connection - if the credentials change,
// we only edit this one file.

import mysql from "mysql2";

// A pool keeps several connections open and reuses them, which is better for
// an API than opening a brand new connection for every request.
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Shiv@9510",
  database: "hotel_booking",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Export the promise version so we can use async/await in the route files:
//   import { db } from "../db";
export const db = pool.promise();
