// index.ts - entry point for the Hotel Booking API
// This file only sets up middleware and registers the route files.
// No route logic (no SQL queries) lives here.

import express from "express";
import hotelRoutes from "./routes/hotelRoutes";
import roomRoutes from "./routes/roomRoutes";
import bookingRoutes from "./routes/bookingRoutes";

const app = express();
const PORT = 3001;

// express.json() lets us read JSON bodies from POST/PUT requests (req.body)
app.use(express.json());

// simple health check so we know the server is alive
app.get("/", (req, res) => {
  res.send("Hotel Booking API is running! Try /hotels, /rooms or /bookings");
});

// ── REGISTER ROUTES ───────────────────────────────────────────────
// pattern: app.use(prefix, router)
app.use("/hotels", hotelRoutes);
app.use("/rooms", roomRoutes);
app.use("/bookings", bookingRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
