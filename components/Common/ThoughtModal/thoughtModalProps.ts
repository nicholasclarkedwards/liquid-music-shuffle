export interface ThoughtModalProps {
  title: string;
  initialThoughts: string;
  onSave: (thoughts: string) => void;
  onClose: () => void;
  isOpen: boolean;
  artworkUrl?: string;
}