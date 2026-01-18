import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Filters } from '../types';
import InfoIcon from './Common/InfoIcon';
import { getArtistSuggestions, scoutNewArtists } from '../services/musicService';
import { toast } from 'react-hot-toast';

interface FilterPanelProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, setFilters }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isScouting, setIsScouting] = useState(false);
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

  const handleScout = async () => {
    setIsScouting(true);
    try {
      const json = await scoutNewArtists(filters);
      await navigator.clipboard.writeText(json);
      toast.success("15 New Artists copied to clipboard as JSON!");
    } catch (e) {
      toast.error("Scouting failed. Try again.");
    } finally {
      setIsScouting(false);
    }
  };

  const selectSuggestion = (artist: string) => {
    handleChange('artist', artist);
    setShowSuggestions(false);
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

  const decades = ["Any", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"];
  const genres = ["Any", "Rock", "Pop", "Jazz", "Electronic", "Classical", "Hip Hop", "R&B", "Alternative", "Metal", "Country", "Folk", "Soul"];
  const months = ["Any", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const availableYears = useMemo(() => {
    if (!filters.decade || filters.decade === "Any") return [];
    const start = parseInt(filters.decade.substring(0, 4));
    return ["Any", ...Array.from({ length: 10 }, (_, i) => (start + i).toString())];
  }, [filters.decade]);

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Decade */}
        <div className="flex flex-col gap-1">
          <label className="text-[7px] font-black uppercase tracking-[0.25em] text-white/30 ml-4 flex items-center leading-none">
            Decade
            <InfoIcon text="Select an era to filter your library." />
          </label>
          <div className="relative glass-input-container group">
            <select 
              value={filters.decade}
              onChange={(e) => handleChange('decade', e.target.value)}
              className="px-4 w-full bg-transparent outline-none appearance-none cursor-pointer"
            >
              {decades.map(d => <option key={d} value={d === "Any" ? "" : d} className="bg-[#12121a]">{d}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Genre */}
        <div className="flex flex-col gap-1">
          <label className="text-[7px] font-black uppercase tracking-[0.25em] text-white/30 ml-4 flex items-center leading-none">
            Genre
            <InfoIcon text="Focus on specific musical styles." />
          </label>
          <div className="relative glass-input-container group">
            <select 
              value={filters.genre}
              onChange={(e) => handleChange('genre', e.target.value)}
              className="px-4 w-full bg-transparent outline-none appearance-none cursor-pointer"
            >
              {genres.map(g => <option key={g} value={g === "Any" ? "" : g} className="bg-[#12121a]">{g}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" /></svg>
            </div>
          </div>
        </div>

        {/* Artist */}
        <div className="flex flex-col gap-1 md:col-span-2 relative" ref={suggestionRef}>
          <label className="text-[7px] font-black uppercase tracking-[0.25em] text-white/30 ml-4 flex items-center justify-between leading-none w-full pr-4">
            <span className="flex items-center">
              Artist Filter
              <InfoIcon text="Search within your massive library pool." />
            </span>
            <button 
              onClick={handleScout}
              disabled={isScouting}
              className="text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50"
            >
              {isScouting ? 'SCOUTING...' : 'SCOUT NEW ARTISTS'}
            </button>
          </label>
          <div className="glass-input-container px-4">
            <input 
              type="text"
              placeholder="Search library artists..."
              value={filters.artist}
              onChange={(e) => handleArtistChange(e.target.value)}
              onFocus={() => {
                if (filters.artist.trim().length >= 1) handleArtistChange(filters.artist);
              }}
              autoComplete="off"
              className="placeholder-white/10"
            />
          </div>
          
          {showSuggestions && (
            <div className="absolute top-[105%] left-0 right-0 z-[100] mt-1 rounded-[21px] bg-black/70 backdrop-blur-3xl border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] overflow-hidden animate-fade-in">
              <div className="max-h-52 overflow-y-auto custom-scrollbar">
                {suggestions.map((artist, idx) => (
                  <button
                    key={`${artist}-${idx}`}
                    onClick={() => selectSuggestion(artist)}
                    className="w-full text-left px-5 h-[34px] flex items-center text-[10px] font-bold text-white/80 hover:text-white hover:bg-white/[0.06] active:bg-white/[0.12] transition-all uppercase tracking-wider last:border-none border-b border-white/[0.03]"
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