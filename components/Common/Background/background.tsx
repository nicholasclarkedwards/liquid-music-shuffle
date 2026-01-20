import React from 'react';
import { BackgroundProperties } from './backgroundProps';
import BackgroundView from './backgroundView';
import './background.css';

const Background: React.FC<BackgroundProperties> = (props) => {
  return <BackgroundView {...props} />;
};

export default Background;