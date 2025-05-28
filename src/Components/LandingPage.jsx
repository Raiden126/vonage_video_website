const LandingPage = ({
  iconComponents,
  setCurrentView,
  setMeetingLink,
  meetingLink,
  themeColors,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Video Meeting
          </h1>
          <p className="text-gray-600">Connect with your team instantly</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => setCurrentView("prejoin")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            style={{ backgroundColor: themeColors.primary }}
          >
            <iconComponents.video className="w-5 h-5" />
            Create Meeting
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
              placeholder="Enter meeting link or ID"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => setCurrentView("prejoin")}
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
