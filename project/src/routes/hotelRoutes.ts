// hotelRoutes.ts - all endpoints for /hotels
// GET routes are from Milestone 3. The POST / PUT / DELETE at the bottom are the
// Milestone 4 work (added by Daiju). Every query is parameterized with ? so user
// input can never be injected into the SQL.
import { Router, Request, Response } from "express";
import { db } from "../db";
import { requireAuth, requireAdmin } from "../middleware/auth";

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
// Returns hotels in the city that still have a free room for the dates.
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

// ---- Milestone 4: create / update / delete a hotel (added by Daiju) ----
// Milestone 5: the three routes below now run requireAuth first (you need a
// valid token) and then requireAdmin (your role must be 'admin'). The GET
// routes above stay open because anyone should be able to browse hotels.

// POST /hotels - add a new hotel. Returns 201 Created with the new id.
router.post("/", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { name, city, address, starRating, description } = req.body;

  // the NOT NULL columns must be present
  if (!name || !city || !address) {
    res.status(400).json({ error: "name, city and address are required" });
    return;
  }
  // star_rating has a CHECK (1-5) in the database, so we check it here too
  if (starRating != null && (starRating < 1 || starRating > 5)) {
    res.status(400).json({ error: "starRating must be between 1 and 5" });
    return;
  }

  try {
    const [result]: any = await db.query(
      "INSERT INTO hotels (name, city, address, star_rating, description) VALUES (?, ?, ?, ?, ?)",
      [name, city, address, starRating || null, description || null]
    );
    res.status(201).json({ hotelId: result.insertId, name, city });
  } catch (err) {
    console.log("POST /hotels failed:", err);
    res.status(500).json({ error: "Could not create hotel" });
  }
});

// PUT /hotels/:id - update an existing hotel by id
router.put("/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  const { name, city, address, starRating, description } = req.body;
  if (!name || !city || !address) {
    res.status(400).json({ error: "name, city and address are required" });
    return;
  }
  if (starRating != null && (starRating < 1 || starRating > 5)) {
    res.status(400).json({ error: "starRating must be between 1 and 5" });
    return;
  }
  try {
    // check the hotel exists first so we can return a clean 404 for a missing id
    const [rows]: any = await db.query(
      "SELECT hotel_id FROM hotels WHERE hotel_id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: "Hotel not found" });
      return;
    }
    await db.query(
      "UPDATE hotels SET name = ?, city = ?, address = ?, star_rating = ?, description = ? WHERE hotel_id = ?",
      [name, city, address, starRating || null, description || null, req.params.id]
    );
    res.json({ hotelId: Number(req.params.id), name, city });
  } catch (err) {
    console.log("PUT /hotels/:id failed:", err);
    res.status(500).json({ error: "Could not update hotel" });
  }
});

// DELETE /hotels/:id - remove a hotel by id
router.delete("/:id", requireAuth, requireAdmin, async (req: Request, res: Response) => {
  try {
    const [result]: any = await db.query(
      "DELETE FROM hotels WHERE hotel_id = ?",
      [req.params.id]
    );
    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Hotel not found" });
      return;
    }
    res.json({ message: "Hotel deleted", hotelId: Number(req.params.id) });
  } catch (err: any) {
    // errno 1451 = the hotel still has rooms pointing to it (foreign key)
    if (err && err.errno === 1451) {
      res.status(409).json({ error: "Cannot delete hotel: it still has rooms" });
      return;
    }
    console.log("DELETE /hotels/:id failed:", err);
    res.status(500).json({ error: "Could not delete hotel" });
  }
});

export default router;
