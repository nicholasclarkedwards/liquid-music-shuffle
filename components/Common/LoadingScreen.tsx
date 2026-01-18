import React, { useState, useEffect } from 'react';

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
    <div className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center bg-[#040406] transition-opacity duration-1000 ease-in-out ${isComplete ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
      <div className="relative flex flex-col items-center gap-10">
        {/* Animated Abstract Core */}
        <div className="relative w-24 h-24">
          <div className="absolute inset-0 border-[3px] border-blue-500/20 rounded-full animate-[ping_3s_linear_infinite]"></div>
          <div className="absolute inset-0 border-[3px] border-indigo-500/10 rounded-full animate-[ping_3s_linear_infinite_1s]"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 blur-sm animate-pulse"></div>
          </div>
          <svg className="absolute inset-0 w-full h-full animate-[spin_8s_linear_infinite]" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="0.5" strokeDasharray="1 10" />
          </svg>
        </div>

        <div className="flex flex-col items-center gap-2">
          <h1 className="text-white font-black text-2xl tracking-tighter uppercase italic">Liquid Shuffle</h1>
          <div className={`transition-opacity duration-500 min-h-[1.5rem] ${fade ? 'opacity-40' : 'opacity-0'}`}>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-blue-400">{MESSAGES[msgIndex]}</p>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-12 left-0 right-0 flex justify-center">
        <div className="flex gap-1.5">
          <div className="w-1 h-1 bg-white/20 rounded-full animate-bounce"></div>
          <div className="w-1 h-1 bg-white/20 rounded-full animate-bounce [animation-delay:0.2s]"></div>
          <div className="w-1 h-1 bg-white/20 rounded-full animate-bounce [animation-delay:0.4s]"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;