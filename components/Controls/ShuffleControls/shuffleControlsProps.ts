import { DiscoveryMode } from '../../../types';

export interface ShuffleControlsProps {
  onShuffle: (mode: DiscoveryMode) => void;
  isLoading: boolean;
}
