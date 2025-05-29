import express from "express";
import dotenv from "dotenv";
import OpenTok from "opentok";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

const apiKey = process.env.VONAGE_API_KEY;
const apiSecret = process.env.VONAGE_API_SECRET;

const opentok = new OpenTok(apiKey, apiSecret);

let sessionHosts = {};

app.post("/api/create-meeting", async (req, res) => {
  try {
    const sessionOptions = {
      mediaMode: "routed",
      archiveMode: "manual",
    };

    opentok.createSession(sessionOptions, (err, session) => {
      if (err) {
        console.error("Error creating session:", err);
        return res.status(500).json({
          success: false,
          message: "Failed to create meeting",
          error: err.message,
        });
      }

      // const host = req.body.userData?.name || "Unknown";
      // sessionHosts[session.sessionId] = host;

      res.status(201).json({
        success: true,
        sessionId: session.sessionId,
        // hostName: host,
        meetingUrl: `${process.env.CLIENT_URL}/meeting/${session.sessionId}`,
      });
    });
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
});

app.post("/api/token", (req, res) => {
  try {
    const { sessionId, userType = "publisher", userData = {} } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: "Session ID is required",
      });
    }

    const tokenOptions = {
      role: userType,
      expireTime: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days
      data: JSON.stringify(userData),
    };

    const token = opentok.generateToken(sessionId, tokenOptions);

    res.status(200).json({
      success: true,
      apiKey,
      sessionId,
      token,
    });
  } catch (error) {
    console.error("Error generating token:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate token",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
