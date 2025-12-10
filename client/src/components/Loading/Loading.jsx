import React from 'react';
import './Loading.css';

// Main loading spinner with gaming theme
export const GameSpinner = ({ size = 'medium', text = null }) => {
  return (
    <div className={`game-spinner-container ${size}`}>
      <div className="game-spinner">
        <div className="spinner-core">
          <div className="spinner-ring ring-1"></div>
          <div className="spinner-ring ring-2"></div>
          <div className="spinner-ring ring-3"></div>
          <div className="spinner-center">
            <div className="pulse-core"></div>
          </div>
        </div>
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

// Skeleton loader for cards and content
export const SkeletonLoader = ({ type = 'card', count = 1 }) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === 'card') {
    return (
      <div className="skeleton-container">
        {items.map((i) => (
          <div key={i} className="skeleton-card">
            <div className="skeleton-image"></div>
            <div className="skeleton-content">
              <div className="skeleton-title"></div>
              <div className="skeleton-subtitle"></div>
              <div className="skeleton-description">
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
              </div>
              <div className="skeleton-footer">
                <div className="skeleton-price"></div>
                <div className="skeleton-badge"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="skeleton-list">
        {items.map((i) => (
          <div key={i} className="skeleton-list-item">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-list-content">
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

// Progress bar loader
export const ProgressLoader = ({ progress = 0, text = null }) => {
  return (
    <div className="progress-loader">
      <div className="progress-container">
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }}>
            <div className="progress-glow"></div>
          </div>
        </div>
        <div className="progress-particles">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`particle particle-${i + 1}`}></div>
          ))}
        </div>
      </div>
      {text && (
        <div className="progress-info">
          <span className="progress-text">{text}</span>
          <span className="progress-value">{progress}%</span>
        </div>
      )}
    </div>
  );
};

// Inline loading indicator
export const InlineLoader = ({ text = 'Loading' }) => {
  return (
    <span className="inline-loader">
      <span className="inline-spinner">
        <span className="dot dot-1"></span>
        <span className="dot dot-2"></span>
        <span className="dot dot-3"></span>
      </span>
      <span className="inline-text">{text}</span>
    </span>
  );
};

// Full page loader
export const PageLoader = ({ message = 'Loading' }) => {
  return (
    <div className="page-loader-wrapper">
      <div className="page-loader-backdrop"></div>
      <div className="page-loader-content">
        <div className="cyber-grid">
          <div className="grid-line"></div>
          <div className="grid-line"></div>
          <div className="grid-line"></div>
        </div>
        <GameSpinner size="large" text={message} />
      </div>
    </div>
  );
};

// Button loading state
export const ButtonLoader = ({ color = 'white' }) => {
  return (
    <div className={`button-loader ${color}`}>
      <span className="button-spinner"></span>
    </div>
  );
};