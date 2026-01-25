import React from 'react';
import { StarRatingProps } from './starRatingProps';
import { Star } from 'lucide-react';

interface StarRatingViewProps extends StarRatingProps {
  hover: number;
  setHover: (rating: number) => void;
  animatingRating: number;
  isBusy: boolean;
  handleClick: (e: React.MouseEvent, rating: number) => void;
}

const StarRatingView: React.FC<StarRatingViewProps> = ({ 
  rating, 
  size = 'sm', 
  className = '', 
  hover, 
  setHover, 
  animatingRating, 
  isBusy, 
  handleClick 
}) => {
  const starSize = size === 'lg' ? 20 : 12;
  const gap = size === 'lg' ? 'gap-1.5' : 'gap-0.5';

  return (
    <div className={`flex ${gap} ${className}`}>
      {[1, 2, 3, 4, 5].map((s) => {
        const isAnimating = isBusy && s <= animatingRating;
        const isActive = s <= (hover || rating);
        const shouldFill = isActive || isAnimating;
        
        return (
          <button
            key={s}
            onClick={(e) => handleClick(e, s)}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            className={`star-btn transform active:scale-150 transition-all duration-200 ${
              isActive ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]' : 'text-white/20'
            } ${isAnimating ? 'star-sequence-anim' : ''}`}
            style={{ 
              animationDelay: isAnimating ? `${s * 60}ms` : '0ms'
            }}
          >
            <Star 
              size={starSize} 
              fill={shouldFill ? "currentColor" : "none"} 
              strokeWidth={size === 'lg' ? 2.5 : 3} 
              className="will-change-transform"
            />
          </button>
        );
      })}
    </div>
  );
};

export default StarRatingView;