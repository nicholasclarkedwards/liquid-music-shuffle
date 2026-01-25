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
    
    const combinedPool = [...jsonPool];
    const jsonIds = new Set(jsonPool.map(item => item["Catalog Identifiers - Album"]?.split(',')[0].trim()).filter(Boolean));
    
    heartedIds.forEach(id => {
      if (!jsonIds.has(id) && cache[id]) {
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
    const query = search.trim().toLowerCase();
    if (!query) return fullPool;
    
    return fullPool.filter(entry => {
      const title = (entry.Title || entry.name || "").toLowerCase();
      const artist = (entry.Artist || entry.artist || "").toLowerCase();
      return title.includes(query) || artist.includes(query);
    });
  }, [fullPool, search]);

  return (
    <div className="library-view-container">
      <header className="library-header">
        <div className="library-header-top">
          <button onClick={onBack} className="library-back-btn glass-button-base group">
            <ArrowLeft size={12} className="text-white/40 group-hover:text-white" strokeWidth={2.5} />
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
               placeholder="Search title or artist..." 
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
              <LayoutGrid size={16} className={layout === 'grid' ? "text-white" : "text-white/30"} strokeWidth={2.5} />
            </button>
            <button 
              onClick={() => setLayout('list')}
              className={`toggle-btn ${layout === 'list' ? 'is-active' : ''}`}
              title="List View"
            >
              <List size={16} className={layout === 'list' ? "text-white" : "text-white/30"} strokeWidth={2.5} />
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
                key={`${entry["Catalog Identifiers - Album"] || entry.Title}-${idx}`} 
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