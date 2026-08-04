// config.ts - one place that reads every setting out of the .env file.
//
// Before Milestone 5 the MySQL password was typed directly into db.ts, which
// meant our real password was pushed to GitHub. Now everything secret lives in
// a .env file that is listed in .gitignore, and only .env.example (with fake
// values) is committed.
import dotenv from "dotenv";

// dotenv.config() reads the .env file and puts everything into process.env
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3001,

  // database connection
  dbHost: process.env.DB_HOST || "localhost",
  dbUser: process.env.DB_USER || "root",
  dbPassword: process.env.DB_PASSWORD || "",
  dbName: process.env.DB_NAME || "hotel_booking",

  // login token
  jwtSecret: process.env.JWT_SECRET || "",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "2h",

  // the address of the React app, used by CORS
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  // Claude API (used by the AI helper component)
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  anthropicModel: process.env.ANTHROPIC_MODEL || "claude-sonnet-5",
};

// If the secret is missing every token we sign would be worthless, so we stop
// the server straight away instead of starting a broken API.
if (!config.jwtSecret) {
  console.error(
    "JWT_SECRET is missing. Copy .env.example to .env and put a long random value in it."
  );
  process.exit(1);
}
