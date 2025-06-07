# Vonage Video Meeting Widget

A cross-platform video meeting widget powered by [Vonage Video API](https://www.vonage.com/communications-apis/video/), compatible with **React**, **Vue**, **Angular**, and **vanilla HTML/JavaScript**. Easily add live video, screen sharing, chat, reactions, and more to your app.

---

## ✨ Features

- ✅ **Framework Agnostic**: Works with React, Angular, Vue, and plain HTML/JS
- 💻 **Fully Featured**: Video, audio, screen sharing, chat, emojis, device selection, participant list
- 🎨 **Customizable**: Easily theme and style via Tailwind CSS, CSS modules, or plain CSS classes
- ⚙️ **Easy to Integrate**: Use as a React component or Web Component
- 🌐 **CDN Support**: Load directly via script tag

---

## 📦 Installation

```bash
npm install vonage-video-meeting-widget
```

## Quick Start

### React

```jsx
import { useState } from 'react';
import { VonageVideoMeeting } from 'vonage-video-meeting-widget';
import 'vonage-video-meeting-widget/dist/styles.css'; // optional default styles

function App() {
  const [apiKey, setApiKey] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [token, setToken] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState('');

  const createMeeting = async (userData) => {
    const res = await fetch("/api/create-meeting", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userData }),
    });
    const data = await res.json();
    setSessionId(data.sessionId);
    setMeetingUrl(data.meetingUrl);
    setIsHost(true);
    return data;
  };

  const generateToken = async (sessionId, userData, userType = "publisher") => {
    const res = await fetch("/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, userData, userType }),
    });
    const data = await res.json();
    setApiKey(data.apiKey);
    setToken(data.token);
    return data;
  };

  const extractSessionIdFromUrl = (url) => {
    try {
      const match = url.match(/\/meeting\/(.+)$/);
      return match ? match[1] : null;
    } catch (error) {
      console.error("Error extracting session ID from URL:", error);
      return null;
    }
  };

  return (
    <VonageVideoMeeting
      apiKey={apiKey}
      sessionId={sessionId}
      token={token}
      isHost={isHost}
      meetingUrl={meetingUrl}
      createMeeting={createMeeting}
      generateToken={generateToken}
      extractSessionIdFromUrl={extractSessionIdFromUrl}
      screenShotWithChat={true}
    />
  );
}
```

### Angular

```typescript
// app.module.ts
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import 'vonage-video-meeting-widget/dist/vonage-video-meeting.umd.js';

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA], // Needed to use web component
})
export class AppModule {}

<!-- app.component.html -->
<vonage-video-meeting
  api-key="your-api-key"
  session-id="your-session-id"
  token="your-token"
  is-host="true"
  meeting-url="https://example.com/meeting/123"
></vonage-video-meeting>
```

### Vue

```vue
<template>
  <vonage-video-meeting
    api-key="your-api-key"
    session-id="your-session-id"
    token="your-token"
    is-host="true"
    meeting-url="https://example.com/meeting/123"
  />
</template>

<script setup>
import 'vonage-video-meeting-widget/dist/vonage-video-meeting.umd.js';
</script>
```

### Vanilla HTML / Javascript

```html
<!DOCTYPE html>
<html>
  <head>
    <script src="https://unpkg.com/vonage-video-meeting-widget/dist/vonage-video-meeting.umd.js"></script>
  </head>
  <body>
    <vonage-video-meeting
      api-key=""
      session-id=""
      token=""
      is-host="true"
      meeting-url="https://example.com/meeting/123"
    ></vonage-video-meeting>

    <script>
      const widget = document.querySelector('vonage-video-meeting');
      widget.setFunctions({
        createMeeting: async (userData) => {
          const res = await fetch('/api/create-meeting', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userData }),
          });
          return await res.json();
        },
        generateToken: async (sessionId, userData) => {
          const res = await fetch('/api/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId, userData }),
          });
          return await res.json();
        },
        extractSessionIdFromUrl: (url) => {
          const match = url.match(/\/meeting\/(.+)$/);
          return match ? match[1] : null;
        }
      });
    </script>
  </body>
</html>
```
## API Reference

### Props/Attributes

| Property | Type | Description |
|----------|------|-------------|
| `apiKey` | string | Vonage API key |
| `sessionId` | string | Meeting session ID |
| `token` | string | User authentication token |
| `username` | string | User's display name |
| `isHost` | boolean | Whether user is meeting host |
| `meetingUrl` | string | Meeting URL |
| `createMeeting` | function | Function to create a new meeting |
| `generateToken` | function | Function to generate a token |
| `extractSessionIdFromUrl` | function | Helper to extract sessionId from URL |
| `screenShotWithChat` | boolean | Enable screenshot with chat |
| `icons` | object | Custom icon configuration |
| `theme` | object | Custom theme configuration |
| `landingPageStyle` | object | Landing page styling |
| `preJoinPageStyle` | object | Pre-join page styling |
| `landingPageText` | object | Landing page customize text |
| `preJoinPageText` | object | Pre-join page customize text |

## Styling Options

### You can style the widget using:

## Tailwind CSS(Recommended)

### Pass a style object like:

```
landingPageStyle={
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
}

const preJoinPageStyling = {
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
```

## Regular CSS Classes

### If you don’t use Tailwind, define your own CSS classes:

```
/* custom.css */
.my-landing-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  background-color: #f3f4f6;
}
.my-heading {
  font-size: 2rem;
  color: #111827;
}
```
### Then pass them as props:
```
landingPageStyle={
  container: "my-landing-container",
  heading: "my-heading",
  ...
}

preJoinPageStyling={
    container: "my-prejoin-container",
    heading: "my-heading"
    ...
}
```
## Customize Text

### You can customize the text:

```
landingPageText={
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
}

const preJoinPageText = {
    heading: "Join Your Meeting",
    subheading: "Check your settings before joining",
    displayNameLabel: "Display Name",
    displayNamePlaceholder: "Enter your name",
    shareLinkLabel: "Share Meeting Link",
    shareLinkNote: "Share this link with participants to join your meeting",
    copyButton: "Copy",
    copiedText: "Copied!",
    joinButtonHost: "Start Meeting",
    joinButtonGuest: "Join Meeting",
    joiningButton: "Joining...",
    cameraOffText: "Camera Off",
    toggleCameraLabel: "Toggle Camera",
    toggleMicLabel: "Toggle Microphone",
    selectCameraLabel: "Camera",
    selectMicLabel: "Microphone",
    errorConnection: "",
};
```

## Icons

### To override icons, pass a map of Lucide icons or any React icons:

```
import { Video, Mic, MessageSquare } from "lucide-react";

const icons = {
  video: Video,
  mic: Mic,
  chat: MessageSquare,
  ...
};
```

## Theme Customization

```
const theme = {
  primary: "#3B82F6",
  secondary: "#1F2937",
  success: "#10B981",
  danger: "#EF4444",
  background: "#F9FAFB",
  surface: "#FFFFFF",
  text: "#111827",
  textSecondary: "#6B7280",
};
```

## License

### ISC © 2025 Guddu Shakar Paul