import express from "express";
import dotenv from "dotenv";
import OpenTok from "opentok";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = 5001;

const apiKey = process.env.VONAGE_API_KEY;
const apiSecret = process.env.VONAGE_API_SECRET;

const opentok = new OpenTok(apiKey, apiSecret);

app.use(cors());

let sessionId;
const sessionOptions = {
  mediaMode: "routed",
  archiveMode: "manual",
};

let globalSession = null;

// Create session once on server start
const initializeSession = () => {
  if (!globalSession) {
    opentok.createSession(sessionOptions, (err, session) => {
      if (err) {
        console.error("Error creating session:", err);
        process.exit(1);
      }
      globalSession = session;
      sessionId = session.sessionId;
      console.log("Created new session:", sessionId);
    });
  }
};

// Initialize on startup
initializeSession();

app.get("/api/token", (req, res) => {
  if (!sessionId || !globalSession) {
    return res.status(503).json({
      error: "Session not initialized yet. Please try again shortly.",
    });
  }

  const user =
    req.query.user || `guest_${Math.random().toString(36).substr(2, 9)}`;

  const token = opentok.generateToken(sessionId, {
    role: "publisher",
    data: `username=${user}`,
    expireTime: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
  });

  console.log(`Generated token for user: ${user}`);

  res.json({
    apiKey,
    sessionId,
    token,
  });
});

app.listen(PORT, () => {
  console.log(`Token server running on http://localhost:${PORT}`);
});
