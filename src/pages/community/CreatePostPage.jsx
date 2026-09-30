import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import MovieSearchPicker from '../../components/movies/MovieSearchPicker';
import RatingStars from '../../components/movies/RatingStars';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getMovie } from '../../services/movieService';
import { socialService } from '../../services/socialService';

const MAX = 500;
export default function CreatePostPage() {
  const { user } = useAuth(); const toast = useToast(); const nav = useNavigate();
  const [params] = useSearchParams();
  const [body, setBody] = useState(''); const [movie, setMovie] = useState(null); const [rating, setRating] = useState(0); const [spoiler, setSpoiler] = useState(false);
  const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  useEffect(() => { const id = params.get('movie'); if (id) getMovie(id).then((r) => setMovie(r.movie)).catch(() => {}); }, [params]);

  async function submit(e) {
    e.preventDefault(); if (busy) return;
    if (!body.trim()) return setError('Write something before posting.');
    if (body.length > MAX) return setError(`Posts are limited to ${MAX} characters.`);
    setBusy(true); setError('');
    try { await socialService.createPost(user, { body: body.trim(), movie, rating: movie && rating ? rating : null, spoiler }); toast('Post published', 'success'); nav('/community'); }
    catch (er) { setError(er.message); setBusy(false); }
  }
  return (
    <div className="narrow">
      <div className="pagehead"><h1>New <em>post</em></h1></div>
      <form onSubmit={submit} className="panel formstack" noValidate>
        {error && <p className="notice notice--error" role="alert">{error}</p>}
        <label className="field"><span>What's on your mind?</span><textarea rows={5} value={body} onChange={(e) => setBody(e.target.value)} aria-invalid={body.length > MAX} /></label>
        <small className={body.length > MAX ? 'field__error' : 'muted'} aria-live="polite">{body.length}/{MAX}</small>
        {movie ? <div className="attached"><strong>{movie.title}</strong><Button type="button" size="sm" variant="ghost" onClick={() => { setMovie(null); setRating(0); }}>Remove</Button></div> : <MovieSearchPicker onPick={setMovie} label="Attach a movie (optional)" />}
        {movie && <div><strong style={{ fontSize: '.85rem' }}>Rating (optional)</strong><RatingStars value={rating} onChange={(n) => setRating(rating === n ? 0 : n)} /></div>}
        <label className="check"><input type="checkbox" checked={spoiler} onChange={(e) => setSpoiler(e.target.checked)} /><span>This post contains spoilers</span></label>
        <div className="modal__actions"><Button type="button" variant="secondary" onClick={() => nav(-1)} disabled={busy}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Publishing…' : 'Publish'}</Button></div>
      </form>
    </div>
  );
}
