import React, { useEffect, useState } from 'react';
import { CheckCircle, Check, X } from 'lucide-react';
import './SuccessPopup.css';

const SuccessPopup = ({ 
  isOpen, 
  onClose, 
  title = 'Success!', 
  message = 'Operation completed successfully',
  autoClose = true,
  autoCloseDelay = 3000,
  variant = 'success' // success, error, warning, info
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure animation plays
      setTimeout(() => setIsVisible(true), 10);
      
      // Auto close functionality
      if (autoClose) {
        const timer = setTimeout(() => {
          setIsClosing(true);
          setTimeout(() => {
            setIsVisible(false);
            setIsClosing(false);
            onClose?.();
          }, 300);
        }, autoCloseDelay);
        
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, autoClose, autoCloseDelay]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      setIsClosing(false);
      onClose?.();
    }, 300);
  };

  if (!isOpen && !isVisible) return null;

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return (
          <div className="popup-icon-wrapper success">
            <div className="popup-icon-glow"></div>
            <CheckCircle size={48} />
            <div className="popup-icon-check">
              <Check size={24} />
            </div>
          </div>
        );
      default:
        return (
          <div className="popup-icon-wrapper">
            <CheckCircle size={48} />
          </div>
        );
    }
  };

  return (
    <div className={`success-popup-overlay ${isVisible ? 'visible' : ''} ${isClosing ? 'closing' : ''}`}>
      <div className={`success-popup ${isVisible ? 'visible' : ''} ${isClosing ? 'closing' : ''}`}>
        {/* Animated Background Effects */}
        <div className="popup-bg-effects">
          <div className="popup-gradient-orb orb-1"></div>
          <div className="popup-gradient-orb orb-2"></div>
          <div className="popup-gradient-orb orb-3"></div>
        </div>

        {/* Close Button */}
        {!autoClose && (
          <button className="popup-close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        )}

        {/* Content */}
        <div className="popup-content">
          {/* Icon with Animation */}
          {getIcon()}

          {/* Text Content */}
          <h3 className="popup-title">{title}</h3>
          <p className="popup-message">{message}</p>

          {/* Success Particles */}
          <div className="popup-particles">
            <span className="particle"></span>
            <span className="particle"></span>
            <span className="particle"></span>
            <span className="particle"></span>
            <span className="particle"></span>
            <span className="particle"></span>
          </div>
        </div>

        {/* Progress Bar for Auto Close */}
        {autoClose && (
          <div className="popup-progress-bar">
            <div 
              className="popup-progress-fill" 
              style={{ animationDuration: `${autoCloseDelay}ms` }}
            ></div>
          </div>
        )}

        {/* Gaming-style Decorative Corners */}
        <div className="popup-corner top-left"></div>
        <div className="popup-corner top-right"></div>
        <div className="popup-corner bottom-left"></div>
        <div className="popup-corner bottom-right"></div>
      </div>
    </div>
  );
};

export default SuccessPopup;