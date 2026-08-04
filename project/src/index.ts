// index.ts - entry point for the Hotel Booking API
// This file only sets up middleware and registers the route files.
// No route logic (no SQL queries) lives here.

import express from "express";
import cors from "cors";
import { config } from "./config";
import hotelRoutes from "./routes/hotelRoutes";
import roomRoutes from "./routes/roomRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import userRoutes from "./routes/userRoutes";
import reviewRoutes from "./routes/reviewRoutes";

const app = express();

// The React app runs on http://localhost:5173 and the API on 3001. Because the
// ports are different the browser treats them as two different origins and
// blocks the fetch(), so we have to allow our frontend here.
app.use(
  cors({
    origin: config.frontendUrl,
  })
);

// express.json() lets us read JSON bodies from POST/PUT requests (req.body)
app.use(express.json());

// simple health check so we know the server is alive
app.get("/", (req, res) => {
  res.send("Hotel Booking API is running! Try /hotels, /rooms, /bookings, /users or /reviews");
});

// register the routes - one line per route file
// pattern: app.use(prefix, router)
app.use("/hotels", hotelRoutes);
app.use("/rooms", roomRoutes);
app.use("/bookings", bookingRoutes);
app.use("/users", userRoutes);
app.use("/reviews", reviewRoutes);

app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`);
});
