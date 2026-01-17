
import React from 'react';
import { Filters } from '../types';
import InfoIcon from './Common/InfoIcon';

interface FilterPanelProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, setFilters }) => {
  const handleChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const decades = ["Any", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"];
  const genres = ["Any", "Rock", "Pop", "Jazz", "Electronic", "Classical", "Hip Hop", "R&B", "Alternative", "Metal", "Country", "Folk", "Soul"];
  const months = ["Any", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3">
      {/* Decade */}
      <div className="flex flex-col gap-0.5">
        <label className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30 ml-4 flex items-center leading-none">
          Decade
          <InfoIcon text="Filter by era." />
        </label>
        <div className="relative glass-input-container group">
          <select 
            value={filters.decade}
            onChange={(e) => handleChange('decade', e.target.value)}
            className="px-6"
          >
            {decades.map(d => <option key={d} value={d === "Any" ? "" : d} className="bg-[#12121a]">{d}</option>)}
          </select>
          <div className="absolute right-5 pointer-events-none opacity-20">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {/* Genre */}
      <div className="flex flex-col gap-0.5">
        <label className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30 ml-4 flex items-center leading-none">
          Genre
          <InfoIcon text="Filter by musical genre." />
        </label>
        <div className="relative glass-input-container group">
          <select 
            value={filters.genre}
            onChange={(e) => handleChange('genre', e.target.value)}
            className="px-6"
          >
            {genres.map(g => <option key={g} value={g === "Any" ? "" : g} className="bg-[#12121a]">{g}</option>)}
          </select>
          <div className="absolute right-5 pointer-events-none opacity-20">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {/* Specific Year */}
      <div className="flex flex-col gap-0.5">
        <label className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30 ml-4 flex items-center leading-none">
          Year
          <InfoIcon text="Release year." />
        </label>
        <div className="glass-input-container px-6">
          <input 
            type="text"
            placeholder="e.g. 1994"
            value={filters.year}
            onChange={(e) => handleChange('year', e.target.value)}
            className="placeholder-white/10"
          />
        </div>
      </div>

      {/* Specific Month */}
      <div className="flex flex-col gap-0.5">
        <label className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30 ml-4 flex items-center leading-none">
          Month
          <InfoIcon text="Release month." />
        </label>
        <div className="relative glass-input-container group">
          <select 
            value={filters.month}
            onChange={(e) => handleChange('month', e.target.value)}
            className="px-6"
          >
            {months.map(m => <option key={m} value={m === "Any" ? "" : m} className="bg-[#12121a]">{m}</option>)}
          </select>
          <div className="absolute right-5 pointer-events-none opacity-20">
            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {/* Artist Search */}
      <div className="flex flex-col gap-0.5 md:col-span-2">
        <label className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30 ml-4 flex items-center leading-none">
          Artist Focus
          <InfoIcon text="Focus on a specific artist for the search." />
        </label>
        <div className="glass-input-container px-6">
          <input 
            type="text"
            placeholder="Search for an artist..."
            value={filters.artist}
            onChange={(e) => handleChange('artist', e.target.value)}
            className="placeholder-white/10"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
