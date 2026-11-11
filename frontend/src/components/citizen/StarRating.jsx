import { useState } from 'react'
import { Star } from 'lucide-react'
import { ratingLabels } from '../../data/feedbackMockData'

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-10 w-10',
  lg: 'h-12 w-12',
}

function StarRating({ value, onChange, size = 'md', label = 'Rate your experience' }) {
  const [focused, setFocused] = useState(0)
  const display = focused || value

  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star of 5 — ${ratingLabels[star - 1]}`}
          onMouseEnter={() => setFocused(star)}
          onMouseLeave={() => setFocused(0)}
          onFocus={() => setFocused(star)}
          onBlur={() => setFocused(0)}
          onClick={() => onChange(star)}
          className="rounded-lg p-1 transition-transform outline-none hover:scale-110 focus:ring-2 focus:ring-primary/30 active:scale-105"
        >
          <Star
            className={`${sizeClasses[size]} transition-colors ${
              star <= display ? 'fill-amber-400 text-amber-400 drop-shadow-sm' : 'text-gray-300'
            }`}
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  )
}

function StarRatingDisplay({ value, size = 'sm' }) {
  return (
    <span className="flex items-center gap-0.5" role="img" aria-label={`${value} of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${star <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
          aria-hidden="true"
        />
      ))}
    </span>
  )
}

export { StarRating, StarRatingDisplay }
