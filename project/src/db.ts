// db.ts - database connection for my Express project
// Using mysql2 so I can use a connection pool

import mysql from "mysql2";

// connection pool (better than a single connection for an API)
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Shiv@9510",
  database: "inclass_part1",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// export the promise version so I can use async/await in my routes
export const db = pool.promise();
