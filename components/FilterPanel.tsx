import React from 'react';
import { Filters } from '../types';

interface FilterPanelProps {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, setFilters }) => {
  const handleChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const decades = ["Any", "1960s", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"];
  const genres = ["Any", "Rock", "Pop", "Jazz", "Electronic", "Classical", "Hip Hop", "R&B", "Alternative", "Metal", "Country"];
  const months = ["Any", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6 mb-4">
      {/* Decade */}
      <div className="flex flex-col">
        <label className="filter-label">Decade</label>
        <div className="relative glass-input-container rounded-[1.2rem] group">
          <select 
            value={filters.decade}
            onChange={(e) => handleChange('decade', e.target.value)}
          >
            {decades.map(d => <option key={d} value={d === "Any" ? "" : d}>{d}</option>)}
          </select>
          <div className="absolute right-4 pointer-events-none opacity-20 transition-transform group-hover:scale-110">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {/* Genre */}
      <div className="flex flex-col">
        <label className="filter-label">Genre</label>
        <div className="relative glass-input-container rounded-[1.2rem] group">
          <select 
            value={filters.genre}
            onChange={(e) => handleChange('genre', e.target.value)}
          >
            {genres.map(g => <option key={g} value={g === "Any" ? "" : g}>{g}</option>)}
          </select>
          <div className="absolute right-4 pointer-events-none opacity-20 transition-transform group-hover:scale-110">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {/* Year */}
      <div className="flex flex-col">
        <label className="filter-label">Specific Year</label>
        <div className="glass-input-container rounded-[1.2rem] overflow-hidden">
          <input 
            type="text"
            placeholder="e.g. 1994"
            value={filters.year}
            onChange={(e) => handleChange('year', e.target.value)}
          />
        </div>
      </div>

      {/* Month */}
      <div className="flex flex-col">
        <label className="filter-label">Specific Month</label>
        <div className="relative glass-input-container rounded-[1.2rem] group">
          <select 
            value={filters.month}
            onChange={(e) => handleChange('month', e.target.value)}
          >
            {months.map(m => <option key={m} value={m === "Any" ? "" : m}>{m}</option>)}
          </select>
          <div className="absolute right-4 pointer-events-none opacity-20 transition-transform group-hover:scale-110">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>
      </div>

      {/* Artist */}
      <div className="flex flex-col">
        <label className="filter-label">Artist</label>
        <div className="glass-input-container rounded-[1.2rem] overflow-hidden">
          <input 
            type="text"
            placeholder="Search Artist..."
            value={filters.artist}
            onChange={(e) => handleChange('artist', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;