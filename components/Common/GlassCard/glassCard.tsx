import React from 'react';
import { GlassCardProps } from './glassCardProps';
import GlassCardView from './glassCardView';
import './glassCard.css';

const GlassCard: React.FC<GlassCardProps> = (props) => {
  return <GlassCardView {...props} />;
};

export default GlassCard;