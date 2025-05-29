import React from "react";

const PrejoinPage = ({
  userName,
  setUserName,
  joinMeeting,
  isConnecting,
  iconComponents,
  connectionError,
  previewRef,
  previewEnabled,
  setPreviewEnabled,
  selectedDevices,
  setSelectedDevices,
  devices,
  getInitials,
  isHost,
  meetingLink,
  copyMeetingLink,
  linkCopied,
}) => {
  return (
    <div className="min-h-screen bg-gray-900 flex">
      {/* Left Side - User Info */}
      <div className="w-1/2 bg-white flex flex-col justify-center p-8">
        <div className="max-w-md mx-auto w-full">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Ready to join?
          </h2>

          <div className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Show meeting link section for hosts */}
            {isHost && meetingLink && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Share Meeting Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={meetingLink}
                    readOnly
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                  <button
                    onClick={copyMeetingLink}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition duration-200 flex items-center gap-2"
                  >
                    {linkCopied ? (
                      <>
                        <iconComponents.check className="w-4 h-4 text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <iconComponents.copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Share this link with participants to join your meeting
                </p>
              </div>
            )}
          </div>

          <button
            onClick={joinMeeting}
            disabled={!userName.trim() || isConnecting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
          >
            {isConnecting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Joining...
              </>
            ) : (
              <>
                <iconComponents.video className="w-5 h-5" />
                {isHost ? "Start Meeting" : "Join Meeting"}
              </>
            )}
          </button>

          {connectionError && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {connectionError}
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Preview (existing code remains the same) */}
      <div className="w-1/2 bg-gray-900 flex flex-col p-8">
        <div className="flex-1 flex flex-col">
          {/* Camera Preview */}
          <div className="flex-1 bg-gray-800 rounded-lg mb-6 relative overflow-hidden">
            {previewEnabled.video ? (
              <div
                ref={previewRef}
                className="w-full h-full flex items-center justify-center"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-semibold text-white">
                    {userName ? getInitials(userName) : "YN"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div className="flex justify-center gap-4">
              <button
                onClick={() =>
                  setPreviewEnabled((prev) => ({
                    ...prev,
                    video: !prev.video,
                  }))
                }
                className={`p-3 rounded-full ${
                  previewEnabled.video
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-red-600 hover:bg-red-700"
                } text-white transition duration-200`}
              >
                {previewEnabled.video ? (
                  <iconComponents.video className="w-6 h-6" />
                ) : (
                  <iconComponents.videoOff className="w-6 h-6" />
                )}
              </button>
              <button
                onClick={() =>
                  setPreviewEnabled((prev) => ({
                    ...prev,
                    audio: !prev.audio,
                  }))
                }
                className={`p-3 rounded-full ${
                  previewEnabled.audio
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-red-600 hover:bg-red-700"
                } text-white transition duration-200`}
              >
                {previewEnabled.audio ? (
                  <iconComponents.mic className="w-6 h-6" />
                ) : (
                  <iconComponents.micOff className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Device Selection */}
            <div className="space-y-3">
              <select
                value={selectedDevices.camera}
                onChange={(e) =>
                  setSelectedDevices((prev) => ({
                    ...prev,
                    camera: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Camera</option>
                {devices.cameras.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </option>
                ))}
              </select>
              <select
                value={selectedDevices.microphone}
                onChange={(e) =>
                  setSelectedDevices((prev) => ({
                    ...prev,
                    microphone: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Microphone</option>
                {devices.microphones.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrejoinPage;
