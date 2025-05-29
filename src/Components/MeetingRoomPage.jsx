import React, { useEffect, useRef, useState } from "react";
import LeaveMeetingModal from "./LeaveMeetingModel";

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
}) => {
  const subscriberRefs = useRef(new Map());
  const messagesEndRef = useRef(null);
  const hasScreenShare =
    screenShareState.isSharing || screenShareState.isReceiving;
  const screenShareParticipant = participants.find((p) => p.isScreenShare);
  const regularParticipants = participants.filter((p) => !p.isScreenShare);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    const remoteParticipants = participants.filter((p) => !p.isLocal);

    remoteParticipants.forEach((participant) => {
      if (participant.subscriber) {
        const videoElement = subscriberRefs.current.get(participant.id);
        if (videoElement && !videoElement.hasChildNodes()) {
          try {
            // Move the subscriber's video element to the correct container
            const subscriberElement = participant.subscriber.element;
            if (
              subscriberElement &&
              subscriberElement.parentNode !== videoElement
            ) {
              // Clear any existing content
              videoElement.innerHTML = "";
              // Append the subscriber's video element
              videoElement.appendChild(subscriberElement);

              // Ensure proper styling
              subscriberElement.style.width = "100%";
              subscriberElement.style.height = "100%";
              subscriberElement.style.objectFit = "cover";
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

      //   console.log("Publisher container children:", publisherContainer.children);
      //   console.log(
      //     "Publisher container innerHTML:",
      //     publisherContainer.innerHTML
      //   );

      const videoElement = publisherContainer.querySelector("video");
      const divElements = publisherContainer.querySelectorAll("div");

      //   console.log("Found video element:", videoElement);
      //   console.log("Found div elements:", divElements);

      if (videoElement) {
        // console.log("Video element src:", videoElement.src);
        // console.log("Video element srcObject:", videoElement.srcObject);
        // console.log("Video element videoWidth:", videoElement.videoWidth);
        // console.log("Video element videoHeight:", videoElement.videoHeight);
        // console.log("Video element readyState:", videoElement.readyState);

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
      await takeScreenshot();
    } catch (error) {
      console.error("Screenshot failed:", error);
    }
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
        <div className="text-white text-sm">
          {participants.length} participant
          {participants.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex h-screen">
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
                ) : (
                  <h1>Screenshare</h1>
                )}
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
          <div className="w-[21rem] bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-2 border-b border-gray-700">
              <h3 className="text-white font-semibold">Chat</h3>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              {chatMessages.map((message) => (
                <div key={message.id} className="mb-3">
                  <div className="text-xs text-gray-400 mb-1">
                    {message.sender} •{" "}
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="text-white break-words whitespace-pre-wrap">
                    {message.message}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-1 border-t border-gray-700">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-2 py-1 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendChatMessage}
                  className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Participants Panel */}
        {meetingState.participants && (
          <div className="w-[18rem] bg-gray-800 border-l border-gray-700 flex flex-col">
            <div className="p-2 border-b border-gray-700">
              <h3 className="text-white font-semibold">
                Participants ({participants.length})
              </h3>
            </div>
            <div className="flex-1 p-2 overflow-y-auto">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 mb-3"
                >
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-white">
                      {getInitials(participant.name)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm">
                      {participant.name} {participant.isLocal && "(You)"}{" "}
                      {isHost && "(Host)"}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!participant.audio && (
                      <iconComponents.micOff className="w-4 h-4 text-red-400" />
                    )}
                    {!participant.video && (
                      <iconComponents.videoOff className="w-4 h-4 text-red-400" />
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
            onClick={toggleVideo}
            className={`p-3 rounded-full ${
              meetingState.video
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-red-600 hover:bg-red-700"
            } text-white transition duration-200`}
          >
            {meetingState.video ? (
              <iconComponents.video className="w-6 h-6" />
            ) : (
              <iconComponents.videoOff className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full ${
              meetingState.audio
                ? "bg-gray-700 hover:bg-gray-600"
                : "bg-red-600 hover:bg-red-700"
            } text-white transition duration-200`}
          >
            {meetingState.audio ? (
              <iconComponents.mic className="w-6 h-6" />
            ) : (
              <iconComponents.micOff className="w-6 h-6" />
            )}
          </button>

          <button
            onClick={toggleScreenShare}
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
            className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition duration-200"
          >
            <iconComponents.screenShot className="w-6 h-6" />
          </button>

          <button
            onClick={toggleChat}
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
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition duration-200"
          >
            <iconComponents.reactions className="w-6 h-6" />
          </button>

          <button
            onClick={handleLeaveMeetingClick}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition duration-200 ml-4"
          >
            <iconComponents.phoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
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
