import React, { useState } from "react";

const LandingPage = ({
  iconComponents,
  setCurrentView,
  meetingLink,
  setMeetingLink,
  themeColors,
  createMeeting,
  extractSessionIdFromUrl,
  setSessionId,
  setIsHost,
  customStyle = {}
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreateMeeting = async () => {
    setIsCreating(true);
    setError("");

    try {
      const meetingData = await createMeeting({
        name: "Host",
        role: "host",
      });

      setIsHost(true);
      setCurrentView("prejoin");
    } catch (error) {
      console.error("Error creating meeting:", error);
      setError("Failed to create meeting. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinMeeting = () => {
    if (!meetingLink.trim()) {
      setError("Please enter a valid meeting link");
      return;
    }

    const extractedSessionId = extractSessionIdFromUrl(meetingLink);
    if (!extractedSessionId) {
      setError("Invalid meeting link format");
      return;
    }

    setSessionId(extractedSessionId);
    setIsHost(false);
    setError("");
    setCurrentView("prejoin");
  };

  const defaultStyles = {
    container: "min-h-screen bg-white flex items-center justify-between p-16",
    leftSection: "flex-1",
    heading: "text-5xl font-bold text-gray-900 leading-tight",
    subheading: "text-lg text-blue-500 mt-4",
    rightSection: "flex-1 flex flex-col items-center gap-6",
    createButton: "w-full text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2",
    dividerContainer: "relative w-full",
    dividerLine: "absolute inset-0 flex items-center",
    dividerLineInner: "w-full border-t border-gray-300",
    dividerTextContainer: "relative flex justify-center text-sm",
    dividerText: "px-2 bg-white text-gray-500",
    joinSection: "space-y-3",
    input: "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent",
    joinButton: "w-full text-white font-semibold py-3 px-6 rounded-lg transition duration-200",
    errorBox: "mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg",
  };

  const styles = { ...defaultStyles, ...customStyle };

  return (
    <div className={styles.container}>
      <div className={styles.leftSection}>
        <h1 className={styles.heading}>
          Welcome to the <br />
          Voyage Video <br />
          React App
        </h1>
        <p className={styles.subheading}>
          Create a new room or join an existing one.
        </p>
      </div>

      <div className={styles.rightSection}>
        <div className="space-y-4">
          <button
            onClick={handleCreateMeeting}
            disabled={isCreating}
            className={`${styles.createButton} ${isCreating ? "bg-blue-300 cursor-not-allowed" : "hover:bg-blue-700"}`}
            style={{ backgroundColor: themeColors?.primary || "#2563eb" }}
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating...
              </>
            ) : (
              <>
                <iconComponents.video className="w-5 h-5" />
                Create Meeting
              </>
            )}
          </button>

          <div className={styles.dividerContainer}>
            <div className={styles.dividerLine}>
              <div className={styles.dividerLineInner} />
            </div>
            <div className={styles.dividerTextContainer}>
              <span className={styles.dividerText}>or</span>
            </div>
          </div>

          <div className={styles.joinSection}>
            <input
              type="text"
              placeholder="Enter meeting link"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              className={styles.input}
            />
            <button
              onClick={handleJoinMeeting}
              disabled={!meetingLink.trim()}
              className={`${styles.joinButton} ${!meetingLink.trim() ? "bg-gray-300 cursor-not-allowed" : "bg-gray-600 hover:bg-gray-700"}`}
            >
              Join Meeting
            </button>
          </div>

          {error && (
            <div className={styles.errorBox}>
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
