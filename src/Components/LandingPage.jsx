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
  customStyle = {},
  customText = {}
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const defaultText = {
    heading: "Welcome to the Voyage Video Meeting Platform",
    subheading: "Create a new room or join an existing one.",
    createButton: "Create Meeting",
    creatingButton: "Creating...",
    joinPlaceholder: "Enter meeting link",
    joinButton: "Join Meeting",
    dividerText: "or",
    errorInvalidLink: "Please enter a valid meeting link",
    errorInvalidFormat: "Invalid meeting link format",
    errorCreateFail: "Failed to create meeting. Please try again.",
  };

  const text = { ...defaultText, ...customText };

  const handleCreateMeeting = async () => {
    setIsCreating(true);
    setError("");

    try {
      const meetingData = await createMeeting({
        name: "Host",
        role: "host",
      });

      setIsHost(true);
      
      if (meetingData.meetingUrl) {
        window.history.pushState({}, '', meetingData.meetingUrl);
      }
      
      setCurrentView("prejoin");
    } catch (error) {
      console.error("Error creating meeting:", error);
      setError(text.errorCreateFail);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinMeeting = () => {
    if (!meetingLink.trim()) {
      setError(text.errorInvalidLink);
      return;
    }

    const extractedSessionId = extractSessionIdFromUrl(meetingLink);
    if (!extractedSessionId) {
      setError(text.errorInvalidFormat);
      return;
    }

    setSessionId(extractedSessionId);
    setIsHost(false);
    setError("");
    
    window.history.pushState({}, '', meetingLink);
    
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
          {text.heading.split("\n").map((line, index) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </h1>
        <p className={styles.subheading}>
          {text.subheading}
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
                {text.creatingButton}
              </>
            ) : (
              <>
                <iconComponents.video className="w-5 h-5" />
                {text.createButton}
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
              placeholder={text.joinPlaceholder}
              // value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              className={styles.input}
            />
            <button
              onClick={handleJoinMeeting}
              disabled={!meetingLink.trim()}
              className={`${styles.joinButton} ${!meetingLink.trim() ? "bg-gray-300 cursor-not-allowed" : "bg-gray-600 hover:bg-gray-700"}`}
            >
              {text.joinButton}
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
