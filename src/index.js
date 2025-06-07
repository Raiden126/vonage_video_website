import React from 'react';
import ReactDOM from 'react-dom/client';
import VonageVideoMeeting from './VonageVideoMeeting.jsx';
import './index.css';

// React Component Export
// export { default as VonageVideoMeeting } from './VonageVideoMeeting';

// Web Component Class for vanilla JS, Angular, Vue
class VonageVideoMeetingElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.reactRoot = null;
  }

  static get observedAttributes() {
    return [
      'api-key',
      'session-id', 
      'token',
      'username',
      'is-host',
      'meeting-url',
      'icons',
      'theme',
      'landing-page-style',
      'pre-join-page-style',
      'screenshot-with-chat'
    ];
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {
    if (this.reactRoot) {
      this.reactRoot.unmount();
    }
  }

  attributeChangedCallback() {
    if (this.isConnected) {
      this.render();
    }
  }

  getProps() {
    return {
      apiKey: this.getAttribute('api-key') || '',
      sessionId: this.getAttribute('session-id') || '',
      token: this.getAttribute('token') || '',
      username: this.getAttribute('username') || '',
      isHost: this.getAttribute('is-host') === 'true',
      meetingUrl: this.getAttribute('meeting-url') || '',
      icons: this.getAttribute('icons') ? JSON.parse(this.getAttribute('icons')) : {},
      theme: this.getAttribute('theme') ? JSON.parse(this.getAttribute('theme')) : {},
      landingPageStyle: this.getAttribute('landing-page-style') ? JSON.parse(this.getAttribute('landing-page-style')) : {},
      preJoinPageStyle: this.getAttribute('pre-join-page-style') ? JSON.parse(this.getAttribute('pre-join-page-style')) : {},
      screenShotWithChat: this.getAttribute('screenshot-with-chat') === 'true',
      createMeeting: this.createMeeting?.bind(this),
      generateToken: this.generateToken?.bind(this),
      extractSessionIdFromUrl: this.extractSessionIdFromUrl?.bind(this)
    };
  }

  // Default implementations - can be overridden
  async createMeeting(userData) {
    console.warn('createMeeting not implemented. Please set this.createMeeting');
    throw new Error('createMeeting method not implemented');
  }

  async generateToken(sessionId, userData, userType = 'publisher') {
    console.warn('generateToken not implemented. Please set this.generateToken');
    throw new Error('generateToken method not implemented');
  }

  extractSessionIdFromUrl(url) {
    try {
      const match = url.match(/\/meeting\/(.+)$/);
      return match ? match[1] : null;
    } catch (error) {
      console.error('Error extracting session ID from URL:', error);
      return null;
    }
  }

  render() {
    // Create container div
    const container = document.createElement('div');
    container.style.width = '100%';
    container.style.height = '100%';
    
    // Add Tailwind CSS
    const tailwindLink = document.createElement('link');
    tailwindLink.rel = 'stylesheet';
    tailwindLink.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
    
    // Clear shadow DOM and add new content
    this.shadowRoot.innerHTML = '';
    this.shadowRoot.appendChild(tailwindLink);
    this.shadowRoot.appendChild(container);

    // Create React root and render
    if (this.reactRoot) {
      this.reactRoot.unmount();
    }
    
    this.reactRoot = ReactDOM.createRoot(container);
    this.reactRoot.render(React.createElement(VonageVideoMeeting, this.getProps()));
  }

  // Public methods for external control
  setApiKey(apiKey) {
    this.setAttribute('api-key', apiKey);
  }

  setSessionId(sessionId) {
    this.setAttribute('session-id', sessionId);
  }

  setToken(token) {
    this.setAttribute('token', token);
  }

  setUsername(username) {
    this.setAttribute('username', username);
  }

  setIsHost(isHost) {
    this.setAttribute('is-host', isHost.toString());
  }

  setMeetingUrl(meetingUrl) {
    this.setAttribute('meeting-url', meetingUrl);
  }
}

// Register the custom element
if (typeof window !== 'undefined' && window.customElements) {
  customElements.define('vonage-video-meeting', VonageVideoMeetingElement);
}

// Export for manual registration
export { VonageVideoMeetingElement, VonageVideoMeeting };

// Default export
// export default VonageVideoMeeting;