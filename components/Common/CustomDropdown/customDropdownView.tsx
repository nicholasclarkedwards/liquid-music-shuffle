import React from 'react';
import { CustomDropdownProps } from './customDropdownProps';

interface CustomDropdownViewProps extends CustomDropdownProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
  handleSelect: (option: string) => void;
}

const CustomDropdownView: React.FC<CustomDropdownViewProps> = ({ 
  options, 
  value, 
  isOpen, 
  setIsOpen, 
  containerRef, 
  handleSelect 
}) => {
  const displayValue = value || "Any";
  const hasValue = value && value !== 'Any';

  return (
    <div className="dropdown-container" ref={containerRef}>
      {/* Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`glass-input-container dropdown-trigger ${isOpen ? 'is-active is-active' : ''}`}
      >
        <span className={`dropdown-value ${hasValue ? 'has-selection' : ''}`}>
          {displayValue}
        </span>
        <svg 
          className="dropdown-arrow" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Menu - Light Cohesive Glass */}
      <div 
        className={`liquid-menu-base dropdown-menu-wrapper ${isOpen ? 'is-open' : ''}`}
        style={{ 
          transitionTimingFunction: isOpen 
            ? 'cubic-bezier(0.2, 0.8, 0.2, 1)' 
            : 'cubic-bezier(0.19, 1, 0.22, 1)' 
        }}
      >
        <div className="dropdown-scroll-area custom-glass-scrollbar">
          {options.map((option) => {
            const isSelected = (value === option || (!value && option === "Any"));
            return (
              <button
                key={option}
                onClick={() => handleSelect(option)}
                className={`dropdown-option dropdown-item ${isSelected ? 'dropdown-item-selected' : ''}`}
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

export default CustomDropdownView;
