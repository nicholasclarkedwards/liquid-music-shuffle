import React from 'react';
import { AlbumArtworkProperties } from './albumArtworkProps';
import AlbumArtworkView from './albumArtworkView';

const AlbumArtwork: React.FC<AlbumArtworkProperties> = (props) => {
  // Logic or state for this specific feature would be handled here via props
  return <AlbumArtworkView {...props} />;
};

export default AlbumArtwork;
