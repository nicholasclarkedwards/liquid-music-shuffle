import React from 'react';
import { ThoughtModalProps } from './thoughtModalProps';
import { GlassCard } from '../GlassCard';
import { X, Save, Edit3, MessageSquareText, CornerDownLeft } from 'lucide-react';

interface ThoughtModalViewProps extends ThoughtModalProps {
  isEditing: boolean;
  setIsEditing: (val: boolean) => void;
  text: string;
  setText: (val: string) => void;
  handleSave: () => void;
  handleCancel: () => void;
}

const ThoughtModalView: React.FC<ThoughtModalViewProps> = ({
  isOpen,
  title,
  onClose,
  isEditing,
  setIsEditing,
  text,
  setText,
  handleSave,
  handleCancel,
  artworkUrl
}) => {
  if (!isOpen) return null;

  return (
    <div className="thought-modal-backdrop" onClick={onClose}>
      <div className="thought-modal-container" onClick={(e) => e.stopPropagation()}>
        <GlassCard className="thought-modal-card" imageUrl={artworkUrl}>
          <div className="thought-modal-layout">
            <header className="thought-modal-header">
              <div className="flex items-center gap-3 min-w-0">
                <div className="thought-modal-icon-hex flex-shrink-0">
                  <MessageSquareText size={14} className="text-white/60" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[7px] font-black uppercase tracking-[0.2em] text-white/30">Track Perspective</span>
                  <h3 className="thought-modal-title truncate">{title}</h3>
                </div>
              </div>
              <button onClick={onClose} className="thought-modal-close-btn">
                <X size={18} strokeWidth={2.5} className="hover:text-white" />
              </button>
            </header>

            <main className="thought-modal-content custom-glass-scrollbar">
              {isEditing ? (
                <div className="editor-container">
                  <textarea
                    autoFocus
                    className="thought-modal-textarea custom-glass-scrollbar"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type your thoughts..."
                  />
                </div>
              ) : (
                <div 
                  className="thought-modal-display-block group"
                  onClick={() => setIsEditing(true)}
                >
                  <div className="display-content">
                    {text ? (
                      <p className="perspective-text">{text}</p>
                    ) : (
                      <div className="empty-prompt">
                        <Edit3 size={20} className="mb-2 text-white/30 group-hover:text-white/60 transition-colors" strokeWidth={2.5} />
                        <p>No analysis recorded yet.</p>
                        <p className="text-[9px] opacity-40 uppercase tracking-widest mt-1">Tap to document your perspective</p>
                      </div>
                    )}
                  </div>
                  {text && (
                    <div className="edit-hint-overlay">
                      <div className="hint-pill">
                        <Edit3 size={10} className="text-white/60" strokeWidth={2.5} />
                        <span>Modify Entry</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </main>

            <footer className="thought-modal-actions">
              {isEditing ? (
                <div className="flex items-center gap-3 w-full">
                  <button onClick={handleCancel} className="action-btn secondary-btn">
                    Discard
                  </button>
                  <button onClick={handleSave} className="action-btn primary-btn group">
                    <Save size={14} strokeWidth={2.5} className="text-white/60 group-hover:text-white transition-colors" />
                    <span>Archive Entry</span>
                  </button>
                </div>
              ) : (
                <button onClick={() => setIsEditing(true)} className="action-btn outline-btn group">
                  <CornerDownLeft size={12} className="rotate-90 text-white/40 group-hover:text-white transition-colors" strokeWidth={2.5} />
                  <span>Update Analysis</span>
                </button>
              )}
            </footer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default ThoughtModalView;