import React, { useState, useRef, useEffect } from 'react';

interface CustomDropdownProps {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ 
  options, 
  value, 
  onChange 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayValue = value || "Any";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: string) => {
    onChange(option === "Any" ? "" : option);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`glass-input-container w-full px-5 flex items-center justify-between transition-all duration-500 ${isOpen ? 'bg-white/[0.08] border-white/20' : ''}`}
      >
        <span className={`text-[12px] font-bold tracking-tight ${value && value !== 'Any' ? 'text-white' : 'text-white/45'}`}>
          {displayValue}
        </span>
        <svg 
          className={`w-2.5 h-2.5 transition-all duration-500 ${isOpen ? 'rotate-180 opacity-100 text-blue-400' : 'opacity-20 text-white'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Menu */}
      <div 
        className={`absolute top-[120%] left-0 right-0 z-[100] rounded-[1.5rem] bg-black/45 backdrop-blur-[60px] saturate-[220%] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.7)] overflow-hidden transition-all duration-500 origin-top ${
          isOpen 
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto bubbly-pop' 
            : 'opacity-0 scale-95 -translate-y-3 pointer-events-none'
        }`}
      >
        <div className="max-h-[200px] overflow-y-auto custom-glass-scrollbar py-2.5">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className={`w-full text-left px-6 h-[40px] flex items-center text-[10px] font-black transition-all tracking-[0.2em] ${
                (value === option || (!value && option === "Any"))
                  ? 'text-blue-400 bg-white/[0.06]'
                  : 'text-white/40 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              {option === "Any" ? "Any" : option}
              {(value === option || (!value && option === "Any")) && (
                <div className="ml-auto w-1.5 h-1.5 bg-blue-400 rounded-full shadow-[0_0_12px_rgba(96,165,250,0.8)]"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomDropdown;