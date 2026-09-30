import { Link, useParams } from 'react-router-dom';
import { Share2, Play, Star } from 'lucide-react';
import Button from '../../components/common/Button';
import { ErrorState, Skeleton } from '../../components/common/States';
import MoviePoster from '../../components/movies/MoviePoster';
import RatingStars from '../../components/movies/RatingStars';
import { LikeButton, DislikeButton, WatchlistButton } from '../../components/movies/MovieActions';
import { MovieCarousel } from '../../components/movies/MovieLists';
import { useLibrary } from '../../context/LibraryContext';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { getMovie, getSimilar, imageUrl } from '../../services/movieService';
import AddToCollection from '../../components/movies/AddToCollection';
import { ReviewCard } from '../../components/social/Social';
import { EmptyState } from '../../components/common/States';
import { useAuth } from '../../context/AuthContext';
import { reviewService } from '../../services/reviewService';
import NotFound from '../NotFound';

export default function MovieDetailPage() {
  const { movieId } = useParams();
  const toast = useToast();
  const { stateOf, setRating } = useLibrary();
  const { data, loading, error, reload } = useAsync(() => getMovie(movieId), [movieId]);
  const similar = useAsync(() => getSimilar(movieId), [movieId]);
  const { user } = useAuth();
  const reviews = useAsync(() => reviewService.forMovie(user, movieId), [movieId, user.id]);

  if (error?.status === 404) return <NotFound />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading) return <><Skeleton style={{ height: 340 }} /><Skeleton style={{ height: 200, marginTop: 24 }} /></>;

  const { movie, director, cast, trailerKey, source } = data;
  const rating = stateOf(movie.id).rating || 0;
  const share = async () => {
    const url = window.location.href;
    try { if (navigator.share) await navigator.share({ title: movie.title, url }); else { await navigator.clipboard.writeText(url); toast('Link copied', 'success'); } }
    catch { /* dismissed */ }
  };

  return (
    <>
      <div className="md-hero">{movie.backdrop_path && <img src={imageUrl(movie.backdrop_path, 'w1280')} alt="" />}</div>
      <div className="md">
        <div className="md__poster"><MoviePoster movie={movie} size="w500" /></div>
        <div className="md__info">
          <h1 style={{ color: 'var(--ink)' }}>{movie.title}</h1>
          <div className="md__meta">
            {movie.release_date && <span>{movie.release_date.slice(0, 4)}</span>}
            {movie.runtime > 0 && <span>· {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>}
            {reviews.data?.length >= 5 && <span title="Average of CineTale reviews">CineTale {(reviews.data.reduce((a, r) => a + r.rating, 0) / reviews.data.length).toFixed(1)}/5 ({reviews.data.length})</span>}
            {movie.vote_average > 0 && <span title="Average rating from TMDB users"><Star size={14} fill="currentColor" /> {movie.vote_average.toFixed(1)} {source === 'demo' ? '(sample rating)' : 'TMDB'}</span>}
          </div>
          <div className="chipbar">{movie.genres.map((g) => <span key={g} className="gchip">{g}</span>)}</div>
          <p>{movie.overview || 'No overview available.'}</p>
          <div className="md__actions">
            <LikeButton movie={movie} label /><DislikeButton movie={movie} label /><WatchlistButton movie={movie} label />
            <AddToCollection movie={movie} /><Button size="sm" to={`/movie/${movie.id}/review`}>Write a review</Button>
            <button className="act" onClick={share}><Share2 size={18} /> Share</button>
            {trailerKey && <Button size="sm" variant="secondary" href={`https://www.youtube.com/watch?v=${trailerKey}`} target="_blank" rel="noopener noreferrer"><Play size={15} /> Trailer</Button>}
          </div>
          <div><strong style={{ fontSize: '.85rem' }}>Your rating</strong><RatingStars value={rating} onChange={(n) => setRating(movie, n)} /></div>
          <dl>
            {director && <><dt>Director</dt><dd>{director}</dd></>}
            {cast.length > 0 && <><dt>Cast</dt><dd>{cast.join(', ')}</dd></>}
          </dl>
          {source === 'demo' && <p className="muted" style={{ fontSize: '.85rem' }}>Demo mode: credits and trailers need TMDB. <Link to="/discover">Back to Discover</Link></p>}
        </div>
      </div>
      <section style={{ marginTop: '3rem' }} className="narrow-left"><h2 style={{ fontSize: '1.7rem', marginBottom: '1rem' }}>Community reviews</h2>
        {reviews.error ? <ErrorState error={reviews.error} onRetry={reviews.reload} /> : reviews.loading ? <Skeleton style={{ height: 120 }} /> : reviews.data.length === 0 ? <EmptyState title="No reviews yet" message="Be the first to share your take." action={{ label: 'Write a review', to: `/movie/${movie.id}/review` }} /> : <div className="feed">{reviews.data.map((r) => <ReviewCard key={r.id} review={r} />)}</div>}
      </section>
      <div style={{ marginTop: '3rem' }}><MovieCarousel title="More like this" sub="Similar titles from TMDB" movies={similar.data?.movies} loading={similar.loading} error={similar.error} onRetry={similar.reload} /></div>
    </>
  );
}
