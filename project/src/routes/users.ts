// users.ts - all the routes for /users
import { Router } from "express";
import { db } from "../db";

const router = Router();

// GET /users -> return all users as JSON
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    // if the table doesn't exist yet we still want JSON back, not a crash
    console.log("users query failed:", err);
    res.json([]);
  }
});

export default router;
