
import React, { useState, useMemo } from 'react';
import { Album } from '../../types';
import { getRawAlbumsPool, getHeartedIds } from '../../services/musicService';
import { loadPersistentCache } from '../../services/cacheService';
import LibraryItem from './libraryItem';
import { ArrowLeft, LayoutGrid, List } from 'lucide-react';
import './libraryView.css';

interface LibraryViewProps {
  onBack: () => void;
  onSelectAlbum?: (album: Album) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ onBack, onSelectAlbum }) => {
  const [search, setSearch] = useState("");
  const [layout, setLayout] = useState<"grid" | "list">("grid");
  
  const fullPool = useMemo(() => {
    const jsonPool = getRawAlbumsPool() || [];
    const heartedIds = getHeartedIds();
    const cache = loadPersistentCache();
    
    // Create a combined list of original JSON items + cached hearted discoveries
    const combinedPool = [...jsonPool];
    
    // Add hearted discoveries that aren't in the JSON
    const jsonIds = new Set(jsonPool.map(item => item["Catalog Identifiers - Album"]?.split(',')[0].trim()).filter(Boolean));
    
    heartedIds.forEach(id => {
      if (!jsonIds.has(id) && cache[id]) {
        // Map cached album to library entry format
        combinedPool.push({
          "Album ID": id,
          Title: cache[id].name,
          Artist: cache[id].artist,
          "Catalog Identifiers - Album": id,
          Visible: true
        });
      }
    });
    
    return combinedPool;
  }, []);

  const filteredPool = useMemo(() => {
    if (!search.trim()) return fullPool;
    const query = search.toLowerCase();
    return fullPool.filter(entry => 
      (entry.Title && entry.Title.toLowerCase().includes(query)) ||
      (entry.Artist && entry.Artist.toLowerCase().includes(query))
    );
  }, [fullPool, search]);

  return (
    <div className="library-view-container">
      <header className="library-header">
        <div className="library-header-top">
          <button onClick={onBack} className="library-back-btn glass-button-base">
            <ArrowLeft size={12} />
            <span>Home</span>
          </button>
          <div className="library-header-text">
            <h2 className="library-view-title">Collection</h2>
            <p className="library-view-count">{filteredPool.length} Projects</p>
          </div>
        </div>
        
        <div className="library-controls-row">
          <div className="library-search-wrapper glass-input-container">
             <input 
               type="text" 
               placeholder="Search..." 
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="text-left"
             />
          </div>
          
          <div className="layout-toggle-control glass-button-base">
            <button 
              onClick={() => setLayout('grid')}
              className={`toggle-btn ${layout === 'grid' ? 'is-active' : ''}`}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setLayout('list')}
              className={`toggle-btn ${layout === 'list' ? 'is-active' : ''}`}
              title="List View"
            >
              <List size={16} />
            </button>
            <div className={`toggle-slider is-${layout}`}></div>
          </div>
        </div>
      </header>

      <div className="library-grid-scroll custom-glass-scrollbar">
        {filteredPool.length > 0 ? (
          <div className={`library-items-container view-${layout}`}>
            {filteredPool.map((entry, idx) => (
              <LibraryItem 
                key={`${idx}-${entry.Title || entry["Album ID"] || Math.random()}`} 
                entry={entry} 
                layout={layout}
                onClick={onSelectAlbum ? (album) => onSelectAlbum(album) : undefined}
              />
            ))}
          </div>
        ) : (
          <div className="library-empty-state">
             <p className="opacity-40 text-[10px] font-black uppercase tracking-[0.3em]">No matching projects</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibraryView;
