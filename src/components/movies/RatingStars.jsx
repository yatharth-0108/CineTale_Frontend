import { Star } from 'lucide-react';
export default function RatingStars({ value = 0, onChange, size = 22 }) {
  return (
    <div className="stars" role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => onChange(n)} className={n <= value ? 'is-on' : ''}>
          <Star size={size} fill={n <= value ? 'currentColor' : 'none'} />
        </button>
      ))}
    </div>
  );
}
