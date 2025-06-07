import React, { useEffect, useRef, useState } from "react";
import LeaveMeetingModal from "./LeaveMeetingModel.jsx";

const MeetingRoomPage = ({
  copyMeetingLink,
  linkCopied,
  participants,
  iconComponents,
  publisherElementRef,
  meetingState,
  getInitials,
  userName,
  chatMessages,
  chatInput,
  setChatInput,
  sendChatMessage,
  toggleAudio,
  takeScreenshot,
  toggleChat,
  toggleVideo,
  hasCamera,
  hasMicrophone,
  toggleScreenShare,
  toggleParticipants,
  showReactionPicker,
  screenShareState,
  isHost,
  availableEmojis,
  sendReaction,
  reactions,
  setShowReactionPicker,
  leaveMeeting,
  reactionButtonRef,
  handleLeaveMeetingClick,
  showLeaveMeetingModal,
  setShowLeaveMeetingModal,
  transferHost,
  screenShotWithChat,
  chatAttachments,
  setChatAttachments,
}) => {
  const subscriberRefs = useRef(new Map());
  const messagesEndRef = useRef(null);
  const hasScreenShare =
    screenShareState.isSharing || screenShareState.isReceiving;
  const screenShareParticipant = participants.find((p) => p.isScreenShare);
  const regularParticipants = participants.filter((p) => !p.isScreenShare);
  const [showScreenshotModal, setShowScreenshotModal] = useState(false);
  const [selectedScreenshot, setSelectedScreenshot] = useState(null);
  const [showDeviceError, setShowDeviceError] = useState(null);

  useEffect(() => {
    console.log("MeetingState changed: ", meetingState);
    console.log("Participants: ", participants);
  })

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    const allParticipants = participants.filter((p) => !p.isLocal);

    allParticipants.forEach((participant) => {
      if (participant.subscriber) {
        const videoElement = subscriberRefs.current.get(participant.id);
        
        if (videoElement) {
          try {
            // For screen share participants, use the stored container
            let subscriberElement;
            
            if (participant.isScreenShare && participant.subscriberContainer) {
              subscriberElement = participant.subscriberContainer;
            } else {
              subscriberElement = participant.subscriber.element;
            }
            
            if (subscriberElement && subscriberElement.parentNode !== videoElement) {
              // Clear any existing content
              videoElement.innerHTML = "";
              
              // Append the subscriber's element
              videoElement.appendChild(subscriberElement);

              // Ensure proper styling
              subscriberElement.style.width = "100%";
              subscriberElement.style.height = "100%";
              subscriberElement.style.position = "absolute";
              subscriberElement.style.top = "0";
              subscriberElement.style.left = "0";
              
              if (participant.isScreenShare) {
                subscriberElement.style.objectFit = "contain";
              } else {
                subscriberElement.style.objectFit = "cover";
              }
              
              // For screen share, also style any video elements inside
              if (participant.isScreenShare) {
                const videoElements = subscriberElement.querySelectorAll('video');
                videoElements.forEach(video => {
                  video.style.width = "100%";
                  video.style.height = "100%";
                  video.style.objectFit = "contain";
                });
              }
            }
          } catch (error) {
            console.error("Error positioning subscriber video:", error);
          }
        }
      }
    });
  }, [participants]);

  useEffect(() => {
    if (publisherElementRef.current) {
      const publisherContainer = publisherElementRef.current;

      const videoElement = publisherContainer.querySelector("video");
      // const divElements = publisherContainer.querySelectorAll("div");

      if (videoElement) {
        videoElement.style.width = "100%";
        videoElement.style.height = "100%";
        videoElement.style.objectFit = "contain";
        videoElement.style.borderRadius = "8px";
        videoElement.style.position = "absolute";
        videoElement.style.top = "0";
        videoElement.style.left = "0";
        videoElement.style.zIndex = "1";

        if (videoElement.paused) {
          videoElement.play().catch(console.error);
        }
      }

      Array.from(publisherContainer.children).forEach((child, index) => {
        console.log(`Child ${index}:`, child);
        child.style.width = "100%";
        child.style.height = "100%";
        child.style.position = "absolute";
        child.style.top = "0";
        child.style.left = "0";
        child.style.borderRadius = "8px";
        if (child.tagName === "DIV") {
          child.style.zIndex = "1";
        }
      });
    }
  }, [meetingState.video, participants]);

  const setSubscriberRef = (participantId, element) => {
    if (element) {
      subscriberRefs.current.set(participantId, element);
    } else {
      subscriberRefs.current.delete(participantId);
    }
  };

  const handleScreenshot = async () => {
    try {
      const screenshotData = await takeScreenshot(); // This already creates the screenshot
      
      if (screenshotData && (screenshotData.url || screenshotData.screenshots)) {
        const screenshots = screenshotData.screenshots || [screenshotData];
        
        screenshots.forEach(screenshot => {
          const newAttachment = {
            id: screenshot.id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            filename: screenshot.filename || `meeting-screenshot-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`,
            url: screenshot.url || screenshot,
            type: 'screenshot',
            timestamp: screenshot.timestamp || new Date().toISOString()
          };
          
          setChatAttachments(prev => {
            const exists = prev.some(att => att.filename === newAttachment.filename);
            if (exists) return prev;
            return [...prev, newAttachment];
          });
          
          setChatInput(prev => {
            const attachmentText = `📸 Screenshot attached: ${newAttachment.filename}`;
            if (prev.includes(attachmentText)) return prev;
            return prev + (prev ? '\n' : '') + attachmentText;
          });
        });
      }
    } catch (error) {
      console.error("Screenshot failed:", error);
    }
  };

  const handleMaximizeScreenshot = (screenshot) => {
    setSelectedScreenshot(screenshot);
    setShowScreenshotModal(true);
  };

  return (
    <div
      className="relative h-screen bg-gray-900 flex flex-col"
      id="video-container"
    >
      {/* Header */}
      <div className="bg-gray-800 p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-white font-semibold">Video Meeting</h2>
          <button
            onClick={copyMeetingLink}
            className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition duration-200"
          >
            {linkCopied ? (
              <iconComponents.check className="w-4 h-4" />
            ) : (
              <iconComponents.copy className="w-4 h-4" />
            )}
            {linkCopied ? "Copied!" : "Copy Link"}
          </button>
        </div>
        {/* Show participants count */}
        <div
          className="text-white text-sm pointer-events-none select-none"
          aria-disabled
        >
          {participants.length} participant
          {participants.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex h-screen overflow-hidden">
        <div className="flex-1 p-4">
          {hasScreenShare ? (
            <div className="flex flex-col h-full gap-4">
              <div
                className="flex-1 bg-gray-800 rounded-lg relative overflow-hidden"
                style={{ height: "75%" }}
              >
                {screenShareParticipant ? (
                  <>
                    <div
                      ref={(element) =>
                        setSubscriberRef(screenShareParticipant.id, element)
                      }
                      className="w-full h-full relative"
                    />
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm z-50">
                      {screenShareParticipant.name} - Screen Share
                    </div>
                  </>
                ) : screenShareState.isSharing ? (
                  <>
                    <div
                      ref={publisherElementRef}
                      className="w-full h-full relative"
                    />
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm z-50">
                      {userName} - Screen Share (You)
                    </div>
                  </>
                ) : (<h1>Screen Share</h1>)}
              </div>

              <div
                className="flex gap-2 overflow-x-auto"
                style={{ height: "25%" }}
              >
                {!screenShareState.isSharing && (
                  <div
                    className="bg-gray-800 rounded-lg relative overflow-hidden flex-shrink-0"
                    style={{ width: "200px", height: "100%" }}
                  >
                    <div
                      ref={publisherElementRef}
                      className="w-full h-full relative"
                    />
                    {!meetingState.video && (
                      <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-white">
                            {getInitials(userName)}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white px-1 py-0.5 rounded text-xs">
                      You
                    </div>
                  </div>
                )}

                {regularParticipants.map((participant) => (
                  <div
                    key={participant.id}
                    className="bg-gray-800 rounded-lg relative overflow-hidden flex-shrink-0"
                    style={{ width: "200px", height: "100%" }}
                  >
                    <div
                      ref={(element) =>
                        setSubscriberRef(participant.id, element)
                      }
                      className="w-full h-full relative"
                    />
                    {!participant.video && (
                      <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-white">
                            {getInitials(participant.name)}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white px-1 py-0.5 rounded text-xs">
                      {participant.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div
              className={`grid ${
                participants.length === 1
                  ? "grid-cols-1"
                  : participants.length <= 4
                  ? "grid-cols-2"
                  : "grid-cols-3"
              } gap-4 h-full`}
            >
              {/* Local Video */}
              <div className="bg-gray-800 rounded-lg relative overflow-hidden">
                <div
                  ref={publisherElementRef}
                  className="w-full h-full relative"
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                  }}
                ></div>

                {!meetingState.video && (
                  <div className="absolute inset-0 bg-gray-700 flex items-center justify-center z-50">
                    <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-white">
                        {getInitials(userName)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm z-50">
                  {userName} (You)
                </div>
                {!meetingState.audio && (
                  <div className="absolute top-2 right-2 bg-red-600 p-1 rounded-full z-50">
                    <iconComponents.micOff className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>

              {participants
                .filter((p) => !p.isLocal)
                .map((participant) => (
                  <div
                    key={participant.id}
                    className="bg-gray-800 rounded-lg relative overflow-hidden"
                  >
                    <div
                      ref={(element) =>
                        setSubscriberRef(participant.id, element)
                      }
                      className="w-full h-full relative"
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "100%",
                      }}
                    ></div>

                    {!participant.video && (
                      <div className="absolute inset-0 bg-gray-700 flex items-center justify-center z-50">
                        <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-lg font-semibold text-white">
                            {getInitials(participant.name)}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm z-50">
                      {participant.name}
                    </div>
                    {!participant.audio && (
                      <div className="absolute top-2 right-2 bg-red-600 p-1 rounded-full z-50">
                        <iconComponents.micOff className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Chat Panel */}
        {meetingState.chat && (
          <div className="bg-gray-900 border-l border-gray-700 flex flex-col shadow-lg w-[360px]">
            <div className="p-3 border-b border-gray-700 bg-gray-800 flex justify-between">
              <h3 className="text-white text-lg font-semibold tracking-tight">
                Chat
              </h3>
              <button
                onClick={toggleChat}
                className="text-gray-400 hover:text-white p-1 rounded transition-colors"
                title="Close Chat"
              >
                <iconComponents.x className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              {chatMessages.map((message) => (
                <div key={message.id} className="mb-4 group">
                  <div className="text-xs text-gray-400 mb-1 flex items-center gap-2">
                    <span className="font-medium text-gray-300">
                      {message.sender}
                    </span>
                    <span>•</span>
                    <span>
                      {message.timestamp
                        ? new Date(message.timestamp).toLocaleTimeString()
                        : "Unknown time"}
                    </span>
                  </div>
                  <div className="text-white text-sm bg-gray-700/50 rounded-lg p-2 break-words whitespace-pre-wrap transition-all group-hover:bg-gray-700/70">
                    {message.message}
                    {message.type === "screenshot" && message.screenshots && (
                      <div className="mt-2 space-y-2">
                        {message.screenshots.map((screenshot, index) => (
                          <div
                            key={`${screenshot.id || message.id}-${index}`}
                            className="bg-gray-600/50 rounded p-2 text-xs relative group"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span>📸</span>
                                <span>{screenshot.filename}</span>
                              </div>
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    const link = document.createElement("a");
                                    link.href = screenshot.url;
                                    link.download = screenshot.filename;
                                    link.click();
                                  }}
                                  className="text-blue-400 hover:text-blue-300 p-1"
                                  title="Download"
                                >
                                  ↓
                                </button>
                                <button
                                  onClick={() => handleMaximizeScreenshot(screenshot)}
                                  className="text-green-400 hover:text-green-300 p-1"
                                  title="View Full Size"
                                >
                                  ⛶
                                </button>
                              </div>
                            </div>
                            <div className="text-gray-400 text-xs mt-1">
                              Screenshot shared at{" "}
                              {new Date(screenshot.timestamp).toLocaleTimeString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-2 border-t border-gray-700 bg-gray-800">
              {chatAttachments.length > 0 && (
                <div className="mb-2 p-2 bg-gray-700/50 rounded border-l-2 border-blue-500">
                  <div className="text-xs text-gray-300 mb-1">Attachments:</div>
                  {chatAttachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="bg-gray-600/50 rounded px-2 py-1 mb-2"
                    >
                      {/* Screenshot preview */}
                      {attachment.type === 'screenshot' && (
                        <div className="mb-2">
                          <img
                            src={attachment.url}
                            alt={attachment.filename}
                            className="w-full max-w-32 h-20 object-cover rounded cursor-pointer"
                            onClick={() => handleMaximizeScreenshot(attachment)}
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <span>📸</span>
                          <span>{attachment.filename}</span>
                        </span>
                        <div className="flex gap-1">
                          <button
                            onClick={() => {
                              const link = document.createElement("a");
                              link.href = attachment.url;
                              link.download = attachment.filename;
                              link.click();
                            }}
                            className="text-blue-400 hover:text-blue-300 px-1"
                            title="Download"
                          >
                            ↓
                          </button>
                          <button
                            onClick={() => handleMaximizeScreenshot(attachment)}
                            className="text-green-400 hover:text-green-300 px-1"
                            title="View Full Size"
                          >
                            ⛶
                          </button>
                          <button
                            onClick={() => {
                              setChatAttachments((prev) =>
                                prev.filter((a) => a.id !== attachment.id)
                              );
                              setChatInput((prev) =>
                                prev
                                  .replace(
                                    `📸 Screenshot attached: ${attachment.filename}`,
                                    ""
                                  )
                                  .trim()
                              );
                            }}
                            className="text-red-400 hover:text-red-300 px-1"
                            title="Remove"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 placeholder-gray-400"
                />
                <button
                  onClick={sendChatMessage}
                  className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-200 active:scale-95"
                >
                  Send
                </button>
              </div>
            </div>
            {showScreenshotModal && selectedScreenshot && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="relative max-w-4xl max-h-4xl w-full h-full p-4">
                  <div className="bg-gray-800 rounded-lg p-4 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-white text-lg font-semibold">
                        {selectedScreenshot.filename}
                      </h3>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const link = document.createElement("a");
                            link.href = selectedScreenshot.url;
                            link.download = selectedScreenshot.filename;
                            link.click();
                          }}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                          title="Download"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => setShowScreenshotModal(false)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
                          title="Close"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center bg-gray-900 rounded">
                      <img
                        src={selectedScreenshot.url}
                        alt={selectedScreenshot.filename}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Participants Panel */}
        {meetingState.participants && (
          <div className="w-[20rem] bg-gray-900 border-l border-gray-700 flex flex-col shadow-lg">
            <div className="p-3 border-b border-gray-700 bg-gray-800 flex justify-between">
              <h3 className="text-white text-lg font-semibold tracking-tight">
                Participants ({participants.length})
              </h3>
              <button
                onClick={toggleParticipants}
                className="text-gray-400 hover:text-white p-1 rounded transition-colors"
                title="Close Participants"
              >
                <iconComponents.x className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 mb-4 p-2 rounded-lg hover:bg-gray-700/50 transition-all duration-200"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-base font-semibold text-white">
                      {getInitials(participant.name)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">
                      {participant.name} {participant.isLocal && "(You)"}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!participant.audio && (
                      <iconComponents.micOff className="w-5 h-5 text-red-400" />
                    )}
                    {!participant.video && (
                      <iconComponents.videoOff className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showReactionPicker && (
          <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-gray-800 border border-gray-600 rounded-lg p-3 z-50">
            <div className="grid grid-cols-4 gap-2">
              {availableEmojis.map((reaction) => (
                <button
                  key={reaction.name}
                  onClick={() => sendReaction(reaction.emoji, reaction.name)}
                  className="text-2xl p-2 hover:bg-gray-700 rounded-lg transition duration-200"
                >
                  {reaction.emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Floating Reactions Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[9999]">
        {reactions.map((reaction) => (
          <div
            key={reaction.id}
            className="absolute text-3xl animate-floatUp select-none"
            style={{
              left: `${reaction.x}%`,
              bottom: `${reaction.y}%`,
              transform: "translate(-50%, 0)",
            }}
          >
            <div className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg flex items-center gap-2">
              <span className="text-2xl">{reaction.emoji}</span>
              <span className="text-sm font-medium">{reaction.sender}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="bg-gray-800 p-4">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => {
              if (!hasCamera) {
                setShowDeviceError('Camera is not connected');
                setTimeout(() => setShowDeviceError(null), 3000);
                return;
              }
              toggleVideo();
            }}
            title={`${"Turn " + (meetingState.video ? "off" : "on")} video`}
            className={`p-3 rounded-full ${
              !hasCamera 
                ? "bg-gray-500 cursor-not-allowed opacity-50"
                : meetingState.video
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-red-600 hover:bg-red-700"
            } text-white transition duration-200`}
            disabled={!hasCamera}
          >
            {meetingState.video ? (
              <iconComponents.video className="w-6 h-6" />
            ) : (
              <iconComponents.videoOff className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={() => {
              if (!hasMicrophone) {
                setShowDeviceError('Microphone is not connected');
                setTimeout(() => setShowDeviceError(null), 3000);
                return;
              }
              toggleAudio();
            }}
            title={`${"Turn " + (meetingState.audio ? "off" : "on")} audio`}
            className={`p-3 rounded-full ${
              !hasMicrophone 
                ? "bg-gray-500 cursor-not-allowed opacity-50"
                : meetingState.audio
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-red-600 hover:bg-red-700"
            } text-white transition duration-200`}
            disabled={!hasMicrophone}
          >
            {meetingState.audio ? (
              <iconComponents.mic className="w-6 h-6" />
            ) : (
              <iconComponents.micOff className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={toggleScreenShare}
            title="Share screen"
            className={`p-3 rounded-full ${
              meetingState.screenShare
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-700 hover:bg-gray-600"
            } text-white transition duration-200`}
          >
            <iconComponents.screenShare className="w-6 h-6" />
          </button>

          <button
            onClick={handleScreenshot}
            title="Take screenshot"
            className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition duration-200"
          >
            <iconComponents.screenShot className="w-6 h-6" />
          </button>

          <button
            onClick={toggleChat}
            title="Chat"
            className={`p-3 rounded-full ${
              meetingState.chat
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-700 hover:bg-gray-600"
            } text-white transition duration-200`}
          >
            <iconComponents.chat className="w-6 h-6" />
          </button>

          <button
            onClick={toggleParticipants}
            title="Participants"
            className={`p-3 rounded-full ${
              meetingState.participants
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-gray-700 hover:bg-gray-600"
            } text-white transition duration-200`}
          >
            <iconComponents.users className="w-6 h-6" />
          </button>

          <button
            ref={reactionButtonRef}
            title="Reaction"
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition duration-200"
          >
            <iconComponents.reactions className="w-6 h-6" />
          </button>

          <button
            title="Leave meeting"
            onClick={handleLeaveMeetingClick}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition duration-200 ml-4"
          >
            <iconComponents.phoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
      {showDeviceError && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
          <div className="flex items-center gap-2">
            <iconComponents.alertCircle className="w-5 h-5" />
            <span>{showDeviceError}</span>
          </div>
        </div>
      )}
      <LeaveMeetingModal
        isOpen={showLeaveMeetingModal}
        onClose={() => setShowLeaveMeetingModal(false)}
        onConfirm={leaveMeeting}
        isHost={isHost}
        participants={participants}
        getInitials={getInitials}
        onTransferHost={transferHost}
      />
    </div>
  );
};

export default MeetingRoomPage;
