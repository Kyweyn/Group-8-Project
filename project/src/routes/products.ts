// products.ts - all the routes for /products
import { Router } from "express";
import { db } from "../db";

const router = Router();

// GET /products -> return all products as JSON
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    console.log("products query failed:", err);
    res.json([]);
  }
});

export default router;
