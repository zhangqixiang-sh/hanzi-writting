import { Star } from 'lucide-react';

interface StarRatingProps {
  stars: number;        // 0-3
  maxStars?: number;
  size?: number;
  animated?: boolean;
}

export function StarRating({ stars, maxStars = 3, size = 32, animated = false }: StarRatingProps) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: maxStars }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={`transition-all duration-300 ${
            i < stars
              ? 'fill-star text-star drop-shadow-sm'
              : 'fill-star-empty text-star-empty'
          } ${animated && i < stars ? 'animate-[star-spin_0.6s_ease-out]' : ''}`}
          style={animated && i < stars ? { animationDelay: `${i * 0.15}s` } : undefined}
        />
      ))}
    </div>
  );
}
