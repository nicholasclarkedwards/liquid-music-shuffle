import React from 'react';
import { InfoIconProps } from './infoIconProps';
import InfoIconView from './infoIconView';
import './infoIcon.css';

const InfoIcon: React.FC<InfoIconProps> = (props) => {
  return <InfoIconView {...props} />;
};

export default InfoIcon;