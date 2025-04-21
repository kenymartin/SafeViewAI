import React from 'react';

const SimpleTest: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      width: '100vw',
      background: 'transparent',
      color: 'white',
      fontSize: '4rem',
      fontWeight: 'bold',
      textShadow: '0 0 10px rgba(0,0,0,0.5)',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999
    }}>
      Hello World
    </div>
  );
};

export default SimpleTest; 