// auth.ts - the middleware that protects our endpoints (written by Daiju).
//
// Middleware is a function that runs BEFORE the route handler. It either calls
// next() (request continues to the route) or it answers with an error and the
// route handler never runs.
//
//   requireAuth   -> you must be logged in
//   requireAdmin  -> you must be logged in AND your role must be 'admin'
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";

// What we put inside the token in authRoutes.ts.
export type TokenPayload = {
  userId: number;
  email: string;
  role: string;
};

// TypeScript does not know about req.user, so we tell it that our requests can
// have a user on them. After requireAuth ran, req.user is always filled in.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

// requireAuth - reads the "Authorization: Bearer <token>" header, checks the
// signature and puts the user on the request.
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    res.status(401).json({ error: "You must be logged in to do that" });
    return;
  }

  // "Bearer eyJhbGciOi..." -> we only want the part after the space
  const token = header.split(" ")[1];

  try {
    // verify() throws if the signature is wrong or if the token is expired
    const payload = jwt.verify(token, config.jwtSecret) as TokenPayload;
    req.user = payload;
    next();
  } catch (err) {
    res.status(401).json({ error: "Your session is not valid anymore, please log in again" });
  }
}

// requireAdmin - use it AFTER requireAuth, for example:
//   router.post("/", requireAuth, requireAdmin, handler)
// Normal users can book rooms, but only an admin may add or delete a hotel.
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    res.status(401).json({ error: "You must be logged in to do that" });
    return;
  }
  if (req.user.role !== "admin") {
    // 403 means "we know who you are, you are just not allowed"
    res.status(403).json({ error: "Only an admin can do that" });
    return;
  }
  next();
}
