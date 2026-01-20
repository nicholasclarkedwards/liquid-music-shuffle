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
        className={`glass-input-container w-full px-5 flex items-center justify-between transition-all duration-500 ${isOpen ? 'bg-white/[0.1] border-white/30' : ''}`}
      >
        <span className={`text-[12px] font-bold tracking-tight ${value && value !== 'Any' ? 'text-white' : 'text-white/40'}`}>
          {displayValue}
        </span>
        <svg 
          className={`w-2.5 h-2.5 transition-all duration-500 ${isOpen ? 'rotate-180 opacity-100' : 'opacity-20'}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Menu - Light Cohesive Glass */}
      <div 
        className={`absolute top-[120%] left-0 right-0 z-[9999] rounded-[1.5rem] liquid-menu-base overflow-hidden transition-all duration-400 origin-top ${
          isOpen 
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
        }`}
        style={{ 
          transitionTimingFunction: isOpen 
            ? 'cubic-bezier(0.2, 0.8, 0.2, 1)' 
            : 'cubic-bezier(0.19, 1, 0.22, 1)' 
        }}
      >
        <div className="max-h-[220px] overflow-y-auto custom-glass-scrollbar">
          {options.map((option) => {
            const isSelected = (value === option || (!value && option === "Any"));
            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-5 h-[42px] flex items-center text-[10px] font-black transition-all tracking-[0.15em] uppercase dropdown-item ${
                  isSelected ? 'dropdown-item-selected' : ''
                }`}
              >
                {option === "Any" ? "Any" : option}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CustomDropdown;