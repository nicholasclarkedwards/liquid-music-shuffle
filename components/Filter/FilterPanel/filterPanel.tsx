
import React, { useState, useEffect, useRef } from 'react';
import { Filters } from '../../../types';
import { FilterPanelProps } from './filterPanelProps';
import FilterPanelView from './filterPanelView';
import { getArtistSuggestions } from '../../../services/musicService';
import { toast } from 'react-hot-toast';
import './filterPanel.css';

const IconError = () => (
  <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <circle cx="12" cy="12" r="10"/><path d="m15 9-6 6M9 9l6 6"/>
  </svg>
);

const ALL_GENRES = [
  "Rock", "Pop", "Jazz", "Electronic", "Classical", "Hip Hop", "R&B", "Alternative", 
  "Metal", "Country", "Indie", "Folk", "Blues", "Soul", "Punk", "Funk", "Disco", 
  "Techno", "House", "Ambient", "Synthpop", "Shoegaze", "Grunge", "Psychedelic", 
  "Latin", "Reggae", "Ska", "Gospel", "Americana", "Bluegrass", "Trance", 
  "Dubstep", "Drum and Bass", "Lo-Fi", "Trap", "Afrobeat", "K-Pop", "J-Pop", 
  "Emo", "Hardcore", "Orchestral", "Soundtrack", "World"
].sort();

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, setFilters }) => {
  const [artistSuggestions, setArtistSuggestions] = useState<string[]>([]);
  const [genreSuggestions, setGenreSuggestions] = useState<string[]>([]);
  const [activeSuggestionField, setActiveSuggestionField] = useState<'artist' | 'genre' | null>(null);
  
  const artistRef = useRef<HTMLDivElement>(null);
  const genreRef = useRef<HTMLDivElement>(null);

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
      setArtistSuggestions(matches);
      setActiveSuggestionField(matches.length > 0 ? 'artist' : null);
    } else {
      setArtistSuggestions([]);
      setActiveSuggestionField(null);
    }
  };

  const handleGenreChange = (value: string) => {
    handleChange('genre', value);
    if (value.trim().length >= 1) {
      const normalized = value.toLowerCase();
      const matches = ALL_GENRES.filter(g => g.toLowerCase().includes(normalized)).slice(0, 8);
      setGenreSuggestions(matches);
      setActiveSuggestionField(matches.length > 0 ? 'genre' : null);
    } else {
      setGenreSuggestions([]);
      setActiveSuggestionField(null);
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
      if (
        (artistRef.current && !artistRef.current.contains(event.target as Node)) &&
        (genreRef.current && !genreRef.current.contains(event.target as Node))
      ) {
        setActiveSuggestionField(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <FilterPanelView 
      filters={filters}
      setFilters={setFilters}
      suggestions={activeSuggestionField === 'artist' ? artistSuggestions : genreSuggestions}
      showSuggestions={activeSuggestionField !== null}
      suggestionRef={activeSuggestionField === 'artist' ? artistRef : genreRef}
      decades={decades}
      months={months}
      yearsInDecade={getYearsInDecade(filters.decade)}
      handleYearTextChange={handleYearTextChange}
      handleArtistChange={handleArtistChange}
      handleGenreChange={handleGenreChange}
      handleChange={handleChange}
      setShowSuggestions={(show) => !show && setActiveSuggestionField(null)}
      activeSuggestionField={activeSuggestionField}
    />
  );
};

export default FilterPanel;
