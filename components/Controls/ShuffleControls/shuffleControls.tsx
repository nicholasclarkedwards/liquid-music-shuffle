import React from 'react';
import { ShuffleControlsProps } from './shuffleControlsProps';
import ShuffleControlsView from './shuffleControlsView';
import './shuffleControls.css';

const ShuffleControls: React.FC<ShuffleControlsProps> = (props) => {
  return <ShuffleControlsView {...props} />;
};

export default ShuffleControls;