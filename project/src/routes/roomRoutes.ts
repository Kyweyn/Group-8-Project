// roomRoutes.ts - all endpoints for /rooms
// GET routes are from Milestone 3. The POST / PUT / DELETE at the bottom are the
// Milestone 4 work (added by Kyle). Every query is parameterized with ?.
import { Router, Request, Response } from "express";
import { db } from "../db";
import { checkId } from "../middleware/checkId";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// every :id in this file has to be a number, otherwise 400
router.param("id", checkId);

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

// ---- Milestone 4: create / update / delete a room (added by Kyle) ----
// Milestone 5: only an admin may add, change or delete a room type, so these
// three routes go through requireAuth + requireAdmin first.

// POST /rooms - add a new room type to a hotel. Returns 201 Created.
router.post("/", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { hotelId, type, pricePerNight, maxGuests, quantityAvailable } = req.body;

  // all of these are NOT NULL columns, so all are required
  if (
    !hotelId ||
    !type ||
    pricePerNight == null ||
    maxGuests == null ||
    quantityAvailable == null
  ) {
    res.status(400).json({
      error: "hotelId, type, pricePerNight, maxGuests and quantityAvailable are required",
    });
    return;
  }

  try {
    const [result]: any = await db.query(
      `INSERT INTO rooms (hotel_id, type, price_per_night, max_guests, quantity_available)
       VALUES (?, ?, ?, ?, ?)`,
      [hotelId, type, pricePerNight, maxGuests, quantityAvailable]
    );
    res.status(201).json({ roomId: result.insertId, hotelId, type });
  } catch (err: any) {
    // errno 1452 = the hotelId points to a hotel that does not exist (foreign key)
    if (err && err.errno === 1452) {
      res.status(400).json({ error: "That hotelId does not exist" });
      return;
    }
    console.log("POST /rooms failed:", err);
    res.status(500).json({ error: "Could not create room" });
  }
});

// PUT /rooms/:id - update a room type by id
router.put("/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { type, pricePerNight, maxGuests, quantityAvailable } = req.body;
  if (!type || pricePerNight == null || maxGuests == null || quantityAvailable == null) {
    res.status(400).json({
      error: "type, pricePerNight, maxGuests and quantityAvailable are required",
    });
    return;
  }
  try {
    // check the room exists first so a missing id returns a clean 404
    const [rows]: any = await db.query(
      "SELECT room_id FROM rooms WHERE room_id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    await db.query(
      `UPDATE rooms SET type = ?, price_per_night = ?, max_guests = ?, quantity_available = ?
       WHERE room_id = ?`,
      [type, pricePerNight, maxGuests, quantityAvailable, req.params.id]
    );
    res.json({ roomId: Number(req.params.id), type });
  } catch (err) {
    console.log("PUT /rooms/:id failed:", err);
    res.status(500).json({ error: "Could not update room" });
  }
});

// DELETE /rooms/:id - remove a room type by id
router.delete("/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const [result]: any = await db.query(
      "DELETE FROM rooms WHERE room_id = ?",
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    res.json({ message: "Room deleted", roomId: Number(req.params.id) });
  } catch (err: any) {
    // errno 1451 = the room still has bookings pointing to it (foreign key)
    if (err && err.errno === 1451) {
      res.status(409).json({ error: "Cannot delete room: it still has bookings" });
      return;
    }
    console.log("DELETE /rooms/:id failed:", err);
    res.status(500).json({ error: "Could not delete room" });
  }
});

export default router;
