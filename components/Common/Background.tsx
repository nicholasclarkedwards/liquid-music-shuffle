
import React from 'react';

const Background: React.FC = () => {
  return (
    <>
      <div className="fixed top-[-10%] left-[-5%] w-[60%] h-[60%] bg-blue-600/15 blur-[180px] rounded-full -z-10 animate-[pulse_12s_infinite]"></div>
      <div className="fixed bottom-[-10%] right-[-5%] w-[60%] h-[60%] bg-indigo-600/15 blur-[180px] rounded-full -z-10 animate-[pulse_18s_infinite]"></div>
      <div className="fixed top-[25%] left-[30%] w-[40%] h-[40%] bg-purple-600/10 blur-[150px] rounded-full -z-10"></div>
    </>
  );
};

export default Background;
