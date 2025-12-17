import React, { useState } from 'react';
import SuccessPopup from '../components/SuccessPopup/SuccessPopup';
import './TestSuccessPopup.css';

const TestSuccessPopup = () => {
  const [showBasicPopup, setShowBasicPopup] = useState(false);
  const [showAutoClosePopup, setShowAutoClosePopup] = useState(false);
  const [showCustomPopup, setShowCustomPopup] = useState(false);
  const [showLongMessagePopup, setShowLongMessagePopup] = useState(false);

  return (
    <div className="test-popup-page">
      <div className="test-container">
        <h1>Success Popup Test Page</h1>
        <p>Test different configurations of the Success Popup component</p>
        
        <div className="test-buttons">
          {/* Basic Popup */}
          <button
            className="test-btn primary"
            onClick={() => setShowBasicPopup(true)}
          >
            Basic Success Popup
          </button>
          
          {/* Auto Close Popup */}
          <button
            className="test-btn secondary"
            onClick={() => setShowAutoClosePopup(true)}
          >
            Auto-Close Popup (3s)
          </button>
          
          {/* Custom Message Popup */}
          <button
            className="test-btn accent"
            onClick={() => setShowCustomPopup(true)}
          >
            Custom Message Popup
          </button>
          
          {/* Long Message Popup */}
          <button
            className="test-btn gradient"
            onClick={() => setShowLongMessagePopup(true)}
          >
            Long Message Popup
          </button>
        </div>
        
        {/* Test Results */}
        <div className="test-results">
          <h2>Component Features:</h2>
          <ul>
            <li>✨ Beautiful gaming-themed design with gradient backgrounds</li>
            <li>🎮 Animated icon with bounce effect and glow</li>
            <li>🌟 Particle effects on success</li>
            <li>⏱️ Auto-close with progress bar</li>
            <li>🎯 Gaming-style corner decorations</li>
            <li>📱 Fully responsive design</li>
            <li>🌙 Dark/Light mode support</li>
            <li>🔄 RTL language support</li>
          </ul>
        </div>
      </div>

      {/* Basic Popup */}
      <SuccessPopup
        isOpen={showBasicPopup}
        onClose={() => setShowBasicPopup(false)}
        autoClose={false}
      />

      {/* Auto Close Popup */}
      <SuccessPopup
        isOpen={showAutoClosePopup}
        onClose={() => setShowAutoClosePopup(false)}
        title="Profile Updated!"
        message="Your changes have been saved successfully."
        autoClose={true}
        autoCloseDelay={3000}
      />

      {/* Custom Message Popup */}
      <SuccessPopup
        isOpen={showCustomPopup}
        onClose={() => setShowCustomPopup(false)}
        title="Welcome to GamersStation!"
        message="Your profile is now complete. Start exploring amazing gaming products!"
        autoClose={true}
        autoCloseDelay={4000}
      />

      {/* Long Message Popup */}
      <SuccessPopup
        isOpen={showLongMessagePopup}
        onClose={() => setShowLongMessagePopup(false)}
        title="Achievement Unlocked!"
        message="Congratulations! You've successfully updated your profile and unlocked new features. You can now browse products, message sellers, and much more!"
        autoClose={true}
        autoCloseDelay={5000}
      />
    </div>
  );
};

export default TestSuccessPopup;