import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';
import { EmptyState, ErrorState, Skeleton } from '../common/States';

const Skels = ({ n = 6 }) => Array.from({ length: n }, (_, i) => <div key={i} className="mcard"><Skeleton style={{ aspectRatio: '2/3' }} /><Skeleton style={{ height: 14, marginTop: 8 }} /></div>);

export function MovieGrid({ movies, loading, error, onRetry, empty, note }) {
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (loading) return <div className="mgrid"><Skels n={8} /></div>;
  if (!movies?.length) return empty || <EmptyState title="Nothing here yet" />;
  return <div className="mgrid">{movies.map((m) => <MovieCard key={m.id} movie={m} note={note?.(m)} />)}</div>;
}

export function MovieCarousel({ title, movies, loading, error, onRetry, sub }) {
  const ref = useRef(null);
  const scroll = (d) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: 'smooth' });
  return (
    <section className="carousel">
      <header className="carousel__header">
        <div className="carousel__heading">
          <h2>{title}</h2>
          {sub && <p>{sub}</p>}
        </div>

        <div className="carousel__controls">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scroll(-1)}
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scroll(1)}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </header>
      {error ? (
        <ErrorState error={error} onRetry={onRetry} />
      ) : (
        <div className="carousel__row" ref={ref}>
          {loading ? (
            <Skels />
          ) : movies?.length ? (
            movies.map((m) => <MovieCard key={m.id} movie={m} />)
          ) : (
            <p className="muted">No movies to show.</p>
          )}
        </div>
      )}
    </section>
  );
}
