import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import MoviePoster from './MoviePoster';
import { WatchlistButton } from './MovieActions';

export default function MovieCard({ movie, note }) {
  return (
    <article className="mcard">
      <div className="mcard__art">
        <Link to={`/movie/${movie.id}`} aria-label={`${movie.title} details`}><MoviePoster movie={movie} /></Link>
        <div className="mcard__save"><WatchlistButton movie={movie} /></div>
      </div>
      <Link to={`/movie/${movie.id}`} className="mcard__title">{movie.title}</Link>
      <p className="mcard__meta">{movie.release_date?.slice(0, 4)}{movie.vote_average > 0 && <><span> · </span><Star size={12} fill="currentColor" /> {movie.vote_average.toFixed(1)}</>}</p>
      {note && <p className="mcard__note">{note}</p>}
    </article>
  );
}
