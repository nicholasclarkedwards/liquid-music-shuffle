import React, { useState, useEffect, useRef } from 'react';
import { Filters } from '../types';
import CustomDropdown from './Common/CustomDropdown';
import { getArtistSuggestions } from '../services/musicService';
import { toast } from 'react-hot-toast';

const IconError = () => (
  <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>
  </svg>
);

interface FilterPanelProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, setFilters }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef<HTMLDivElement>(null);

  const handleChange = (key: keyof Filters, value: string) => {
    setFilters(prev => {
      const updated = { ...prev, [key]: value };
      if (key === 'decade') {
        updated.year = '';
        updated.month = '';
      }
      if (key === 'year') {
        updated.month = '';
      }
      return updated;
    });
  };

  const handleYearTextChange = (value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    handleChange('year', cleaned);

    if (cleaned.length === 4) {
      const yearInt = parseInt(cleaned);
      if (yearInt >= 1950 && yearInt <= 2030) {
        const dec = Math.floor(yearInt / 10) * 10;
        setFilters(prev => ({ ...prev, decade: `${dec}s`, year: cleaned }));
      } else {
        toast.error("Valid Year required (1950-2030)", { 
          icon: <IconError />,
          className: 'glass-toast-base glass-toast-error',
          position: 'top-center'
        });
        setFilters(prev => ({ ...prev, decade: '', year: '' }));
      }
    }
  };

  const handleArtistChange = async (value: string) => {
    handleChange('artist', value);
    if (value.trim().length >= 1) {
      const matches = await getArtistSuggestions(value);
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const decades = ["Any", "1950s", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"];
  const months = ["Any", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const getYearsInDecade = (dec: string) => {
    if (!dec || dec === "Any") return [];
    const start = parseInt(dec.substring(0, 4));
    return ["Any", ...Array.from({ length: 10 }, (_, i) => (start + i).toString())];
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionRef.current && !suggestionRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const labelClass = "text-[7px] font-black uppercase tracking-[0.2em] text-white/40 ml-4 flex items-center leading-none mb-1.5";

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-4">
        
        {/* Row 1: Decade & Year */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className={labelClass}>Decade</label>
            <CustomDropdown 
              label="Decade"
              options={decades}
              value={filters.decade}
              onChange={(val) => handleChange('decade', val)}
            />
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Year</label>
            {filters.decade && filters.decade !== "Any" ? (
              <CustomDropdown 
                label="Year"
                options={getYearsInDecade(filters.decade)}
                value={filters.year}
                onChange={(val) => handleChange('year', val)}
              />
            ) : (
              <div className="glass-input-container px-4 rounded-full">
                <input 
                  type="text"
                  placeholder="Enter year..."
                  value={filters.year}
                  onChange={(e) => handleYearTextChange(e.target.value)}
                  className="placeholder-white/35 text-left tracking-normal text-[12px] font-bold"
                />
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Month & Genre */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <label className={labelClass}>Release Month</label>
            <CustomDropdown 
              label="Month"
              options={months}
              value={filters.month}
              onChange={(val) => handleChange('month', val)}
            />
          </div>

          <div className="flex flex-col">
            <label className={labelClass}>Musical Genre</label>
            <CustomDropdown 
              label="Genre"
              options={["Any", "Rock", "Pop", "Jazz", "Electronic", "Classical", "Hip Hop", "R&B", "Alternative", "Metal", "Country"]}
              value={filters.genre}
              onChange={(val) => handleChange('genre', val)}
            />
          </div>
        </div>

        {/* Row 3: Artist Pool */}
        <div className="flex flex-col relative" ref={suggestionRef}>
          <label className={labelClass}>Artist Pool</label>
          <div className="glass-input-container px-4 rounded-full">
            <input 
              type="text"
              placeholder="Search library artists..."
              value={filters.artist}
              onChange={(e) => handleArtistChange(e.target.value)}
              autoComplete="off"
              className="placeholder-white/35 text-[12px] font-bold"
            />
          </div>
          
          {showSuggestions && (
            <div className="absolute top-[105%] left-0 right-0 z-[100] mt-1 rounded-[1.2rem] liquid-menu-base shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden origin-top">
              <div className="max-h-52 overflow-y-auto custom-glass-scrollbar">
                {suggestions.map((artist, idx) => (
                  <button
                    key={`${artist}-${idx}`}
                    onClick={() => {
                      handleChange('artist', artist);
                      setShowSuggestions(false);
                    }}
                    className="w-full text-left px-5 h-[40px] flex items-center text-[10px] font-bold text-white/50 hover:text-white hover:bg-black/20 transition-all uppercase tracking-widest"
                  >
                    {artist}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;