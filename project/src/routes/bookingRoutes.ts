// bookingRoutes.ts - all endpoints for /bookings
import { Router, Request, Response } from "express";
import { db } from "../db";

const router = Router();

// GET /bookings - all bookings
router.get("/", async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query("SELECT * FROM bookings");
    res.json(rows);
  } catch (err) {
    console.log("GET /bookings failed:", err);
    res.status(500).json({ error: "Could not load bookings" });
  }
});

// GET /bookings/:id - one booking
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query(
      "SELECT * FROM bookings WHERE booking_id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }
    res.json(rows[0]);
  } catch (err) {
    console.log("GET /bookings/:id failed:", err);
    res.status(500).json({ error: "Could not load booking" });
  }
});

// POST /bookings - create a booking.
// We use a transaction so two people can't book the last free room for the
// same dates at the same time (this is the double-booking problem from our
// Milestone 2 design).
router.post("/", async (req: Request, res: Response) => {
  const { userId, roomId, checkInDate, checkOutDate } = req.body;

  if (!userId || !roomId || !checkInDate || !checkOutDate) {
    res.status(400).json({ error: "userId, roomId, checkInDate and checkOutDate are required" });
    return;
  }
  if (checkOutDate <= checkInDate) {
    res.status(400).json({ error: "checkOutDate must be after checkInDate" });
    return;
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // lock the room row so the availability check below is reliable
    const [roomRows]: any = await conn.query(
      "SELECT price_per_night, quantity_available FROM rooms WHERE room_id = ? FOR UPDATE",
      [roomId]
    );
    if (roomRows.length === 0) {
      await conn.rollback();
      res.status(404).json({ error: "Room not found" });
      return;
    }
    const room = roomRows[0];

    // how many of this room type are already booked for overlapping dates
    const [bookedRows]: any = await conn.query(
      `SELECT COUNT(*) AS taken FROM bookings
       WHERE room_id = ? AND status = 'confirmed'
         AND check_in_date < ? AND check_out_date > ?`,
      [roomId, checkOutDate, checkInDate]
    );

    if (bookedRows[0].taken >= room.quantity_available) {
      await conn.rollback();
      res.status(409).json({ error: "Room not available for these dates" });
      return;
    }

    // total price = price per night x number of nights
    const nights =
      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
      (1000 * 60 * 60 * 24);
    const totalPrice = Number(room.price_per_night) * nights;

    const [result]: any = await conn.query(
      `INSERT INTO bookings (user_id, room_id, check_in_date, check_out_date, total_price, status)
       VALUES (?, ?, ?, ?, ?, 'confirmed')`,
      [userId, roomId, checkInDate, checkOutDate, totalPrice]
    );

    await conn.commit();
    res.status(201).json({
      bookingId: result.insertId,
      totalPrice,
      status: "confirmed",
    });
  } catch (err) {
    await conn.rollback();
    console.log("POST /bookings failed:", err);
    res.status(500).json({ error: "Could not create booking" });
  } finally {
    conn.release();
  }
});

// PUT /bookings/:id - change the dates of a booking and recalculate the price
router.put("/:id", async (req: Request, res: Response) => {
  const { checkInDate, checkOutDate } = req.body;
  if (!checkInDate || !checkOutDate) {
    res.status(400).json({ error: "checkInDate and checkOutDate are required" });
    return;
  }
  if (checkOutDate <= checkInDate) {
    res.status(400).json({ error: "checkOutDate must be after checkInDate" });
    return;
  }
  try {
    // find the booking and the price per night of its room
    const [rows]: any = await db.query(
      `SELECT b.booking_id, r.price_per_night
       FROM bookings b JOIN rooms r ON r.room_id = b.room_id
       WHERE b.booking_id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    const nights =
      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
      (1000 * 60 * 60 * 24);
    const totalPrice = Number(rows[0].price_per_night) * nights;

    await db.query(
      "UPDATE bookings SET check_in_date = ?, check_out_date = ?, total_price = ? WHERE booking_id = ?",
      [checkInDate, checkOutDate, totalPrice, req.params.id]
    );
    res.json({ bookingId: Number(req.params.id), totalPrice, status: "confirmed" });
  } catch (err) {
    console.log("PUT /bookings/:id failed:", err);
    res.status(500).json({ error: "Could not update booking" });
  }
});

// DELETE /bookings/:id - cancel a booking.
// We don't delete the row, we just set status to 'cancelled' so the user can
// still see it in their booking history.
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const [result]: any = await db.query(
      "UPDATE bookings SET status = 'cancelled' WHERE booking_id = ?",
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }
    res.json({ bookingId: Number(req.params.id), status: "cancelled" });
  } catch (err) {
    console.log("DELETE /bookings/:id failed:", err);
    res.status(500).json({ error: "Could not cancel booking" });
  }
});

export default router;
