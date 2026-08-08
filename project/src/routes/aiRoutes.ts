// aiRoutes.ts - the AI part of Milestone 5 (written by Shiv).
//
// POST /ai/suggest  { "question": "..." }  ->  { "answer": "..." }
//
// This is our "travel helper": the user types what kind of trip they want and
// Claude picks hotels FROM OUR OWN DATABASE and explains why. We first read the
// hotels and the room prices out of MySQL and put them in the prompt, so the
// answer can only talk about hotels we really have and real prices.
//
// WHY IS THIS IN THE BACKEND AND NOT IN REACT?
// Because the Claude API key would be visible to everybody if the React app
// called the API directly - anything in the frontend bundle can be read in the
// browser. The key stays in the backend .env and the frontend only talks to us.
import { Router, Request, Response } from "express";
import { db } from "../db";
import { config } from "../config";
import { requireAuth } from "../middleware/auth";

const router = Router();

const CLAUDE_URL = "https://api.anthropic.com/v1/messages";

// POST /ai/suggest - ask the travel helper a question
router.post("/suggest", requireAuth, async (req: Request, res: Response) => {
  const { question } = req.body;

  if (!question || String(question).trim().length === 0) {
    res.status(400).json({ error: "Please type a question first" });
    return;
  }
  // a long question costs more tokens and we are on a free key, so we cut it
  if (String(question).length > 300) {
    res.status(400).json({ error: "Please keep the question under 300 characters" });
    return;
  }
  if (!config.anthropicApiKey) {
    // 503 = the server is fine but this feature is not set up
    res.status(503).json({
      error: "The AI helper is not configured. Add ANTHROPIC_API_KEY to the backend .env file.",
    });
    return;
  }

  try {
    // 1. get our real hotels and the cheapest room of each one
    const [hotels]: any = await db.query(
      `SELECT h.hotel_id, h.name, h.city, h.star_rating, h.description,
              MIN(r.price_per_night) AS starting_price,
              MAX(r.max_guests)      AS biggest_room
       FROM hotels h
       LEFT JOIN rooms r ON r.hotel_id = h.hotel_id
       GROUP BY h.hotel_id`
    );

    if (hotels.length === 0) {
      res.status(404).json({ error: "There are no hotels in the database yet" });
      return;
    }

    // 2. turn the rows into a simple list for the prompt
    const hotelList = hotels
      .map(
        (h: any) =>
          `- ${h.name} (id ${h.hotel_id}), ${h.city}, ${h.star_rating} stars, ` +
          `from $${h.starting_price} a night, fits up to ${h.biggest_room} guests. ` +
          `${h.description || ""}`
      )
      .join("\n");

    // 3. ask Claude. The system prompt is the "rules" for the assistant.
    const claudeResponse = await fetch(CLAUDE_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": config.anthropicApiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: config.anthropicModel,
        max_tokens: 400,
        system:
          "You are the booking helper of a small hotel website in the Waterloo " +
          "region of Ontario. Recommend hotels ONLY from the list the user gives " +
          "you - never invent a hotel, a price or a city. Suggest at most two " +
          "hotels, say why each one fits, and mention the starting price. Keep " +
          "the whole answer under 120 words and write in simple friendly English. " +
          "If nothing in the list fits, say so honestly.",
        messages: [
          {
            role: "user",
            content:
              `These are the hotels we have:\n${hotelList}\n\n` +
              `The guest asks: ${question}`,
          },
        ],
      }),
    });

    if (!claudeResponse.ok) {
      // for example a wrong key (401) or too many requests (429)
      const details = await claudeResponse.text();
      console.log("Claude API error:", claudeResponse.status, details);
      res.status(502).json({
        error: "The AI helper is not answering right now, please try again later",
      });
      return;
    }

    const data: any = await claudeResponse.json();

    // Claude answers with content: [ { type: "text", text: "..." } ]
    const answer = data.content
      .filter((part: any) => part.type === "text")
      .map((part: any) => part.text)
      .join("\n")
      .trim();

    res.json({ answer: answer });
  } catch (err) {
    console.log("POST /ai/suggest failed:", err);
    res.status(500).json({ error: "Could not ask the AI helper" });
  }
});

export default router;
