import React, { useState } from 'react';
import { StarRatingProps } from './starRatingProps';
import StarRatingView from './starRatingView';
import './starRating.css';

const StarRating: React.FC<StarRatingProps> = (props) => {
  const [hover, setHover] = useState(0);
  const [animatingRating, setAnimatingRating] = useState(0);
  const [isBusy, setIsBusy] = useState(false);

  const handleClick = (e: React.MouseEvent, s: number) => {
    e.stopPropagation();
    props.onRate(s);
    setAnimatingRating(s);
    setIsBusy(true);
    
    // Duration matches the CSS animation
    setTimeout(() => {
      setIsBusy(false);
      setAnimatingRating(0);
    }, 1200);
  };

  return (
    <StarRatingView 
      {...props} 
      hover={hover} 
      setHover={setHover}
      animatingRating={animatingRating}
      isBusy={isBusy}
      handleClick={handleClick}
    />
  );
};

export default StarRating;