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
  customStyle = {},
}) => {
  const defaultStyles = {
    container: "min-h-screen flex items-center justify-center bg-gradient-to-tr from-gray-800 via-gray-900 to-gray-950 text-white px-6 py-10",
    card: "flex flex-col lg:flex-row bg-gray-900 rounded-3xl shadow-2xl overflow-hidden max-w-5xl w-full",
    leftPanel: "lg:w-1/2 bg-gray-100 text-gray-900 p-10 flex flex-col justify-center items-center",
    formWrapper: "max-w-md w-full space-y-8",
    heading: "text-4xl font-extrabold text-center",
    subheading: "text-center text-gray-600 text-sm",
    label: "block text-sm font-semibold mb-2",
    input: "w-full px-5 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600",
    joinButton:
      "w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold rounded-lg flex items-center justify-center gap-3 transition-all",
    errorBox:
      "bg-red-100 text-red-700 text-sm p-4 rounded-md border border-red-400 mt-4",
    rightPanel: "lg:w-1/2 p-8 flex flex-col items-center space-y-8",
    previewBox:
      "relative w-full aspect-video bg-black rounded-xl shadow-lg overflow-hidden flex items-center justify-center",
    avatar:
      "w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center text-5xl font-extrabold select-none",
    cameraStatus: "text-gray-400 font-semibold select-none",
    controlsCard: "w-full bg-gray-800 rounded-xl p-6 shadow-inner space-y-6",
    toggleButtons: "flex justify-center gap-8",
    toggleButton:
      "w-14 h-14 rounded-full flex items-center justify-center transition",
    deviceSection: "grid grid-cols-1 gap-4",
    deviceLabel: "block text-sm font-medium mb-2",
    select:
      "w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500",
  };

  const styles = { ...defaultStyles, ...customStyle };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Left Panel - Form */}
        <div className={styles.leftPanel}>
          <div className={styles.formWrapper}>
            <h2 className={styles.heading}>Join Your Meeting</h2>
            <p className={styles.subheading}>
              Check your settings before joining
            </p>

            {/* Name Input */}
            <div>
              <label htmlFor="userName" className={styles.label}>
                Display Name
              </label>
              <input
                id="userName"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className={styles.input}
                autoComplete="off"
              />
            </div>

            {/* Host Link Sharing */}
            {isHost && meetingLink && (
              <div>
                <label className={styles.label}>Share Meeting Link</label>
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

            {/* Join Button */}
            <button
              onClick={joinMeeting}
              disabled={!userName.trim() || isConnecting}
              className={styles.joinButton}
              type="button"
            >
              {isConnecting ? (
                <>
                  <div className="animate-spin h-6 w-6 border-b-2 border-white rounded-full"></div>
                  Joining...
                </>
              ) : (
                <>
                  <iconComponents.video className="w-6 h-6" />
                  {isHost ? "Start Meeting" : "Join Meeting"}
                </>
              )}
            </button>

            {/* Error Message */}
            {connectionError && (
              <div className={styles.errorBox}>{connectionError}</div>
            )}
          </div>
        </div>

        {/* Right Panel - Preview */}
        <div className={styles.rightPanel}>
          {/* Camera Preview */}
          <div className={styles.previewBox}>
            {previewEnabled.video ? (
              <div
                ref={previewRef}
                className="w-full h-full object-cover"
                style={{ backgroundColor: "black" }}
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <div className={styles.avatar}>
                  {userName ? getInitials(userName) : "YN"}
                </div>
                <span className={styles.cameraStatus}>Camera Off</span>
              </div>
            )}
          </div>

          {/* Toggle & Device Controls */}
          <div className={styles.controlsCard}>
            <div className={styles.toggleButtons}>
              <button
                onClick={() =>
                  setPreviewEnabled((prev) => ({
                    ...prev,
                    video: !prev.video,
                  }))
                }
                className={`${styles.toggleButton} ${previewEnabled.video
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-600 hover:bg-gray-500"
                  }`}
                type="button"
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
                className={`${styles.toggleButton} ${previewEnabled.audio
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-gray-600 hover:bg-gray-500"
                  }`}
                type="button"
              >
                {previewEnabled.audio ? (
                  <iconComponents.mic className="w-6 h-6" />
                ) : (
                  <iconComponents.micOff className="w-6 h-6" />
                )}
              </button>
            </div>

            {/* Device Dropdowns */}
            <div className={styles.deviceSection}>
              <div>
                <label className={styles.deviceLabel}>Camera</label>
                <select
                  value={selectedDevices.camera}
                  onChange={(e) =>
                    setSelectedDevices((prev) => ({
                      ...prev,
                      camera: e.target.value,
                    }))
                  }
                  className={styles.select}
                  disabled={true}
                >
                  <option value="">Select Camera</option>
                  {devices.cameras.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={styles.deviceLabel}>Microphone</label>
                <select
                  value={selectedDevices.microphone}
                  onChange={(e) =>
                    setSelectedDevices((prev) => ({
                      ...prev,
                      microphone: e.target.value,
                    }))
                  }
                  className={styles.select}
                  disabled={true}
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
    </div>
  );
};

export default PrejoinPage;
