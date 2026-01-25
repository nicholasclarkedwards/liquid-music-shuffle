
import React from 'react';
import { Shuffle, Library, Compass } from 'lucide-react';
import './homeView.css';

interface HomeViewProps {
  onEnterExplorer: () => void;
  onEnterLibrary: () => void;
}

const HomeView: React.FC<HomeViewProps> = ({ onEnterExplorer, onEnterLibrary }) => {
  return (
    <div className="home-view-container">
      <div className="home-content">
        <header className="home-header">
          <div className="home-tag">Music Selection Engine</div>
          <h1 className="home-title shimmer-text">Liquid Shuffle</h1>
          <p className="home-subtitle">One simple task: Select a random masterpiece.</p>
        </header>

        <div className="home-actions-hero">
          <button 
            onClick={onEnterExplorer} 
            className="home-hero-btn glass-button-base group"
          >
            <div className="btn-glow"></div>
            <Shuffle size={24} className="group-hover:rotate-180 transition-transform duration-700" />
            <span>Shuffle Library</span>
          </button>
        </div>

        <div className="home-actions-secondary">
          <button 
            onClick={onEnterLibrary} 
            className="home-pill-btn glass-button-base"
          >
            <Library size={14} className="text-indigo-400" />
            <span>Collection</span>
          </button>
          
          <button 
            onClick={onEnterExplorer} 
            className="home-pill-btn glass-button-base"
          >
            <Compass size={14} className="text-blue-400" />
            <span>Discover New</span>
          </button>
        </div>
        
        <footer className="home-footer">
          <p className="home-version">Version 2.0 • Pro-Grade Selection</p>
        </footer>
      </div>
    </div>
  );
};

export default HomeView;
