import React, { useState, useEffect } from 'react';
import './loadingScreen.css';

const MESSAGES = [
  "Tuning the virtual strings...",
  "Dusting off the B-sides...",
  "Consulting the oracle of vinyl...",
  "Ignoring the critics...",
  "Calculating hipness quotient...",
  "Aligning the speakers...",
  "Pre-heating the tubes...",
  "Negotiating with the algorithm...",
  "Loading that one song you skip every time...",
  "Searching for hidden tracks...",
  "Polishing the digital gold...",
  "Checking for pitch perfection...",
  "Calibrating the bass drop...",
  "Waking up the drummer...",
  "Organizing the record collection by vibe..."
];

const LoadingScreen: React.FC<{ isComplete: boolean }> = ({ isComplete }) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
        setFade(true);
      }, 500);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`loading-overlay ${isComplete ? 'is-complete' : ''}`}>
      <div className="loading-container">
        <div className="loading-orb-wrapper">
          <div className="loading-orb-ring loading-orb-ring-1"></div>
          <div className="loading-orb-ring loading-orb-ring-2"></div>
          <div className="loading-orb-core-container">
            <div className="loading-orb-core"></div>
          </div>
          <svg className="loading-orb-svg" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="1 10" />
          </svg>
        </div>

        <div className="loading-text-group">
          <h1 className="loading-title">Liquid Shuffle</h1>
          <div className="loading-status-container" style={{ opacity: fade ? 0.4 : 0 }}>
            <p className="loading-status-text">{MESSAGES[msgIndex]}</p>
          </div>
        </div>
      </div>
      
      <div className="loading-footer">
        <div className="loading-dots-wrapper">
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;