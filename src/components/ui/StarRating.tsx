import React, { useState } from 'react';
import StarIcon from '../icons/StarIcon';

interface StarRatingProps {
    count?: number;
    rating: number;
    onRatingChange: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({ count = 5, rating, onRatingChange }) => {
    const [hoverRating, setHoverRating] = useState(0);

    const stars = Array.from({ length: count }, (_, i) => i + 1);

    return (
        <div className="flex items-center space-x-1">
            {stars.map((starValue) => (
                <button
                    type="button"
                    key={starValue}
                    onClick={() => onRatingChange(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="focus:outline-none"
                    aria-label={`Rate ${starValue} star`}
                >
                    <StarIcon
                        className={`w-8 h-8 transition-colors duration-200 ${
                            (hoverRating || rating) >= starValue
                                ? 'text-yellow-400'
                                : 'text-gray-300'
                        }`}
                    />
                </button>
            ))}
        </div>
    );
};

export default StarRating;
