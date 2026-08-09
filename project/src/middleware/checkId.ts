// checkId.ts - makes sure an id in the URL really is a number.
//
// Why we need this: MySQL is happy to compare the text "1 OR 1=1" with an INT
// column, it just casts it to the number 1. So GET /hotels/1%20OR%201=1
// answered with hotel 1. Nothing is injected (the value still goes in as a ?
// parameter) but an id that is not a number is a bad request and should not
// quietly turn into a different id.
//
// A router uses it like this:  router.param("id", checkId)
// Express then runs it before every handler of that router that has :id in the
// path, so we only write the check once per file.
import { Request, Response, NextFunction } from "express";

export function checkId(
  req: Request,
  res: Response,
  next: NextFunction,
  value: string
) {
  // only digits, nothing else
  if (!/^\d+$/.test(value)) {
    res.status(400).json({ error: "The id in the URL must be a number" });
    return;
  }
  next();
}
