import React from 'react';

const ChatDebug = () => {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>Chat Debug Page</h1>
      <p>If you can see this, the route is working!</p>
      <p>Current URL: {window.location.href}</p>
      <p>Time: {new Date().toISOString()}</p>
    </div>
  );
};

export default ChatDebug;