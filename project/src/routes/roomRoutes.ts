// roomRoutes.ts - all endpoints for /rooms
import { Router, Request, Response } from "express";
import { db } from "../db";

const router = Router();

// GET /rooms - all room types
router.get("/", async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query("SELECT * FROM rooms");
    res.json(rows);
  } catch (err) {
    console.log("GET /rooms failed:", err);
    res.status(500).json({ error: "Could not load rooms" });
  }
});

// GET /rooms/:id - details of one room type
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query(
      "SELECT * FROM rooms WHERE room_id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    console.log("GET /rooms/:id failed:", err);
    res.status(500).json({ error: "Could not load room" });
  }
});

export default router;
