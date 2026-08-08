// authRoutes.ts - the login system for Milestone 5 (written by Shiv).
//
// Three routes live here:
//   POST /auth/register  - make a new account (password is hashed with bcrypt)
//   POST /auth/login     - check the password and give back a JWT token
//   GET  /auth/me        - who am I? (needs a valid token)
//
// How the token works: after a correct login we "sign" a small piece of JSON
// (the user id, the email and the role) with our secret from .env. The browser
// sends that token back on every request in the Authorization header, and the
// middleware checks the signature. Because the token is signed, nobody can
// change the user id inside it without breaking the signature.
import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db";
import { config } from "../config";
import { requireAuth } from "../middleware/auth";

const router = Router();

const SALT_ROUNDS = 10;

// very simple email check - it must have one @ and a dot after it
function looksLikeEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Input sanitizing: we cut the spaces off and make sure the value really is a
// string. Someone could send "email": { "x": 1 } and mysql2 would then build a
// weird query, so we force everything to text first.
function clean(value: any) {
  return typeof value === "string" ? value.trim() : "";
}

// makes the token. We only put non secret things inside it, because anyone can
// read (base64 decode) a JWT - they just cannot change it.
function createToken(user: { user_id: number; email: string; role: string }) {
  return jwt.sign(
    { userId: user.user_id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn } as jwt.SignOptions
  );
}

// POST /auth/register - create a new account and log the user in right away
router.post("/register", async (req: Request, res: Response) => {
  const name = clean(req.body.name);
  // emails are saved in lower case, otherwise Shiv@x.com and shiv@x.com would
  // be two different accounts
  const email = clean(req.body.email).toLowerCase();
  const phone = clean(req.body.phone);
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!name || !email || !password) {
    res.status(400).json({ error: "name, email and password are required" });
    return;
  }
  if (name.length > 100) {
    res.status(400).json({ error: "That name is too long" });
    return;
  }
  if (!looksLikeEmail(email)) {
    res.status(400).json({ error: "That email address is not valid" });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }
  // bcrypt only looks at the first 72 bytes anyway, and a huge password would
  // just make the server work for nothing
  if (password.length > 72) {
    res.status(400).json({ error: "Password can be at most 72 characters" });
    return;
  }

  try {
    // is the email already taken?
    const [existing]: any = await db.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      res.status(409).json({ error: "An account with that email already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // new accounts are always role 'user'. You cannot make yourself an admin
    // by sending "role":"admin" in the body, we simply ignore that field.
    const [result]: any = await db.query(
      "INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, 'user')",
      [name, email, phone || null, hashedPassword]
    );

    const user = { user_id: result.insertId, email, role: "user" };
    res.status(201).json({
      token: createToken(user),
      user: { userId: result.insertId, name, email, role: "user" },
    });
  } catch (err) {
    console.log("POST /auth/register failed:", err);
    res.status(500).json({ error: "Could not create the account" });
  }
});

// POST /auth/login - check email + password, send back a token
router.post("/login", async (req: Request, res: Response) => {
  const email = clean(req.body.email).toLowerCase();
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  try {
    const [rows]: any = await db.query(
      "SELECT user_id, name, email, password, role FROM users WHERE email = ?",
      [email]
    );

    // If the email does not exist we still say "Invalid email or password".
    // Saying "this email does not exist" would tell an attacker which emails
    // are registered on our site.
    if (rows.length === 0) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const user = rows[0];

    // bcrypt.compare hashes what the user typed with the same salt and compares
    // it to the stored hash. We can never turn the stored hash back into a
    // password, which is the whole point of hashing.
    const passwordIsCorrect = await bcrypt.compare(password, user.password);
    if (!passwordIsCorrect) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    res.json({
      token: createToken(user),
      user: {
        userId: user.user_id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.log("POST /auth/login failed:", err);
    res.status(500).json({ error: "Login failed, please try again" });
  }
});

// GET /auth/me - the React app calls this when it starts up. If the saved token
// is still valid it gets the user back and stays logged in, if the token is old
// or fake it gets a 401 and the app sends the user to the login page.
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    const [rows]: any = await db.query(
      "SELECT user_id, name, email, phone, role FROM users WHERE user_id = ?",
      [req.user!.userId]
    );
    if (rows.length === 0) {
      // the account was deleted while the token was still valid
      res.status(404).json({ error: "User not found" });
      return;
    }
    const user = rows[0];
    res.json({
      userId: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
  } catch (err) {
    console.log("GET /auth/me failed:", err);
    res.status(500).json({ error: "Could not load your account" });
  }
});

export default router;
