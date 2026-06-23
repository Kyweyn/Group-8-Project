// hotelRoutes.ts - all endpoints for /hotels
import { Router, Request, Response } from "express";
import { db } from "../db";

const router = Router();

// GET /hotels - list all hotels with their cheapest ("starting") price
router.get("/", async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query(
      `SELECT h.hotel_id, h.name, h.city, h.star_rating,
              MIN(r.price_per_night) AS starting_price
       FROM hotels h
       LEFT JOIN rooms r ON r.hotel_id = h.hotel_id
       GROUP BY h.hotel_id`
    );
    res.json(rows);
  } catch (err) {
    console.log("GET /hotels failed:", err);
    res.status(500).json({ error: "Could not load hotels" });
  }
});

// GET /hotels/search?city=&checkin=&checkout=&guests=
// Returns hotels in the city that still have a free room for the dates with
// enough space for the guests.
// IMPORTANT: this must be defined BEFORE "/:id", otherwise Express thinks
// "search" is an :id value.
router.get("/search", async (req: Request, res: Response) => {
  try {
    const { city, checkin, checkout, guests } = req.query;
    const guestCount = Number(guests) || 1;

    const [rows] = await db.query(
      `SELECT DISTINCT h.hotel_id, h.name, h.city, h.star_rating
       FROM hotels h
       JOIN rooms r ON r.hotel_id = h.hotel_id
       WHERE h.city = ?
         AND r.max_guests >= ?
         AND r.quantity_available > (
           SELECT COUNT(*) FROM bookings b
           WHERE b.room_id = r.room_id
             AND b.status = 'confirmed'
             AND b.check_in_date < ?
             AND b.check_out_date > ?
         )`,
      [city, guestCount, checkout, checkin]
    );
    res.json(rows);
  } catch (err) {
    console.log("GET /hotels/search failed:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

// GET /hotels/:id - one hotel together with its room types
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const [hotelRows]: any = await db.query(
      "SELECT * FROM hotels WHERE hotel_id = ?",
      [req.params.id]
    );
    if (hotelRows.length === 0) {
      res.status(404).json({ error: "Hotel not found" });
      return;
    }
    const [rooms] = await db.query(
      "SELECT * FROM rooms WHERE hotel_id = ?",
      [req.params.id]
    );
    res.json({ ...hotelRows[0], rooms });
  } catch (err) {
    console.log("GET /hotels/:id failed:", err);
    res.status(500).json({ error: "Could not load hotel" });
  }
});

export default router;
