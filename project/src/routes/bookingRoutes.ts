// bookingRoutes.ts - all endpoints for /bookings
//
// Milestone 5: every route in this file needs a login, because a booking
// belongs to one person. On top of that we check that the booking really is
// yours - otherwise anybody could type /bookings/7 and cancel someone else's
// trip. An admin is allowed to see and change every booking.
import { Router, Request, Response } from "express";
import { db } from "../db";
import { checkId } from "../middleware/checkId";
import { requireAuth, requireAdmin } from "../middleware/auth";

const router = Router();

// every :id in this file has to be a number, otherwise 400
router.param("id", checkId);

// Small helper used by the routes below. It loads the booking and decides if
// the logged in user is allowed to touch it.
// Returns: "not-found" | "not-yours" | the booking row.
async function findBookingForUser(bookingId: string, req: Request) {
  const [rows]: any = await db.query(
    `SELECT b.booking_id, b.user_id, b.status, r.price_per_night
     FROM bookings b JOIN rooms r ON r.room_id = b.room_id
     WHERE b.booking_id = ?`,
    [bookingId]
  );
  if (rows.length === 0) return "not-found";

  const booking = rows[0];
  const isOwner = booking.user_id === req.user!.userId;
  const isAdmin = req.user!.role === "admin";
  if (!isOwner && !isAdmin) return "not-yours";

  return booking;
}

// GET /bookings - all bookings of everybody. Only the admin needs this one,
// a normal user gets their own list from GET /users/:userId/bookings.
router.get("/", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query("SELECT * FROM bookings");
    res.json(rows);
  } catch (err) {
    console.log("GET /bookings failed:", err);
    res.status(500).json({ error: "Could not load bookings" });
  }
});

// GET /bookings/:id - one booking (only your own, or any one if you are admin)
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query(
      "SELECT * FROM bookings WHERE booking_id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }
    if (rows[0].user_id !== req.user!.userId && req.user!.role !== "admin") {
      res.status(403).json({ error: "That booking is not yours" });
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
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const { roomId, checkInDate, checkOutDate } = req.body;

  // IMPORTANT: we take the user id from the token, NOT from the request body.
  // If we trusted req.body.userId anyone could book a room in someone else's
  // name just by changing a number in the JSON.
  const userId = req.user!.userId;

  if (!roomId || !checkInDate || !checkOutDate) {
    res.status(400).json({ error: "roomId, checkInDate and checkOutDate are required" });
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
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
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
    // find the booking, check it belongs to us and get the price per night
    const booking = await findBookingForUser(req.params.id, req);
    if (booking === "not-found") {
      res.status(404).json({ error: "Booking not found" });
      return;
    }
    if (booking === "not-yours") {
      res.status(403).json({ error: "That booking is not yours" });
      return;
    }

    const nights =
      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
      (1000 * 60 * 60 * 24);
    const totalPrice = Number(booking.price_per_night) * nights;

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
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const booking = await findBookingForUser(req.params.id, req);
    if (booking === "not-found") {
      res.status(404).json({ error: "Booking not found" });
      return;
    }
    if (booking === "not-yours") {
      res.status(403).json({ error: "That booking is not yours" });
      return;
    }

    await db.query(
      "UPDATE bookings SET status = 'cancelled' WHERE booking_id = ?",
      [req.params.id]
    );
    res.json({ bookingId: Number(req.params.id), status: "cancelled" });
  } catch (err) {
    console.log("DELETE /bookings/:id failed:", err);
    res.status(500).json({ error: "Could not cancel booking" });
  }
});

export default router;
