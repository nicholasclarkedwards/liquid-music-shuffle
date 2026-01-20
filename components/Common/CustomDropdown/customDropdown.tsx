import React, { useState, useRef, useEffect } from 'react';
import { CustomDropdownProps } from './customDropdownProps';
import CustomDropdownView from './customDropdownView';
import './customDropdown.css';

const CustomDropdown: React.FC<CustomDropdownProps> = (props) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    props.onChange(option === "Any" ? "" : option);
    setIsOpen(false);
  };

  return (
    <CustomDropdownView 
      {...props} 
      isOpen={isOpen} 
      setIsOpen={setIsOpen} 
      containerRef={containerRef} 
      handleSelect={handleSelect} 
    />
  );
};

export default CustomDropdown;