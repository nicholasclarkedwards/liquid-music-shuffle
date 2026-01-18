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
  onChange, 
  placeholder = "Select..." 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayValue = value || options[0];

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
        className={`glass-input-container w-full px-4 flex items-center justify-between transition-all duration-300 ${isOpen ? 'ring-1 ring-blue-500/30' : ''}`}
      >
        <span className={`text-[13px] font-medium tracking-tight ${value ? 'text-white' : 'text-white/40'}`}>
          {displayValue}
        </span>
        <svg 
          className={`w-2.5 h-2.5 transition-transform duration-500 ${isOpen ? 'rotate-180 opacity-100' : 'opacity-20'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      <div 
        className={`absolute top-[115%] left-0 right-0 z-[100] rounded-[1.5rem] bg-black/60 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-500 origin-top ${
          isOpen 
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto bubbly-pop' 
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
      >
        <div className="max-h-[180px] overflow-y-auto custom-glass-scrollbar py-2">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              className={`w-full text-left px-5 h-[38px] flex items-center text-[11px] font-bold transition-all uppercase tracking-wider ${
                (value === option || (!value && option === "Any"))
                  ? 'text-blue-400 bg-white/[0.05]'
                  : 'text-white/70 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              {option}
              {(value === option || (!value && option === "Any")) && (
                <div className="ml-auto w-1 h-1 bg-blue-400 rounded-full"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CustomDropdown;