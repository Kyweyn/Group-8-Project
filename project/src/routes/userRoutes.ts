// userRoutes.ts - all endpoints for /users
// GET and POST are from Milestone 3. The PUT / DELETE are the Milestone 4 work
// (added by Shiv). Every query is parameterized with ?.
//
// Milestone 5: POST /users now hashes the password with bcrypt before the
// INSERT, so the database never contains a plain text password.
import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { db } from "../db";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// You may look at / change / delete an account if it is your own account, or
// if you are an admin. Everybody else gets a 403.
function isMeOrAdmin(req: Request, userId: string) {
  return req.user!.userId === Number(userId) || req.user!.role === "admin";
}

// bcrypt "salt rounds" - how much work hashing costs. 10 is the normal value:
// high enough to be slow for an attacker, fast enough for our API.
const SALT_ROUNDS = 10;

// GET /users - all users (we never send the password back).
// The list of every account is admin only.
router.get("/", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query("SELECT user_id, name, email, phone, role FROM users");
    res.json(rows);
  } catch (err) {
    console.log("GET /users failed:", err);
    res.status(500).json({ error: "Could not load users" });
  }
});

// POST /users - create a new user.
// The password is hashed with bcrypt first, we never store what the user typed.
router.post("/", async (req: Request, res: Response) => {
  const { name, phone, password } = req.body;
  // same rule as in /auth/register: trim it and keep the email in lower case
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";

  if (!name || !email || !password) {
    res.status(400).json({ error: "name, email and password are required" });
    return;
  }
  if (String(password).length < 8) {
    res.status(400).json({ error: "password must be at least 8 characters" });
    return;
  }
  try {
    // bcrypt.hash() gives back something like $2b$10$Nq8f... - the salt is
    // stored inside the hash, so we do not need an extra column for it.
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const [result]: any = await db.query(
      "INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)",
      [name, email, phone || null, hashedPassword]
    );
    // we send back the id and the name, never the password or the hash
    res.status(201).json({ userId: result.insertId, name, email });
  } catch (err) {
    console.log("POST /users failed:", err);
    res.status(500).json({ error: "Could not create user (email may already exist)" });
  }
});

// GET /users/:userId/bookings - all bookings of one user, with the hotel and
// room names joined in. Used by the My Bookings page.
router.get("/:userId/bookings", requireAuth, async (req: Request, res: Response) => {
  if (!isMeOrAdmin(req, req.params.userId)) {
    res.status(403).json({ error: "You can only see your own bookings" });
    return;
  }
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

// ---- Milestone 4: update / delete a user (added by Shiv) ----

// PUT /users/:id - update a user's name, email and phone by id
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  const { name, phone } = req.body;
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";

  if (!isMeOrAdmin(req, req.params.id)) {
    res.status(403).json({ error: "You can only edit your own account" });
    return;
  }
  if (!name || !email) {
    res.status(400).json({ error: "name and email are required" });
    return;
  }
  try {
    // check the user exists first so a missing id returns a clean 404
    const [rows]: any = await db.query(
      "SELECT user_id FROM users WHERE user_id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    await db.query(
      "UPDATE users SET name = ?, email = ?, phone = ? WHERE user_id = ?",
      [name, email, phone || null, req.params.id]
    );
    res.json({ userId: Number(req.params.id), name, email });
  } catch (err: any) {
    // errno 1062 = the email is already used by another user (UNIQUE column)
    if (err && err.errno === 1062) {
      res.status(409).json({ error: "That email is already in use" });
      return;
    }
    console.log("PUT /users/:id failed:", err);
    res.status(500).json({ error: "Could not update user" });
  }
});

// DELETE /users/:id - remove a user by id
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  if (!isMeOrAdmin(req, req.params.id)) {
    res.status(403).json({ error: "You can only delete your own account" });
    return;
  }
  try {
    const [result]: any = await db.query(
      "DELETE FROM users WHERE user_id = ?",
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ message: "User deleted", userId: Number(req.params.id) });
  } catch (err: any) {
    // errno 1451 = the user still has bookings or reviews (foreign key)
    if (err && err.errno === 1451) {
      res.status(409).json({ error: "Cannot delete user: they still have bookings or reviews" });
      return;
    }
    console.log("DELETE /users/:id failed:", err);
    res.status(500).json({ error: "Could not delete user" });
  }
});

export default router;
