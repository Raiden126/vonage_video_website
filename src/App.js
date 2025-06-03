import React, { useState, useEffect } from "react";
import VonageVideoMeeting from "./VonageVideoMeeting";

function App() {
  const [apiKey, setApiKey] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [token, setToken] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState("");
  const landingPageStyling = {};
  const preJoinPageStyling = {};

  const createMeeting = async (userData) => {
    try {
      const response = await fetch("http://localhost:5001/api/create-meeting", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userData }),
      });

      if (!response.ok) {
        throw new Error("Failed to create meeting");
      }

      const data = await response.json();
      console.log("Meeting created:", data);

      setSessionId(data.sessionId);
      setMeetingUrl(data.meetingUrl);
      setIsHost(true);

      return data;
    } catch (error) {
      console.error("Error creating meeting:", error);
      throw error;
    }
  };

  const generateToken = async (sessionId, userData, userType = "publisher") => {
    try {
      const response = await fetch("http://localhost:5001/api/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          userType,
          userData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate token");
      }

      const data = await response.json();
      console.log("Token generated:", data);

      setApiKey(data.apiKey);
      setSessionId(data.sessionId);
      setToken(data.token);

      return data;
    } catch (error) {
      console.error("Error generating token:", error);
      throw error;
    }
  };

  const extractSessionIdFromUrl = (url) => {
    try {
      const match = url.match(/\/meeting\/(.+)$/);
      return match ? match[1] : null;
    } catch (error) {
      console.error("Error extracting session ID from URL:", error);
      return null;
    }
  };
  let icons = {};
  let theme = "";

  return (
    <div>
      <VonageVideoMeeting
        apiKey={apiKey}
        sessionId={sessionId}
        token={token}
        isHost={isHost}
        meetingUrl={meetingUrl}
        createMeeting={createMeeting}
        generateToken={generateToken}
        extractSessionIdFromUrl={extractSessionIdFromUrl}
        landingPageStyle={landingPageStyling}
        preJoinPageStyle={preJoinPageStyling}
        screenShotWithChat={true}
        icons={icons}
        theme={theme}
      />
    </div>
  );
}

export default App;
