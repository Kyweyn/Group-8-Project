// index.ts - entry point for the Hotel Booking API
// This file only sets up middleware and registers the route files.
// No route logic (no SQL queries) lives here.

import express from "express";
import cors from "cors";
import { config } from "./config";
import { generalLimiter, loginLimiter, aiLimiter } from "./middleware/rateLimiters";
import authRoutes from "./routes/authRoutes";
import hotelRoutes from "./routes/hotelRoutes";
import roomRoutes from "./routes/roomRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import userRoutes from "./routes/userRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import aiRoutes from "./routes/aiRoutes";

const app = express();

// The React app runs on http://localhost:5173 and the API on 3001. Because the
// ports are different the browser treats them as two different origins and
// blocks the fetch(), so we have to allow our frontend here.
app.use(
  cors({
    origin: config.frontendUrl,
  })
);

// express.json() lets us read JSON bodies from POST/PUT requests (req.body).
// The size limit means nobody can send us a 500 MB body to fill our memory.
app.use(express.json({ limit: "20kb" }));

// the general limiter runs on every route
app.use(generalLimiter);

// stricter limits on the two routes that need them
app.use("/auth/login", loginLimiter);
app.use("/ai", aiLimiter);

// simple health check so we know the server is alive
app.get("/", (req, res) => {
  res.send("Hotel Booking API is running! Try /hotels, /rooms, /bookings, /users or /reviews");
});

// register the routes - one line per route file
// pattern: app.use(prefix, router)
app.use("/auth", authRoutes);
app.use("/hotels", hotelRoutes);
app.use("/rooms", roomRoutes);
app.use("/bookings", bookingRoutes);
app.use("/users", userRoutes);
app.use("/reviews", reviewRoutes);
app.use("/ai", aiRoutes);

// If no route matched we answer with JSON too. Without this Express sends an
// HTML page and the frontend cannot read the error message out of it.
app.use((req, res) => {
  res.status(404).json({ error: "That endpoint does not exist" });
});

// The last middleware catches anything that was thrown, for example a body
// that is not valid JSON. We log the real reason for us and send a short
// message to the user - an error with a stack trace in it would tell an
// attacker how our server is built.
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.log("Unhandled error:", err);
  if (err && err.type === "entity.parse.failed") {
    res.status(400).json({ error: "The request body is not valid JSON" });
    return;
  }
  res.status(500).json({ error: "Something went wrong on the server" });
});

app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`);
});
