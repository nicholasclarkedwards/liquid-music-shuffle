export interface StarRatingProps {
  rating: number;
  onRate: (rating: number) => void;
  size?: 'sm' | 'lg';
  className?: string;
}