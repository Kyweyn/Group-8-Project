// rateLimiters.ts - stops one computer from sending us thousands of requests
// (written by Daiju).
//
// The assignment asks for rate limiting on the login. Without it somebody can
// run a script that tries "password1", "password2", "password3"... until one
// works. bcrypt already makes every try slow, the limiter makes it useless.
import rateLimit from "express-rate-limit";

// The login is the important one: 10 tries per 15 minutes per IP address.
// Failed AND successful tries count, so a script cannot keep guessing.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many login attempts. Please wait 15 minutes and try again.",
  },
});

// The AI route costs real money for every question, so it gets its own limit:
// 15 questions per hour.
export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "You asked the AI helper a lot of questions. Please try again later.",
  },
});

// A general limit for everything else so a broken loop in the frontend (or
// somebody hammering the API) cannot take the server down. It is high enough
// that normal browsing never hits it.
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please slow down." },
});
