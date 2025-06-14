import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  Camera,
  Phone,
  MessageSquare,
  Users,
  Smile,
  Settings,
  PhoneOff,
  Copy,
  Check,
  Minimize2,
  Maximize2,
  CircleAlert,
  X
} from "lucide-react";
import html2canvas from "html2canvas";
import LandingPage from "./Components/LandingPage.jsx";
import PrejoinPage from "./Components/PrejoinPage.jsx";
import MeetingRoomPage from "./Components/MeetingRoomPage.jsx";

const loadVonageSDK = () => {
  return new Promise((resolve, reject) => {
    if (window.OT) {
      resolve(window.OT);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://static.opentok.com/v2.30/js/opentok.min.js";
    script.onload = () => resolve(window.OT);
    script.onerror = () => reject(new Error("Failed to load Vonage Video SDK"));
    document.head.appendChild(script);
  });
};

const VonageVideoMeeting = ({
  sessionId: propSessionId,
  token: propToken,
  apiKey: propApiKey,
  username,
  isHost: propIsHost,
  meetingUrl: propMeetingUrl,
  createMeeting,
  generateToken,
  extractSessionIdFromUrl,
  screenShotWithChat,
  icons = {},
  theme = {},
  landingPageStyle = {},
  preJoinPageStyle = {},
  landingPageText = {},
  preJoinPageText = {}
}) => {
  const [currentView, setCurrentView] = useState("landing");
  const [userName, setUserName] = useState(username || "");
  const [meetingLink, setMeetingLink] = useState(propMeetingUrl || "");
  const [sessionId, setSessionId] = useState(propSessionId || "");
  const [token, setToken] = useState(propToken || "");
  const [apiKey, setApiKey] = useState(propApiKey || "");
  const [isHost, setIsHost] = useState(propIsHost || false);
  const [devices, setDevices] = useState({ cameras: [], microphones: [] });
  const [selectedDevices, setSelectedDevices] = useState({
    camera: "",
    microphone: "",
  });
  const [previewEnabled, setPreviewEnabled] = useState({
    video: false,
    audio: false,
  });
  const [meetingState, setMeetingState] = useState({
    video: true,
    audio: true,
    screenShare: false,
    screenShot: false,
    chat: false,
    participants: false,
    reactions: false,
  });
  const [chatAttachments, setChatAttachments] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState("");
  const [reactions, setReactions] = useState([]);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [OT, setOT] = useState(null);
  const [screenShareState, setScreenShareState] = useState({
    isSharing: false,
    isReceiving: false,
    sharedBy: null,
    screenShareStream: null,
  });
  const [showLeaveMeetingModal, setShowLeaveMeetingModal] = useState(false);

  // Refs
  const publisherRef = useRef(null);
  const sessionRef = useRef(null);
  const previewRef = useRef(null);
  const publisherElementRef = useRef(null);
  const subscribersRef = useRef(new Map());
  const reactionButtonRef = useRef(null);

  // Default icons
  const defaultIcons = {
    video: Video,
    videoOff: VideoOff,
    mic: Mic,
    micOff: MicOff,
    screenShare: Monitor,
    camera: Camera,
    phone: Phone,
    phoneOff: PhoneOff,
    chat: MessageSquare,
    users: Users,
    screenShot: Camera,
    reactions: Smile,
    settings: Settings,
    copy: Copy,
    check: Check,
    minimize: Minimize2,
    maximize: Maximize2,
    alertCircle: CircleAlert,
    x: X
  };

  const iconComponents = { ...defaultIcons, ...icons };

  // Default theme
  const defaultTheme = {
    primary: "#3B82F6",
    secondary: "#1F2937",
    success: "#10B981",
    danger: "#EF4444",
    background: "#F9FAFB",
    surface: "#FFFFFF",
    text: "#111827",
    textSecondary: "#6B7280",
  };

  const themeColors = { ...defaultTheme, ...theme };

  // Load Vonage SDK on mount
  useEffect(() => {
    loadVonageSDK()
      .then((sdk) => {
        setOT(sdk);
        console.log("Vonage Video SDK loaded successfully");
      })
      .catch((error) => {
        console.error("Failed to load Vonage Video SDK:", error);
        setConnectionError(
          "Failed to load video SDK. Please refresh the page."
        );
      });
  }, []);

  const checkDeviceAvailability = useCallback(async () => {
    if (!OT) return { hasCamera: false, hasMicrophone: false };

    return new Promise((resolve) => {
      OT.getDevices((error, devices) => {
        if (error) {
          console.error("Error getting devices:", error);
          resolve({ hasCamera: false, hasMicrophone: false });
          return;
        }

        const cameras = devices.filter(
          (device) => device.kind === "videoInput"
        );
        const microphones = devices.filter(
          (device) => device.kind === "audioInput"
        );

        resolve({
          hasCamera: cameras.length > 0,
          hasMicrophone: microphones.length > 0,
          cameras,
          microphones,
        });
      });
    });
  }, [OT]);

  const initializeDevices = useCallback(async () => {
    if (!OT) return;

    try {
      const deviceInfo = await checkDeviceAvailability();

      if (!deviceInfo.hasCamera && !deviceInfo.hasMicrophone) {
        setConnectionError(
          "No camera or microphone detected. Please connect at least one device."
        );
        return;
      }

      setDevices({
        cameras: deviceInfo.cameras || [],
        microphones: deviceInfo.microphones || [],
      });

      setSelectedDevices({
        camera: deviceInfo.cameras?.[0]?.deviceId || "",
        microphone: deviceInfo.microphones?.[0]?.deviceId || "",
      });

      // Update preview state based on available devices
      setPreviewEnabled({
        video: deviceInfo.hasCamera,
        audio: deviceInfo.hasMicrophone,
      });
    } catch (error) {
      console.error("Error getting devices:", error);
      setConnectionError("Failed to detect audio/video devices");
    }
  }, [OT, checkDeviceAvailability]);

  // Initialize devices on mount
  useEffect(() => {
    if (currentView === "prejoin" && OT) {
      initializeDevices();
    }
  }, [currentView, OT, initializeDevices]);

  useEffect(() => {
    if (currentView === "prejoin" && previewRef.current && OT) {
      const initializePreview = async () => {
        const deviceInfo = await checkDeviceAvailability();

        if (!deviceInfo.hasCamera && !deviceInfo.hasMicrophone) {
          setConnectionError(
            "No camera or microphone detected. Please connect at least one device."
          );
          return;
        }

        // Clean up existing publisher before creating new one
        if (publisherRef.current) {
          publisherRef.current.destroy();
          publisherRef.current = null;
        }

        const publisherOptions = {
          insertMode: "append",
          width: "100%",
          height: "100%",
          publishAudio: previewEnabled.audio && deviceInfo.hasMicrophone,
          publishVideo: previewEnabled.video && deviceInfo.hasCamera,
          videoSource:
            selectedDevices.camera && deviceInfo.hasCamera
              ? selectedDevices.camera
              : undefined,
          audioSource:
            selectedDevices.microphone && deviceInfo.hasMicrophone
              ? selectedDevices.microphone
              : undefined,
        };

        const publisher = OT.initPublisher(
          previewRef.current,
          publisherOptions,
          (error) => {
            if (error) {
              console.error("Error initializing publisher for preview:", error);
              setConnectionError(
                "Failed to access available camera/microphone"
              );
            }
          }
        );

        publisherRef.current = publisher;
      };

      initializePreview();
    }

    return () => {
      if (
        currentView !== "meeting" && // Don't destroy publisher when moving to meeting
        publisherRef.current &&
        typeof publisherRef.current.destroy === "function"
      ) {
        publisherRef.current.destroy();
        publisherRef.current = null;
      }
    };
  }, [
    currentView,
    previewEnabled,
    selectedDevices,
    OT,
    checkDeviceAvailability,
  ]);

  const availableEmojis = [
    { emoji: "👍", name: "thumbs-up" },
    { emoji: "👏", name: "clap" },
    { emoji: "😂", name: "laugh" },
    { emoji: "❤️", name: "heart" },
    { emoji: "😮", name: "wow" },
    { emoji: "👋", name: "wave" },
    { emoji: "🔥", name: "fire" },
    { emoji: "💯", name: "hundred" },
  ];

  const sendReaction = (emoji, emojiName) => {
    const button = reactionButtonRef.current;

    let x = 50;
    let y = 80;

    if (button) {
      const rect = button.getBoundingClientRect();
      const containerRect = document
        .getElementById("video-container")
        .getBoundingClientRect();

      // Calculate % relative to the container
      x =
        ((rect.left + rect.width / 2 - containerRect.left) /
          containerRect.width) *
        100;
      y = ((containerRect.bottom - rect.top) / containerRect.height) * 100;
    }

    const newReaction = {
      id: Date.now() + Math.random(),
      emoji,
      name: emojiName,
      sender: userName,
      timestamp: Date.now(),
      x,
      y,
    };

    setReactions((prev) => [...prev, newReaction]);
    setShowReactionPicker(false);

    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== newReaction.id));
    }, 3000);

    if (sessionRef.current) {
      sessionRef.current.signal(
        {
          type: "reaction",
          data: JSON.stringify(newReaction),
        },
        (error) => {
          if (error) {
            console.error("Error sending reaction:", error);
          }
        }
      );
    }
  };

  useEffect(() => {
    if (sessionRef.current) {
      const handleReactionSignal = (event) => {
        try {
          const reactionData = JSON.parse(event.data);
          if (reactionData.sender !== userName) {
            // Don't show own reactions again
            setReactions((prev) => [...prev, reactionData]);

            // Remove reaction after animation
            setTimeout(() => {
              setReactions((prev) =>
                prev.filter((r) => r.id !== reactionData.id)
              );
            }, 3000);
          }
        } catch (error) {
          console.error("Error parsing reaction data:", error);
        }
      };

      sessionRef.current.on("signal:reaction", handleReactionSignal);

      return () => {
        if (sessionRef.current) {
          sessionRef.current.off("signal:reaction", handleReactionSignal);
        }
      };
    }
  }, [userName, sessionRef.current]);

  useEffect(() => {
    const currentPath = window.location.pathname;
    const urlParams = new URLSearchParams(window.location.search);

    if (currentPath.includes("/meeting/")) {
      const extractedSessionId = extractSessionIdFromUrl(window.location.href);
      if (extractedSessionId) {
        setSessionId(extractedSessionId);

        const urlToken = urlParams.get("token");
        const urlUserName = urlParams.get("user");
        const urlIsHost = urlParams.get("host") === "true";

        if (urlToken && urlUserName) {
          setToken(urlToken);
          setUserName(urlUserName);
          setIsHost(urlIsHost);
          const urlApiKey = urlParams.get("apiKey");
          if (urlApiKey) {
            setApiKey(urlApiKey);
          }
          setCurrentView("meeting");
        } else {
          setCurrentView("prejoin");
          setMeetingLink(window.location.href);
        }
      } else {
        window.history.replaceState({}, "", "/");
        setCurrentView("landing");
      }
    } else {
      setCurrentView("landing");
    }
  }, []);

  // const updateUrlForMeeting = useCallback((meetingUrl) => {
  //   if (meetingUrl) {
  //     window.history.pushState({}, "", meetingUrl);
  //     setMeetingLink(meetingUrl);
  //   }
  // }, []);

  const updateUrlForJoining = useCallback(
    (sessionId, token, userName, isHost) => {
      const currentPath = window.location.pathname;
      const newUrl = `${currentPath}?token=${encodeURIComponent(
        token
      )}&user=${encodeURIComponent(userName)}&host=${isHost}`;
      window.history.pushState({}, "", newUrl);
    },
    []
  );

  // Join meeting function
  const joinMeeting = useCallback(async () => {
    if (!userName.trim()) {
      alert("Please enter your name");
      return;
    }

    if (!OT) {
      setConnectionError("Video SDK not loaded. Please refresh the page.");
      return;
    }

    if (!sessionId) {
      setConnectionError("Missing session ID");
      return;
    }

    setIsConnecting(true);
    setConnectionError("");

    try {
      let currentToken = token;
      let currentApiKey = apiKey;

      if (!currentToken || !currentApiKey) {
        const userData = {
          name: userName,
          role: isHost ? "host" : "participant",
        };

        const tokenData = await generateToken(sessionId, userData, "publisher");

        currentToken = tokenData.token;
        currentApiKey = tokenData.apiKey;

        setToken(currentToken);
        setApiKey(currentApiKey);
      }

      if (!currentToken) {
        throw new Error("Failed to obtain authentication token");
      }

      if (!currentApiKey) {
        throw new Error("Failed to obtain API key");
      }
      const deviceInfo = await checkDeviceAvailability();

      if (!deviceInfo.hasCamera && !deviceInfo.hasMicrophone) {
        setConnectionError(
          "Cannot join meeting: No camera or microphone detected. Please connect at least one device and try again."
        );
        setIsConnecting(false);
        return;
      }

      if (sessionRef.current) {
        try {
          if (typeof sessionRef.current.disconnect === "function") {
            sessionRef.current.disconnect();
          }
        } catch (cleanupError) {
          console.warn("Error cleaning up existing session:", cleanupError);
        }
        sessionRef.current = null;
      }

      if (publisherRef.current) {
        try {
          publisherRef.current.destroy();
        } catch (publisherError) {
          console.warn("Error cleaning up existing publisher:", publisherError);
        }
        publisherRef.current = null;
      }

      subscribersRef.current.clear();

      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("Initializing new session...");
      console.log("Using API Key:", currentApiKey);
      console.log("Using Session ID:", sessionId);
      console.log("Using Token:", currentToken?.substring(0, 20) + "...");

      const session = OT.initSession(currentApiKey, sessionId);
      sessionRef.current = session;

      // Set up session event handlers
      session.on("streamCreated", (event) => {
        console.log("Stream created:", event.stream);
        const stream = event.stream;

        // Validate stream
        if (!stream || !stream.streamId || stream.destroyed) {
          console.warn("Invalid or destroyed stream received:", stream);
          return;
        }

        // Skip own stream
        if (
          session.connection &&
          session.connection.connectionId === stream.connection.connectionId
        ) {
          console.log("Skipping own stream");
          return;
        }

        if (subscribersRef.current.has(stream.streamId)) {
          console.log("Stream already subscribed:", stream.streamId);
          return;
        }

        // Enhanced screen share detection
        const isScreenShare =
          (stream.name && stream.name.includes("(Screen)")) ||
          stream.videoType === "screen" ||
          (stream.connection &&
            stream.connection.data &&
            JSON.parse(stream.connection.data || "{}").isScreenShare);

        if (isScreenShare) {
          console.log("Screen share stream detected");

          // Create a container div that will be moved to the proper location
          const subscriberContainer = document.createElement("div");
          subscriberContainer.style.width = "100%";
          subscriberContainer.style.height = "100%";
          subscriberContainer.style.position = "absolute";
          subscriberContainer.style.top = "0";
          subscriberContainer.style.left = "0";
          subscriberContainer.id = `screen-share-${stream.streamId}`;

          const subscriber = session.subscribe(
            stream,
            subscriberContainer,
            {
              insertMode: "append",
              width: "100%",
              height: "100%",
              subscribeToAudio: true,
              subscribeToVideo: true,
              fitMode: "contain",
              style: {
                buttonDisplayMode: "off",
              },
            },
            (error) => {
              if (error) {
                console.error("Error subscribing to screen share:", error);
                return;
              }

              console.log("Successfully subscribed to screen share");

              // Store the subscriber with a special key for screen share
              subscribersRef.current.set(
                `screenshare-${stream.streamId}`,
                subscriber
              );

              // Update screen share state
              setScreenShareState((prev) => ({
                ...prev,
                isReceiving: true,
                sharedBy: stream.name
                  ? stream.name.replace(" (Screen)", "")
                  : "Remote User",
                screenShareStream: subscriber,
              }));

              // Add screen share participant
              setParticipants((prev) => {
                const existing = prev.find((p) => p.id === stream.streamId);
                if (existing) return prev;

                return [
                  ...prev,
                  {
                    id: stream.streamId,
                    name: stream.name
                      ? stream.name.replace(" (Screen)", "")
                      : "Remote User",
                    isLocal: false,
                    video: true,
                    audio: stream.hasAudio,
                    subscriber: subscriber,
                    isScreenShare: true,
                    subscriberContainer: subscriberContainer, // Store container reference
                  },
                ];
              });
            }
          );
        } else {
          // Regular video stream handling (existing logic)
          setTimeout(() => {
            if (stream.destroyed) {
              console.warn("Stream was destroyed during initialization delay");
              return;
            }

            try {
              console.log(
                "Attempting to subscribe to regular stream:",
                stream.streamId
              );

              const tempContainer = document.createElement("div");
              tempContainer.style.width = "100%";
              tempContainer.style.height = "100%";
              tempContainer.style.position = "absolute";
              tempContainer.style.top = "0";
              tempContainer.style.left = "0";

              const subscriber = session.subscribe(
                stream,
                tempContainer,
                {
                  insertMode: "append",
                  width: "100%",
                  height: "100%",
                  subscribeToAudio: true,
                  subscribeToVideo: true,
                  fitMode: "cover",
                },
                (error) => {
                  if (error) {
                    console.error("Error subscribing to stream:", error);
                    subscribersRef.current.delete(stream.streamId);
                    return;
                  }

                  console.log(
                    "Successfully subscribed to stream:",
                    stream.streamId
                  );
                  subscribersRef.current.set(stream.streamId, subscriber);

                  setParticipants((prev) => {
                    const existingStreamIndex = prev.findIndex(
                      (p) => p.id === stream.streamId
                    );
                    if (existingStreamIndex !== -1) {
                      const updated = [...prev];
                      updated[existingStreamIndex] = {
                        ...updated[existingStreamIndex],
                        video: stream.hasVideo,
                        audio: stream.hasAudio,
                        subscriber,
                      };
                      return updated;
                    }

                    const existingConnectionIndex = prev.findIndex(
                      (p) =>
                        !p.isLocal && p.id === stream.connection.connectionId
                    );

                    if (existingConnectionIndex !== -1) {
                      const updated = [...prev];
                      updated[existingConnectionIndex] = {
                        ...updated[existingConnectionIndex],
                        id: stream.streamId,
                        name:
                          stream.name || updated[existingConnectionIndex].name,
                        video: stream.hasVideo,
                        audio: stream.hasAudio,
                        subscriber,
                      };
                      return updated;
                    }

                    const newParticipant = {
                      id: stream.streamId,
                      connectionId: stream.connection.connectionId,
                      name: stream.name || "Remote User",
                      isLocal: false,
                      video: stream.hasVideo,
                      audio: stream.hasAudio,
                      subscriber,
                      isHost: false,
                    };

                    return [...prev, newParticipant];
                  });

                  // Add event listeners for video/audio state changes
                  subscriber.on("videoEnabled", () => {
                    setParticipants((prev) =>
                      prev.map((p) =>
                        p.id === stream.streamId ? { ...p, video: true } : p
                      )
                    );
                  });

                  subscriber.on("videoDisabled", () => {
                    setParticipants((prev) =>
                      prev.map((p) =>
                        p.id === stream.streamId ? { ...p, video: false } : p
                      )
                    );
                  });

                  subscriber.on("audioEnabled", () => {
                    setParticipants((prev) =>
                      prev.map((p) =>
                        p.id === stream.streamId ? { ...p, audio: true } : p
                      )
                    );
                  });

                  subscriber.on("audioDisabled", () => {
                    setParticipants((prev) =>
                      prev.map((p) =>
                        p.id === stream.streamId ? { ...p, audio: false } : p
                      )
                    );
                  });
                }
              );
            } catch (subscribeError) {
              console.error("Exception during subscription:", subscribeError);
              subscribersRef.current.delete(stream.streamId);
            }
          }, 500);
        }
      });

      // Also update the streamDestroyed handler:
      session.on("streamDestroyed", (event) => {
        const stream = event.stream;
        const isScreenShare =
          (stream.name && stream.name.includes("(Screen)")) ||
          stream.videoType === "screen";

        console.log(
          "Stream destroyed:",
          stream.streamId,
          "isScreenShare:",
          isScreenShare
        );

        if (isScreenShare) {
          // Clean up screen share
          subscribersRef.current.delete(`screenshare-${stream.streamId}`);
          setScreenShareState({
            isSharing: false,
            isReceiving: false,
            sharedBy: null,
            screenShareStream: null,
          });
          setParticipants((prev) => prev.filter((p) => !p.isScreenShare));
        } else if (stream && stream.streamId) {
          // Clean up regular participant
          subscribersRef.current.delete(stream.streamId);
          setParticipants((prev) =>
            prev.filter((p) => p.id !== stream.streamId)
          );
        }
      });

      session.on("connectionCreated", (event) => {
        const isLocal =
          event.connection.connectionId === session.connection.connectionId;
        let name = "Remote User";
        if (event.connection.data) {
          try {
            const userData = JSON.parse(event.connection.data);
            name = userData.name || name;
          } catch (e) {
            console.warn("Could not parse connection data");
          }
        }
        setParticipants((prev) => {
          const exists = prev.find(
            (p) => p.id === event.connection.connectionId
          );
          if (exists) return prev;
          return [
            ...prev,
            {
              id: event.connection.connectionId,
              name,
              isLocal,
              video: true,
              audio: true,
            },
          ];
        });
      });

      session.on("connectionDestroyed", (event) => {
        console.log("Connection destroyed:", event.connection);
        if (event.connection && event.connection.connectionId) {
          const connectionId = event.connection.connectionId;
          setParticipants((prev) =>
            prev.filter((p) => {
              if (p.isLocal) return true;
              if (
                p.subscriber &&
                p.subscriber.stream &&
                p.subscriber.stream.connection
              ) {
                const shouldRemove =
                  p.subscriber.stream.connection.connectionId === connectionId;
                if (shouldRemove) {
                  subscribersRef.current.delete(p.id);
                }
                return !shouldRemove;
              }
              return true;
            })
          );
        }
      });

      session.on("sessionDisconnected", (event) => {
        console.log("Session disconnected:", event.reason);
        if (event.reason !== "clientDisconnected") {
          setConnectionError("Session was disconnected unexpectedly");
          setTimeout(() => {
            setCurrentView("landing");
          }, 2000);
        }
        subscribersRef.current.clear();
      });

      session.on("sessionReconnecting", (event) => {
        console.log("Session reconnecting...");
        setConnectionError("Reconnecting to session...");
      });

      session.on("sessionReconnected", (event) => {
        console.log("Session reconnected");
        setConnectionError("");
      });

      // Enhanced error handling for session connection
      session.on("exception", (event) => {
        console.error("Session exception:", event);
        setConnectionError(
          `Session error: ${event.message || "Unknown error"}`
        );
      });

      session.on("signal:hostTransfer", (event) => {
        try {
          const data = JSON.parse(event.data);
          const { newHostId, newHostName, previousHost } = data;
          console.log('newHostId:', newHostId);
          console.log('newHostName:', newHostName);
          console.log('previousHost:', previousHost);

          const isNewHost =
            session.connection && session.connection.connectionId === newHostId;
          console.log("is New Host:", isNewHost);

          if (isNewHost) {
            console.log("You are now the host of the meeting");
            setIsHost(true);
            // alert(`You are now the host of this meeting!`);
            setShowLeaveMeetingModal(false);
            // setTimeout(() => setShowLeaveMeetingModal(true), 100);
          } else {
            console.log("You are no longer the host of the meeting");
            setIsHost(false);
          }

          setParticipants((prev) =>
            prev.map((p) => {
              let isThisParticipantNewHost = false;
              
              if (p.isLocal && session.connection) {
                isThisParticipantNewHost = session.connection.connectionId === newHostId;
              } else if (p.subscriber?.stream?.connection) {
                isThisParticipantNewHost = p.subscriber.stream.connection.connectionId === newHostId;
              }
              return {
                ...p,
                isHost: isThisParticipantNewHost,
              };
            })
          );

          console.log(
            `Host transferred from ${previousHost} to ${newHostName}`
          );
        } catch (error) {
          console.error("Error processing host transfer:", error);
        }
      });

      console.log("Connecting to session...");

      const connectPromise = new Promise((resolve, reject) => {
        let isResolved = false;

        // Set up timeout
        const timeout = setTimeout(() => {
          if (!isResolved) {
            isResolved = true;
            reject(
              new Error(
                "Connection timeout - please check your network and try again"
              )
            );
          }
        }, 20000); // 15 second timeout

        session.connect(currentToken, (error) => {
          if (isResolved) return;

          clearTimeout(timeout);
          isResolved = true;

          if (error) {
            console.error("Error connecting to session:", error);
            reject(error);
            return;
          }

          console.log("Connected to session successfully");
          resolve();
        });
      });

      await connectPromise;
      let allConnections = [];
      if (typeof session.getConnections === "function") {
        allConnections = session.getConnections();
      } else if (session.connections) {
        allConnections = Object.values(session.connections);
      }

      setParticipants((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const newParticipants = allConnections
          .filter(
            (conn) => conn && conn.connectionId && !ids.has(conn.connectionId)
          )
          .map((conn) => {
            let name = "Remote User";
            if (conn.data) {
              try {
                const userData = JSON.parse(conn.data);
                name = userData.name || name;
              } catch {}
            }
            return {
              id: conn.connectionId,
              name,
              isLocal: conn.connectionId === session.connection.connectionId,
              video: true,
              audio: true,
            };
          });
        return [...prev, ...newParticipants];
      });

      setCurrentView("meeting");
      await new Promise((resolve) => setTimeout(resolve, 100));

      if (!publisherElementRef.current) {
        throw new Error("Publisher element not found - DOM may not be ready");
      }

      // console.log("Publisher element found:", publisherElementRef.current);

      const finalVideoState = previewEnabled.video && deviceInfo.hasCamera;
      const finalAudioState = previewEnabled.audio && deviceInfo.hasMicrophone;

      setMeetingState((prev) => ({
        ...prev,
        video: finalVideoState,
        audio: finalAudioState,
      }));

      const publisherOptions = {
        insertMode: "append",
        width: "100%",
        height: "100%",
        name: userName,
        publishAudio: finalAudioState,
        publishVideo: finalVideoState,
        videoSource:
          selectedDevices.camera && deviceInfo.hasCamera && finalVideoState
            ? selectedDevices.camera
            : undefined,
        audioSource:
          selectedDevices.microphone && deviceInfo.hasMicrophone && finalAudioState
            ? selectedDevices.microphone
            : undefined,
        resolution: "640x480",
        frameRate: 15,
        style: {
          buttonDisplayMode: "off",
          backgroundImageURI: undefined,
        },
      };

      console.log("Creating publisher with options:", publisherOptions);
      // console.log("Target element:", publisherElementRef.current);

      const publisherPromise = new Promise((resolve, reject) => {
        const publisher = OT.initPublisher(
          publisherElementRef.current,
          publisherOptions,
          (error) => {
            if (error) {
              console.error("Error creating publisher:", error);
              reject(error);
              return;
            }

            console.log("Publisher created successfully:");
            // console.log("Publisher element:", publisher.element);
            console.log(
              "Publisher video element:",
              publisher.element?.querySelector("video")
            );

            // Verify the publisher was actually added to the DOM
            if (publisherElementRef.current) {
              console.log(
                "Publisher container after creation:",
                publisherElementRef.current.innerHTML
              );
              console.log(
                "Publisher container children:",
                publisherElementRef.current.children
              );
            }

            // Style the publisher element
            if (publisher.element) {
              publisher.element.style.width = "100%";
              publisher.element.style.height = "100%";
              publisher.element.style.objectFit = "cover";
              publisher.element.style.borderRadius = "8px";

              // Find and style the video element
              const videoElement = publisher.element.querySelector("video");
              if (videoElement) {
                console.log("Found video element in publisher:", videoElement);
                videoElement.style.width = "100%";
                videoElement.style.height = "100%";
                videoElement.style.objectFit = "cover";
              } else {
                console.warn("No video element found in publisher");
              }
            } else {
              console.warn("Publisher element is null");
            }

            // Set up publisher event listeners
            publisher.on("videoEnabled", () => {
              console.log("Publisher video enabled");
              setMeetingState((prev) => ({ ...prev, video: true }));
              setParticipants((prev) =>
                prev.map((p) => (p.isLocal ? { ...p, video: true } : p))
              );
            });

            publisher.on("videoDisabled", () => {
              console.log("Publisher video disabled");
              setMeetingState((prev) => ({ ...prev, video: false }));
              setParticipants((prev) =>
                prev.map((p) => (p.isLocal ? { ...p, video: false } : p))
              );
            });

            resolve(publisher);
          }
        );
      });

      const publisher = await publisherPromise;

      // Publish the stream
      const publishPromise = new Promise((resolve, reject) => {
        session.publish(publisher, (publishError) => {
          if (publishError) {
            console.error("Error publishing stream:", publishError);
            reject(publishError);
            return;
          }

          console.log("Stream published successfully");
          resolve();
        });
      });

      await publishPromise;

      publisherRef.current = publisher;
      setIsConnecting(false);
      updateUrlForJoining(sessionId, currentToken, userName, isHost);
      setCurrentView("meeting");

      setParticipants((prev) => {
        const ids = new Set(prev.map((p) => p.id));
        const newParticipants = allConnections
          .filter(
            (conn) => conn && conn.connectionId && !ids.has(conn.connectionId)
          )
          .map((conn) => {
            let name = "Remote User";
            if (conn.data) {
              try {
                const userData = JSON.parse(conn.data);
                name = userData.name || name;
              } catch {}
            }
            return {
              id: conn.connectionId,
              name,
              isLocal: conn.connectionId === session.connection.connectionId,
              video: true,
              audio: true,
            };
          });
        return [...prev, ...newParticipants];
      });

      console.log("Meeting joined successfully");
    } catch (error) {
      console.error("Error joining meeting:", error);

      // Clean up on error
      try {
        if (sessionRef.current) {
          sessionRef.current.disconnect();
          sessionRef.current = null;
        }
        if (publisherRef.current) {
          publisherRef.current.destroy();
          publisherRef.current = null;
        }
        subscribersRef.current.clear();
      } catch (cleanupError) {
        console.warn("Error during cleanup:", cleanupError);
      }

      // Set appropriate error message
      let errorMessage = "Failed to join meeting. ";
      if (error.code === 4010 || error.name === "OT_SOCKET_CLOSE_TIMEOUT") {
        errorMessage +=
          "Connection timeout - please check your network connection and try again.";
      } else if (error.code === 1004) {
        errorMessage +=
          "Invalid session credentials. Please check your API key, session ID, and token.";
      } else if (error.code === 1006) {
        errorMessage += "Session connection failed. Please try again.";
      } else {
        errorMessage += error.message || "Please try again.";
      }

      setConnectionError(errorMessage);
      setIsConnecting(false);
      if (currentView !== "prejoin") {
        setCurrentView("prejoin");
      }
    }
  }, [
    userName,
    sessionId,
    token,
    apiKey,
    isHost,
    generateToken,
    OT,
    checkDeviceAvailability,
    updateUrlForJoining,
  ]);

  useEffect(() => {
    const handlePopState = (event) => {
      const currentPath = window.location.pathname;

      if (currentPath === "/") {
        if (sessionRef.current) {
          try {
            sessionRef.current.disconnect();
            sessionRef.current = null;
          } catch (e) {
            console.warn("Error disconnecting session on navigation:", e);
          }
        }
        if (publisherRef.current) {
          try {
            publisherRef.current.destroy();
            publisherRef.current = null;
          } catch (e) {
            console.warn("Error destroying publisher on navigation:", e);
          }
        }
        setCurrentView("landing");
      } else if (currentPath.includes("/meeting/")) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get("token");
        const urlUserName = urlParams.get("user");

        if (urlToken && urlUserName) {
          setCurrentView("meeting");
        } else {
          setCurrentView("prejoin");
        }
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Toggle functions
  const toggleVideo = async () => {
    const newVideoState = !meetingState.video;
    setMeetingState((prev) => ({ ...prev, video: newVideoState }));

    if (
      publisherRef.current &&
      typeof publisherRef.current.publishVideo === "function"
    ) {
      publisherRef.current.publishVideo(newVideoState);
    }

    setParticipants((prev) =>
      prev.map((p) => (p.isLocal ? { ...p, video: newVideoState } : p))
    );
  };

  const toggleAudio = async () => {
    const newAudioState = !meetingState.audio;
    setMeetingState((prev) => ({ ...prev, audio: newAudioState }));

    if (
      publisherRef.current &&
      typeof publisherRef.current.publishAudio === "function"
    ) {
      publisherRef.current.publishAudio(newAudioState);
    }

    setParticipants((prev) =>
      prev.map((p) => (p.isLocal ? { ...p, audio: newAudioState } : p))
    );
  };

  const stopScreenShare = () => {
    if (!sessionRef.current || !publisherRef.current) return;

    sessionRef.current.unpublish(publisherRef.current);
    publisherRef.current.destroy();
    publisherRef.current = null;

    setScreenShareState({
      isSharing: false,
      isReceiving: false,
      sharedBy: null,
      screenShareStream: null,
    });

    setMeetingState((prev) => ({ ...prev, screenShare: false }));
  };

  const toggleScreenShare = useCallback(async () => {
    if (!sessionRef.current || !OT) {
      console.error("Session or OT not available");
      return;
    }

    try {
      if (screenShareState.isSharing) {
        if (publisherRef.current) {
          sessionRef.current.unpublish(publisherRef.current);
          publisherRef.current.destroy();

          const cameraPublisher = OT.initPublisher(
            publisherElementRef.current,
            {
              insertMode: "append",
              width: "100%",
              height: "100%",
              name: userName,
              publishAudio: meetingState.audio,
              publishVideo: meetingState.video,
              videoSource: selectedDevices.camera,
              audioSource: selectedDevices.microphone,
            }
          );

          // Publish camera stream
          sessionRef.current.publish(cameraPublisher);
          publisherRef.current = cameraPublisher;

          setScreenShareState({
            isSharing: false,
            isReceiving: false,
            sharedBy: null,
            screenShareStream: null,
          });

          setMeetingState((prev) => ({ ...prev, screenShare: false }));
        }
      } else {
        try {
          const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              cursor: "always",
              displaySurface: "monitor",
            },
            audio: false,
          });

          const screenPublisher = OT.initPublisher(
            publisherElementRef.current,
            {
              insertMode: "append",
              width: "100%",
              height: "100%",
              name: userName + " (Screen)",
              publishAudio: meetingState.audio,
              publishVideo: true,
              videoSource: screenStream.getVideoTracks()[0],
              audioSource: selectedDevices.microphone,
              videoContentHint: "text", // Optimize for screen content
            },
            (error) => {
              if (error) {
                console.error("Error creating screen share publisher:", error);
                screenStream.getTracks().forEach((track) => track.stop());
                return;
              }

              // Unpublish current stream first
              if (publisherRef.current) {
                sessionRef.current.unpublish(publisherRef.current);
                publisherRef.current.destroy();
              }

              // Publish screen share
              sessionRef.current.publish(screenPublisher, (publishError) => {
                if (publishError) {
                  console.error("Error publishing screen share:", publishError);
                  screenStream.getTracks().forEach((track) => track.stop());
                  return;
                }

                publisherRef.current = screenPublisher;
                setScreenShareState((prev) => ({
                  ...prev,
                  isSharing: true,
                  sharedBy: userName,
                }));
                setMeetingState((prev) => ({ ...prev, screenShare: true }));

                // Listen for screen share end from browser UI
                screenStream
                  .getVideoTracks()[0]
                  .addEventListener("ended", () => {
                    console.log("Screen share ended by user");
                    stopScreenShare();
                  });

                screenPublisher.on("mediaStopped", (event) => {
                  console.log("Screen share media stopped", event);
                  if (event.track && event.track.kind === "video") {
                    stopScreenShare();
                  }
                });
              });
            }
          );
        } catch (displayMediaError) {
          console.error("Error getting display media:", displayMediaError);
          if (displayMediaError.name === "NotAllowedError") {
            alert(
              "Screen sharing permission denied. Please allow screen sharing and try again."
            );
          } else if (displayMediaError.name === "NotSupportedError") {
            alert("Screen sharing is not supported in this browser.");
          } else {
            alert("Failed to start screen sharing. Please try again.");
          }
        }
      }
    } catch (error) {
      console.error("Screen share error:", error);
    }
  }, [screenShareState.isSharing, meetingState, userName, selectedDevices, OT]);

  const toggleChat = () => {
    setMeetingState((prev) => ({
      ...prev,
      chat: !prev.chat,
      participants: false,
    }));
  };

  const toggleParticipants = () => {
    setMeetingState((prev) => ({
      ...prev,
      participants: !prev.participants,
      chat: false,
    }));
  };

  const takeScreenshot = useCallback(
    async (options = {}) => {
      const {
        filename = `meeting-screenshot-${new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/:/g, "-")}.png`,
        quality = 0.9,
        format = "image/png",
        method = "auto",
      } = options;

      const html2canvasScreenshot = async () => {
        if (!html2canvas) {
          throw new Error("html2canvas library not available");
        }

        const videoContainer =
          document.querySelector(".meeting-room .video-container") ||
          document.querySelector(".video-container") ||
          document.querySelector("#video-container");

        if (!videoContainer) {
          throw new Error("Video container not found");
        }

        const canvas = await html2canvas(videoContainer, {
          allowTaint: true,
          useCORS: true,
          scale: 1,
          logging: false,
          backgroundColor: "#000000",
          ignoreElements: (element) => {
            return element.classList.contains("meeting-controls");
          },
        });

        return new Promise((resolve, reject) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Failed to create screenshot"));
                return;
              }

              if (screenShotWithChat) {
                const screenshotId = `screenshot_${Date.now()}_${Math.random()
                  .toString(36)
                  .substr(2, 9)}`;

                const screenshotData = {
                  id: screenshotId,
                  blob,
                  filename,
                  timestamp: new Date().toISOString(),
                  url: URL.createObjectURL(blob),
                };

                setChatAttachments((prev) => [...prev, screenshotData]);

                const placeholderText = `📸 Screenshot attached: ${filename}`;
                setChatInput(
                  (prev) => prev + (prev ? "\n" : "") + placeholderText
                );

                setMeetingState((prev) => ({ ...prev, chat: true }));
              } else {
                downloadImage(blob, filename);
              }

              resolve({
                blob,
                filename,
                timestamp: new Date().toISOString(),
                method: "html2canvas",
              });
            },
            format,
            quality
          );
        });
      };

      const downloadImage = (blob, filename) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        link.style.display = "none";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setTimeout(() => URL.revokeObjectURL(url), 1000);
      };

      setMeetingState((prev) => ({ ...prev, screenShot: !prev.screenShot }));

      try {
        if (method === "screen-capture" || method === "auto") {
          try {
            return await html2canvasScreenshot();
          } catch (error) {
            console.warn(
              "Screen capture failed, trying element capture:",
              error.message
            );
            if (method === "screen-capture") throw error;
          }
        }
      } catch (error) {
        console.error("All screenshot methods failed:", error);
        throw error;
      }
    },
    [screenShotWithChat, setChatInput, setChatAttachments, setMeetingState]
  );

  const transferHost = async (newHostId) => {
    try {
      if (!sessionRef.current) return;

      // Send host transfer signal to all participants
      await new Promise((resolve, reject) => {
        sessionRef.current.signal(
          {
            type: "hostTransfer",
            data: JSON.stringify({
              newHostId,
              newHostName: participants.find((p) => p.id === newHostId)?.name,
              previousHost: userName,
            }),
          },
          (error) => {
            if (error) {
              console.error("Error sending host transfer signal:", error);
              reject(error);
            } else {
              console.log("Host transfer signal sent successfully");
              resolve();
            }
          }
        );
      });

      // Update local state
      setIsHost(false);
    } catch (error) {
      console.error("Error transferring host:", error);
      alert("Failed to transfer host. Please try again.");
    }
  };

  const leaveMeeting = async (newHostId = null) => {
    setShowLeaveMeetingModal(false);
    try {
      if (isHost && newHostId && sessionRef.current) {
        const newHostParticipant = participants.find((p) => p.id === newHostId);
        let newHostConnectionId = newHostId;
        
        if (newHostParticipant?.subscriber?.stream?.connection) {
          newHostConnectionId = newHostParticipant.subscriber.stream.connection.connectionId;
        }
        
        await new Promise((resolve, reject) => {
          sessionRef.current.signal(
            {
              type: "hostTransfer",
              data: JSON.stringify({
                newHostId: newHostConnectionId,
                newHostName: newHostParticipant?.name || "Unknown",
                previousHost: userName,
              }),
            },
            (error) => {
              if (error) {
                console.error("Error sending host transfer signal:", error);
                reject(error);
              } else {
                console.log("Host transfer signal sent successfully");
                resolve();
              }
            }
          );
        });
        setIsHost(false);
      }

      subscribersRef.current.forEach((subscriber, streamId) => {
        try {
          console.log("Cleaning up subscriber:", streamId);
        } catch (error) {
          console.error("Error cleaning up subscriber:", error);
        }
      });
      subscribersRef.current.clear();

      if (
        publisherRef.current &&
        typeof publisherRef.current.destroy === "function"
      ) {
        publisherRef.current.destroy();
        publisherRef.current = null;
      }

      if (
        sessionRef.current &&
        typeof sessionRef.current.disconnect === "function"
      ) {
        sessionRef.current.disconnect();
        sessionRef.current = null;
      }

      setParticipants([]);
      setChatMessages([]);
      setMeetingState({
        video: true,
        audio: true,
        screenShare: false,
        screenShot: false,
        chat: false,
        participants: false,
        reactions: false,
      });
      setConnectionError("");
      setIsConnecting(false);
      setMeetingLink("");
      setSessionId("");
      setToken("");
      setApiKey("");
      setIsHost(false);

      window.history.replaceState({}, "", "/");

      setCurrentView("landing");
      // window.location.reload();
    } catch (error) {
      console.error("Error leaving meeting:", error);
    }
  };

  const handleLeaveMeetingClick = () => {
    setShowLeaveMeetingModal(true);
  };

  const sendChatMessage = useCallback(() => {
    if (!chatInput.trim() && chatAttachments.length === 0) return;

    const messageId = Date.now().toString();
    const timestamp = new Date().toISOString();

    const hasScreenshots = chatAttachments.length > 0;

    let messageData = {
      id: messageId,
      sender: userName,
      message: chatInput.trim(),
      timestamp,
      type: hasScreenshots ? "screenshot" : "text",
    };

    if (hasScreenshots) {
      messageData.screenshots = chatAttachments.map((screenshot) => ({
        id: screenshot.id,
        filename: screenshot.filename,
        url: screenshot.url,
        timestamp: screenshot.timestamp,
      }));

      messageData.message = chatInput
        .replace(/📸 Screenshot attached: .*$/gm, "")
        .trim();
      if (!messageData.message) {
        messageData.message = `Shared ${chatAttachments.length} screenshot${
          chatAttachments.length > 1 ? "s" : ""
        }`;
      }
    }

    try {
      setChatMessages((prev) => [...prev, messageData]);

      if (sessionRef.current) {
        const signalData = {
          ...messageData,
          screenshots: messageData.screenshots || undefined,
        };

        sessionRef.current.signal(
          {
            type: "chat",
            data: JSON.stringify(signalData),
          },
          (error) => {
            if (error) {
              console.error("Error sending chat message:", error);
              setChatMessages((prev) =>
                prev.filter((msg) => msg.id !== messageId)
              );
            }
          }
        );
      }

      setChatInput("");
      setChatAttachments([]);
    } catch (error) {
      console.error("Error sending chat message:", error);
    }
  }, [
    chatInput,
    chatAttachments,
    userName,
    sessionRef,
    setChatMessages,
    setChatInput,
    setChatAttachments,
  ]);

  useEffect(() => {
    if (!sessionRef.current) return;

    const handleChatSignal = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setChatMessages((prev) => [
          ...prev,
          {
            ...msg,
            timestamp: new Date(msg.timestamp),
          },
        ]);
      } catch (e) {
        console.error("Failed to parse chat message:", e);
      }
    };

    sessionRef.current.on("signal:chat", handleChatSignal);

    return () => {
      sessionRef.current?.off("signal:chat", handleChatSignal);
    };
  }, [sessionRef.current]);

  const copyMeetingLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(meetingLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  }, [meetingLink]);

  useEffect(() => {
    if (propSessionId) setSessionId(propSessionId);
    if (propToken) setToken(propToken);
    if (propApiKey) setApiKey(propApiKey);
    if (propMeetingUrl) setMeetingLink(propMeetingUrl);
    if (propIsHost !== undefined) setIsHost(propIsHost);
  }, [propSessionId, propToken, propApiKey, propMeetingUrl, propIsHost]);

  useEffect(() => {
    const path = window.location.pathname;
    const parts = path.split("/");
    const sessionIdFromUrl = parts.length > 2 ? parts[2] : null;

    if (sessionIdFromUrl) {
      setMeetingLink(path);
      setSessionId(sessionIdFromUrl);
      setCurrentView("landing");
    } else {
      setCurrentView("landing");
    }
  }, []);

  const getInitials = (name) => {
    if (!name) return "";
    const words = name.trim().split(/\s+/).slice(0, 2);
    return words.map((n) => n[0]).join("").toUpperCase();
  };

  // Landing Page
  if (currentView === "landing") {
    return (
      <LandingPage
        iconComponents={iconComponents}
        setCurrentView={setCurrentView}
        setMeetingLink={setMeetingLink}
        meetingLink={meetingLink}
        themeColors={themeColors}
        createMeeting={createMeeting}
        extractSessionIdFromUrl={extractSessionIdFromUrl}
        setSessionId={setSessionId}
        setIsHost={setIsHost}
        customStyle={landingPageStyle}
        customText={landingPageText}
      />
    );
  }

  // Pre-join Screen
  if (currentView === "prejoin" || meetingLink === window.location.pathname) {
    return (
      <PrejoinPage
        iconComponents={iconComponents}
        userName={userName}
        setUserName={setUserName}
        devices={devices}
        selectedDevices={selectedDevices}
        setSelectedDevices={setSelectedDevices}
        previewEnabled={previewEnabled}
        setPreviewEnabled={setPreviewEnabled}
        joinMeeting={joinMeeting}
        isConnecting={isConnecting}
        connectionError={connectionError}
        previewRef={previewRef}
        getInitials={getInitials}
        isHost={isHost}
        meetingLink={meetingLink}
        copyMeetingLink={copyMeetingLink}
        linkCopied={linkCopied}
        customStyle={preJoinPageStyle}
        customText={preJoinPageText}
      />
    );
  }

  // Meeting Room
  return (
    <MeetingRoomPage
      copyMeetingLink={copyMeetingLink}
      linkCopied={linkCopied}
      iconComponents={iconComponents}
      participants={participants}
      publisherElementRef={publisherElementRef}
      meetingState={meetingState}
      getInitials={getInitials}
      setMeetingState={setMeetingState}
      userName={userName}
      chatMessages={chatMessages}
      chatInput={chatInput}
      sendChatMessage={sendChatMessage}
      setChatInput={setChatInput}
      toggleAudio={toggleAudio}
      toggleChat={toggleChat}
      hasCamera={devices.cameras?.length > 0 || false}
      hasMicrophone={devices.microphones?.length > 0 || false}
      toggleParticipants={toggleParticipants}
      toggleScreenShare={toggleScreenShare}
      takeScreenshot={takeScreenshot}
      toggleVideo={toggleVideo}
      leaveMeeting={leaveMeeting}
      reactions={reactions}
      showReactionPicker={showReactionPicker}
      setShowReactionPicker={setShowReactionPicker}
      sendReaction={sendReaction}
      availableEmojis={availableEmojis}
      screenShareState={screenShareState}
      reactionButtonRef={reactionButtonRef}
      isHost={isHost}
      handleLeaveMeetingClick={handleLeaveMeetingClick}
      showLeaveMeetingModal={showLeaveMeetingModal}
      setShowLeaveMeetingModal={setShowLeaveMeetingModal}
      transferHost={transferHost}
      screenShotWithChat={screenShotWithChat}
      chatAttachments={chatAttachments}
      setChatAttachments={setChatAttachments}
    />
  );
};

export default VonageVideoMeeting;
