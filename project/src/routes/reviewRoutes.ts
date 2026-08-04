// reviewRoutes.ts - all endpoints for /reviews
// GET and POST are from Milestone 3. The DELETE at the bottom is the Milestone 4
// work (added by Shiv). Every query is parameterized with ?.
import { Router, Request, Response } from "express";
import { db } from "../db";
import { requireAuth } from "../middleware/auth";

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

// POST /reviews - add a review for a hotel. You must be logged in, and the
// review is always saved under YOUR user id (taken from the token), so you
// cannot post a review in somebody else's name.
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const { hotelId, rating, comment } = req.body;
  const userId = req.user!.userId;

  if (!hotelId || !rating) {
    res.status(400).json({ error: "hotelId and rating are required" });
    return;
  }
  if (Number(rating) < 1 || Number(rating) > 5) {
    res.status(400).json({ error: "rating must be between 1 and 5" });
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

// ---- Milestone 4: delete a review (added by Shiv) ----

// DELETE /reviews/:id - remove a review by id.
// You can only delete your own review, unless you are an admin.
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query(
      "SELECT user_id FROM reviews WHERE review_id = ?",
      [req.params.id]
    );
    if (rows.length === 0) {
      res.status(404).json({ error: "Review not found" });
      return;
    }
    if (rows[0].user_id !== req.user!.userId && req.user!.role !== "admin") {
      res.status(403).json({ error: "That review is not yours" });
      return;
    }

    await db.query("DELETE FROM reviews WHERE review_id = ?", [req.params.id]);
    res.json({ message: "Review deleted", reviewId: Number(req.params.id) });
  } catch (err) {
    console.log("DELETE /reviews/:id failed:", err);
    res.status(500).json({ error: "Could not delete review" });
  }
});

export default router;
