
import React from 'react';
import { FilterPanelProps } from './filterPanelProps';
import { CustomDropdown } from '../../Common';

interface FilterPanelViewProps extends FilterPanelProps {
  suggestions: string[];
  showSuggestions: boolean;
  suggestionRef: React.RefObject<HTMLDivElement | null>;
  decades: string[];
  months: string[];
  yearsInDecade: string[];
  handleYearTextChange: (value: string) => void;
  handleArtistChange: (value: string) => void;
  handleGenreChange: (value: string) => void;
  handleChange: (key: keyof import('../../../types').Filters, value: string) => void;
  setShowSuggestions: (show: boolean) => void;
  activeSuggestionField: 'artist' | 'genre' | null;
}

const FilterPanelView: React.FC<FilterPanelViewProps> = ({ 
  filters, 
  suggestions, 
  showSuggestions, 
  suggestionRef, 
  decades, 
  months, 
  yearsInDecade,
  handleYearTextChange,
  handleArtistChange,
  handleGenreChange,
  handleChange,
  setShowSuggestions,
  activeSuggestionField
}) => {
  return (
    <div className="filter-panel-container">
      {/* Row 1: Decade & Year */}
      <div className="filter-grid">
        <div className="filter-field">
          <label className="filter-label">Decade</label>
          <CustomDropdown 
            label="Decade"
            options={decades}
            value={filters.decade}
            onChange={(val) => handleChange('decade', val)}
          />
        </div>

        <div className="filter-field">
          <label className="filter-label">Year</label>
          {filters.decade && filters.decade !== "Any" ? (
            <CustomDropdown 
              label="Year"
              options={yearsInDecade}
              value={filters.year}
              onChange={(val) => handleChange('year', val)}
            />
          ) : (
            <div className="glass-input-container px-1">
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

      {/* Row 2: Month (Full Row, Only if year is selected) */}
      {filters.year && filters.year !== "Any" && (
        <div className="filter-field filter-row-full">
          <label className="filter-label">Release Month</label>
          <CustomDropdown 
            label="Month"
            options={months}
            value={filters.month}
            onChange={(val) => handleChange('month', val)}
          />
        </div>
      )}

      {/* Row 3: Genre with Autocomplete */}
      <div className="filter-field filter-row-full filter-artist-pool-wrapper" ref={activeSuggestionField === 'genre' ? suggestionRef : null}>
        <label className="filter-label">Genre</label>
        <div className="glass-input-container px-1">
          <input 
            type="text"
            placeholder="Search genre..."
            value={filters.genre}
            onChange={(e) => handleGenreChange(e.target.value)}
            autoComplete="off"
            className="placeholder-white/35 text-[12px] font-bold"
          />
        </div>
        {showSuggestions && activeSuggestionField === 'genre' && (
          <div className="suggestions-menu liquid-menu-base">
            <div className="suggestions-list no-scrollbar">
              <button
                onClick={() => {
                  handleChange('genre', '');
                  setShowSuggestions(false);
                }}
                className="suggestion-item italic opacity-60"
              >
                Clear Selection (Any)
              </button>
              {suggestions.map((genre, idx) => (
                <button
                  key={`${genre}-${idx}`}
                  onClick={() => {
                    handleChange('genre', genre);
                    setShowSuggestions(false);
                  }}
                  className="suggestion-item"
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Row 4: Artist Pool */}
      <div className="filter-field filter-artist-pool-wrapper" ref={activeSuggestionField === 'artist' ? suggestionRef : null}>
        <label className="filter-label">Artist Pool</label>
        <div className="glass-input-container px-1">
          <input 
            type="text"
            placeholder="Search library artists..."
            value={filters.artist}
            onChange={(e) => handleArtistChange(e.target.value)}
            autoComplete="off"
            className="placeholder-white/35 text-[12px] font-bold"
          />
        </div>
        
        {showSuggestions && activeSuggestionField === 'artist' && (
          <div className="suggestions-menu liquid-menu-base">
            <div className="suggestions-list no-scrollbar">
              {suggestions.map((artist, idx) => (
                <button
                  key={`${artist}-${idx}`}
                  onClick={() => {
                    handleChange('artist', artist);
                    setShowSuggestions(false);
                  }}
                  className="suggestion-item"
                >
                  {artist}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterPanelView;
