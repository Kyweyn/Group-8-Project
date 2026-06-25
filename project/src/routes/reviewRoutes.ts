// reviewRoutes.ts - all endpoints for /reviews
import { Router, Request, Response } from "express";
import { db } from "../db";

const router = Router();

// GET /reviews - all reviews together with the user name and hotel name
router.get("/", async (req: Request, res: Response) => {
  try {
    const [rows] = await db.query(
      `SELECT rv.review_id, rv.rating, rv.comment, rv.date,
              u.name AS user_name, h.name AS hotel_name
       FROM reviews rv
       JOIN users u  ON u.user_id  = rv.user_id
       JOIN hotels h ON h.hotel_id = rv.hotel_id`
    );
    res.json(rows);
  } catch (err) {
    console.log("GET /reviews failed:", err);
    res.status(500).json({ error: "Could not load reviews" });
  }
});

// POST /reviews - add a review for a hotel
router.post("/", async (req: Request, res: Response) => {
  const { userId, hotelId, rating, comment } = req.body;
  if (!userId || !hotelId || !rating) {
    res.status(400).json({ error: "userId, hotelId and rating are required" });
    return;
  }
  try {
    const [result]: any = await db.query(
      "INSERT INTO reviews (user_id, hotel_id, rating, comment) VALUES (?, ?, ?, ?)",
      [userId, hotelId, rating, comment || null]
    );
    res.status(201).json({ reviewId: result.insertId, userId, hotelId, rating });
  } catch (err) {
    console.log("POST /reviews failed:", err);
    res.status(500).json({ error: "Could not create review" });
  }
});

export default router;
