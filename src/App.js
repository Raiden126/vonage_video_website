import React, { useState, useEffect } from "react";
import VonageVideoMeeting from "./VonageVideoMeeting";

function App() {
  const [username, setUsername] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    // console.log("useEffect triggered with submitted:");
    if (!submitted) return;
    // console.log("useEffect triggered with submitted:2");

    const fetchToken = async () => {
      try {
        const response = await fetch(
          `http://localhost:5001/api/token?user=${encodeURIComponent(username)}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch token");
        }

        const { apiKey, sessionId, token } = await response.json();
        console.log("Received credentials:", { apiKey, sessionId, token });

        setApiKey(apiKey);
        setSessionId(sessionId);
        setToken(token);
      } catch (error) {
        console.error("Error fetching token:", error);
      }
    };

    fetchToken();
  }, [submitted, username]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      setSubmitted(true);
    }
  };

  if (!submitted) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2>Enter your name to join the meeting</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Your name"
            required
            style={{ padding: "0.5rem", marginRight: "1rem" }}
          />
          <button type="submit">Join</button>
        </form>
      </div>
    );
  }

  if (!apiKey || !sessionId || !token) {
    return <div>Loading video session...</div>;
  }

  return (
    <div>
      <VonageVideoMeeting
        apiKey={apiKey}
        sessionId={sessionId}
        token={token}
        username={username}
      />
    </div>
  );
}

export default App;
