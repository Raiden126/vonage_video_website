import React, { useMemo } from "react";

const defaultStyles = {
  container: "min-h-screen flex items-center justify-center bg-white text-gray-900 px-6 py-6",
  card: "relative flex flex-col lg:flex-row bg-white rounded-3xl shadow-2xl max-w-5xl w-full border pt-10 overflow-hidden",
  formWrapper: "max-w-md w-full space-y-8",
  leftPanel: "lg:w-1/2 p-10 flex flex-col justify-center",
  rightPanel: "lg:w-1/2 p-8 flex flex-col items-center space-y-8 bg-gray-50",
  heading: "text-4xl font-extrabold text-center",
  subheading: "text-center text-gray-500 text-sm",
  label: "block text-sm font-semibold mb-2 text-gray-700",
  input: "w-full px-5 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-gray-800",
  joinButton: "w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white font-bold rounded-lg flex items-center justify-center gap-3 transition-all",
  errorBox: "bg-red-100 text-red-700 text-sm p-4 rounded-md border border-red-400",
  previewBox: "w-full aspect-video bg-gray-200 rounded-xl shadow-lg overflow-hidden flex items-center justify-center",
  avatar: "w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center text-5xl font-extrabold text-gray-600",
  cameraStatus: "text-gray-500 font-semibold",
  controlsCard: "w-full bg-white rounded-xl p-6 shadow-inner space-y-6 border",
  toggleButtons: "flex justify-center gap-4",
  toggleButtonBase: "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200",
  deviceSection: "grid grid-cols-1 gap-4",
  select: "w-full px-4 py-2 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800",
  shareInput: "flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-800",
  shareButton: "px-4 py-3 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition duration-200 flex items-center gap-2 text-gray-700",
  shareNote: "text-sm text-gray-500 mt-1",
  spinner: "animate-spin h-6 w-6 border-b-2 border-gray-900 rounded-full",
  cameraFeed: "w-full h-full object-cover bg-black",
};

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
  const style = { ...defaultStyles, ...customStyle };


  const ToggleButton = ({
    enabled,
    onClick,
    IconOn,
    IconOff,
    label,
    isConnecting,
    mediaType, // 'camera' or 'microphone'
  }) => {
    const buttonClass = useMemo(
      () =>
        `${style.toggleButtonBase} ${enabled ? "bg-blue-600 text-white" : "bg-gray-500 text-gray-200"
        }`,
      [enabled]
    );

    const handleClick = async () => {
      if (isConnecting) return;

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();

        const relevantDevices = devices.filter((device) =>
          mediaType === "camera"
            ? device.kind === "videoinput"
            : mediaType === "microphone"
              ? device.kind === "audioinput"
              : false
        );

        if (relevantDevices.length === 0) {
          console.log(
            `No ${mediaType === "camera" ? "camera" : "microphone"} detected. Cannot toggle.`
          );
          return;
        }

        onClick(); // Safe to toggle
      } catch (error) {
        console.error("Error checking media devices:", error);
        console.log("Unable to access media devices.");
      }
    };

    return (
      <button
        onClick={handleClick}
        className={buttonClass}
        type="button"
        aria-label={label}
        disabled={isConnecting}
      >
        {enabled ? <IconOn className="w-6 h-6" /> : <IconOff className="w-6 h-6" />}
      </button>
    );
  };

  const DeviceSelect = ({ label, value, onChange, options }) => (
    <div>
      <label className={style.label}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={style.select}
        disabled={isConnecting}
      >
        <option value="">Select {label}</option>
        {options.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className={style.container}>
      <div className={style.card}>
        {/* Left Panel */}
        <div className={style.leftPanel}>
          <div className={style.formWrapper}>
            <h2 className={style.heading}>Join Your Meeting</h2>
            <p className={style.subheading}>Check your settings before joining</p>

            <label htmlFor="userName" className={style.label}>
              Display Name
            </label>
            <input
              id="userName"
              type="text"
              disabled={isConnecting}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Enter your name"
              className={style.input}
              autoComplete="off"
            />

            {isHost && meetingLink && (
              <>
                <label className={style.label}>Share Meeting Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={meetingLink}
                    readOnly
                    className={style.shareInput}
                  />
                  <button onClick={copyMeetingLink} className={style.shareButton}>
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
                <p className={style.shareNote}>
                  Share this link with participants to join your meeting
                </p>
              </>
            )}

            <button
              onClick={joinMeeting}
              disabled={!userName.trim() || isConnecting}
              className={style.joinButton}
              type="button"
            >
              {isConnecting ? (
                <>
                  <div className={style.spinner}></div>
                  Joining...
                </>
              ) : (
                <>
                  <iconComponents.video className="w-6 h-6" />
                  {isHost ? "Start Meeting" : "Join Meeting"}
                </>
              )}
            </button>

            {connectionError && <div className={style.errorBox}>{connectionError}</div>}
          </div>
        </div>

        {/* Right Panel */}
        <div className={style.rightPanel}>
          <div className={style.previewBox}>
            {previewEnabled.video ? (
              <div ref={previewRef} className={style.cameraFeed} />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2">
                <div className={style.avatar}>
                  {userName ? getInitials(userName) : "YN"}
                </div>
                <span className={style.cameraStatus}>Camera Off</span>
              </div>
            )}
          </div>

          <div className={style.controlsCard}>
            <div className={style.toggleButtons}>
              <ToggleButton
                enabled={previewEnabled.video}
                onClick={() => setPreviewEnabled((prev) => ({ ...prev, video: !prev.video }))}
                IconOn={iconComponents.video}
                IconOff={iconComponents.videoOff}
                label="Toggle Camera"
                mediaType="camera"
              />
              <ToggleButton
                enabled={previewEnabled.audio}
                onClick={() => setPreviewEnabled((prev) => ({ ...prev, audio: !prev.audio }))}
                IconOn={iconComponents.mic}
                IconOff={iconComponents.micOff}
                label="Toggle Microphone"
                mediaType="microphone"
              />
            </div>

            <div className={style.deviceSection}>
              <DeviceSelect
                label="Camera"
                value={selectedDevices.camera}
                onChange={(val) => setSelectedDevices((prev) => ({ ...prev, camera: val }))}
                options={devices.cameras}
              />
              <DeviceSelect
                label="Microphone"
                value={selectedDevices.microphone}
                onChange={(val) => setSelectedDevices((prev) => ({ ...prev, microphone: val }))}
                options={devices.microphones}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrejoinPage;
