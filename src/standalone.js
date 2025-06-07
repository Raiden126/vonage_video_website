import React from 'react';
import ReactDOM from 'react-dom/client';
import { VonageVideoMeetingElement, VonageVideoMeeting } from './index';

// Register the web component
if (typeof window !== 'undefined' && window.customElements && !customElements.get('vonage-video-meeting')) {
  customElements.define('vonage-video-meeting', VonageVideoMeetingElement);
}

// Global API for vanilla JavaScript
window.VonageVideoMeeting = {
  React: VonageVideoMeeting,
  WebComponent: VonageVideoMeetingElement,
  
  // Helper to create and mount React component
  mount: (element, props) => {
    const root = ReactDOM.createRoot(element);
    root.render(React.createElement(VonageVideoMeeting, props));
    return root;
  },

  // Helper to create web component programmatically
  createElement: (props = {}) => {
    const element = document.createElement('vonage-video-meeting');
    
    // Set attributes from props
    Object.keys(props).forEach(key => {
      const attrName = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      const value = props[key];
      
      if (typeof value === 'object') {
        element.setAttribute(attrName, JSON.stringify(value));
      } else {
        element.setAttribute(attrName, value.toString());
      }
    });

    return element;
  }
};