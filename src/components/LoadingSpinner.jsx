import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-container">
      <div className="cool-spinner"></div>
      <p>{message}</p>
    </div>
  );
};

export default LoadingSpinner;
