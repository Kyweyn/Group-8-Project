// db.ts - shared database connection for the Hotel Booking API
// We use the mysql2 library with a connection pool so that every route file
// can run async queries against the same connection. This is the single
// source of truth for the database connection.
//
// Milestone 5: the host / user / password are not written in this file
// anymore, they come from the .env file through config.ts.

import mysql from "mysql2";
import { config } from "./config";

// A pool keeps several connections open and reuses them, which is better for
// an API than opening a brand new connection for every request.
const pool = mysql.createPool({
  host: config.dbHost,
  port: config.dbPort,
  user: config.dbUser,
  password: config.dbPassword,
  database: config.dbName,
  // Without this mysql2 turns a DATE column into a JavaScript Date object at
  // midnight in the timezone of the computer. When that gets sent as JSON it
  // becomes something like "2026-06-30T18:30:00.000Z" and the frontend showed
  // the day BEFORE the real check in date. dateStrings keeps a DATE as the
  // plain text "2026-07-01" that MySQL stored, so no timezone maths happens.
  dateStrings: true,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Export the promise version so we can use async/await in the route files:
//   import { db } from "../db";
export const db = pool.promise();
