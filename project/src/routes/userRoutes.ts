// userRoutes.ts - all endpoints for /users
import { Router, Request, Response } from "express";
import { db } from "../db";

const router = Router();

// GET /users - all users (we never send the password back)
router.get("/", async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query("SELECT user_id, name, email, phone FROM users");
    res.json(rows);
  } catch (err) {
    console.log("GET /users failed:", err);
    res.status(500).json({ error: "Could not load users" });
  }
});

// POST /users - create a new user
router.post("/", async (req: Request, res: Response) => {
  const { name, email, phone, password } = req.body;
  if (!name || !email || !password) {
    res.status(400).json({ error: "name, email and password are required" });
    return;
  }
  try {
    const [result]: any = await db.query(
      "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)",
      [name, email, phone || null, password]
    );
    res.status(201).json({ userId: result.insertId, name, email });
  } catch (err) {
    console.log("POST /users failed:", err);
    res.status(500).json({ error: "Could not create user (email may already exist)" });
  }
});

// GET /users/:userId/bookings - all bookings of one user, with the hotel and
// room names joined in. Used by the My Bookings page.
router.get("/:userId/bookings", async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query(
      `SELECT b.booking_id, b.check_in_date, b.check_out_date, b.total_price, b.status,
              h.name AS hotel_name, r.type AS room_type
       FROM bookings b
       JOIN rooms r  ON r.room_id  = b.room_id
       JOIN hotels h ON h.hotel_id = r.hotel_id
       WHERE b.user_id = ?`,
      [req.params.userId]
    );
    res.json(rows);
  } catch (err) {
    console.log("GET /users/:userId/bookings failed:", err);
    res.status(500).json({ error: "Could not load bookings" });
  }
});

export default router;
