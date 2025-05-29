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
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  const handleCreateMeeting = async () => {
    setIsCreating(true);
    setError("");

    try {
      const meetingData = await createMeeting({
        name: "Host", // You can make this dynamic if needed
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Video Meeting
          </h1>
          <p className="text-gray-600">Connect with your team instantly</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleCreateMeeting}
            disabled={isCreating}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
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

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Enter meeting link"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleJoinMeeting}
              disabled={!meetingLink.trim()}
              className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition duration-200"
            >
              Join Meeting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
