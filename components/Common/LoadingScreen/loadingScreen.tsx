
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

interface LoadingScreenProps {
  isComplete: boolean;
  progress: { current: number; total: number };
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ isComplete, progress }) => {
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

  const progressPercent = progress.total > 0 
    ? Math.round((progress.current / progress.total) * 100) 
    : 0;

  return (
    <div className={`loading-overlay ${isComplete ? 'is-complete' : ''}`}>
      <div className="loading-container">
        <div className="loading-text-group">
          <h1 className="loading-title">Liquid Shuffle</h1>
          <div className="loading-status-container" style={{ opacity: fade ? 0.6 : 0 }}>
            <p className="loading-status-text">{MESSAGES[msgIndex]}</p>
          </div>
          
          {progress.total > 0 && (
            <div className="mt-10 flex flex-col items-center gap-4 w-64 animate-fade-in">
              <div className="flex justify-between w-full">
                <p className="text-[10px] font-black text-white/40 tracking-[0.2em] uppercase">
                  Hydrating Library
                </p>
                <p className="text-[10px] font-black text-blue-400 tracking-[0.1em]">
                  {progress.current} / {progress.total}
                </p>
              </div>
              <div className="w-full h-[2px] bg-white/5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 shadow-[0_0_15px_rgba(59,130,246,0.6)] transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
