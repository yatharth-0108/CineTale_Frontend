import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { ErrorState, Skeleton } from '../../components/common/States';
import MoviePoster from '../../components/movies/MoviePoster';
import RatingStars from '../../components/movies/RatingStars';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { getMovie } from '../../services/movieService';
import { reviewService } from '../../services/reviewService';
import { socialService } from '../../services/socialService';
import NotFound from '../NotFound';

export default function WriteReviewPage() {
  const { movieId } = useParams(); const { user } = useAuth(); const toast = useToast(); const nav = useNavigate(); const lib = useLibrary();
  const { data, loading, error, reload } = useAsync(() => getMovie(movieId), [movieId]);
  const [f, setF] = useState({ rating: 0, title: '', body: '', spoiler: false });
  const [errs, setErrs] = useState({}); const [busy, setBusy] = useState(false); const [serverErr, setServerErr] = useState('');
  if (error?.status === 404) return <NotFound />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (loading) return <Skeleton style={{ height: 300 }} />;
  const { movie } = data;

  async function submit(e) {
    e.preventDefault(); if (busy) return;
    const v = { rating: f.rating ? '' : 'Choose a star rating.', title: f.title.trim().length < 3 ? 'Add a short title (3+ characters).' : '', body: f.body.trim().length < 20 ? 'Write at least 20 characters.' : '' };
    setErrs(v); if (Object.values(v).some(Boolean)) return;
    setBusy(true); setServerErr('');
    try {
      const review = await reviewService.create(user, { movie, rating: f.rating, title: f.title.trim(), body: f.body.trim(), spoiler: f.spoiler });
      lib.setRating(movie, f.rating);
      try { await socialService.createPost(user, { type: 'review', body: `${review.title}: ${review.body}`, movie, rating: review.rating, spoiler: review.spoiler }); } catch { /* review is saved; feed post is best-effort */ }
      toast('Review published', 'success'); nav(`/movie/${movie.id}`);
    } catch (er) { setServerErr(er.message); setBusy(false); }
  }
  return (
    <div className="narrow">
      <div className="pagehead"><h1>Review <em>{movie.title}</em></h1></div>
      <form onSubmit={submit} className="panel formstack" noValidate>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}><div style={{ width: 80 }}><MoviePoster movie={movie} size="w185" /></div><span className="muted">{movie.release_date?.slice(0, 4)} · {movie.genres.join(', ')}</span></div>
        {serverErr && <p className="notice notice--error" role="alert">{serverErr}</p>}
        <div><strong style={{ fontSize: '.85rem' }}>Your rating</strong><RatingStars value={f.rating} onChange={(n) => setF({ ...f, rating: n })} />{errs.rating && <p className="field__error" role="alert">{errs.rating}</p>}</div>
        <Input label="Title" value={f.title} maxLength={80} onChange={(e) => setF({ ...f, title: e.target.value })} error={errs.title} />
        <label className="field"><span>Review</span><textarea rows={7} value={f.body} maxLength={3000} onChange={(e) => setF({ ...f, body: e.target.value })} aria-invalid={Boolean(errs.body)} />{errs.body && <p className="field__error" role="alert">{errs.body}</p>}</label>
        <label className="check"><input type="checkbox" checked={f.spoiler} onChange={(e) => setF({ ...f, spoiler: e.target.checked })} /><span>Contains spoilers</span></label>
        <div className="modal__actions"><Button type="button" variant="secondary" onClick={() => nav(-1)} disabled={busy}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Submitting…' : 'Submit review'}</Button></div>
      </form>
    </div>
  );
}
