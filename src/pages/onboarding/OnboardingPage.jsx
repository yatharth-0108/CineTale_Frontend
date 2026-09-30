import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, ThumbsUp, ThumbsDown } from 'lucide-react';
import Button from '../../components/common/Button';
import MoviePoster from '../../components/movies/MoviePoster';
import { useAuth } from '../../context/AuthContext';
import { getPopular } from '../../services/movieService';
import { userService } from '../../services/userService';
import { GENRES, MOODS } from '../../constants/onboarding';
import './OnboardingPage.css';

const STEPS = ['Welcome', 'Genres', 'Favorites', 'Dislikes', 'Moods', 'People', 'Finish'];
const toggle = (arr, v) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

export default function OnboardingPage() {
  const { user, markOnboarded, isDemo } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [p, setP] = useState({ genres: [], likedMovieIds: [], dislikedMovieIds: [], moods: [], followedIds: [] });
  const [movies, setMovies] = useState({ list: [], source: 'demo', error: '' });
  const [people, setPeople] = useState({ people: [], demo: true });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getPopular().then((r) => setMovies({ list: r.movies, source: r.source, error: '' })).catch(() => setMovies({ list: [], source: '', error: 'Could not load movies. You can skip this step.' }));
    userService.getSuggestedUsers(user).then(setPeople).catch(() => {});
  }, [user]);

  const like = (id) => setP((s) => ({ ...s, likedMovieIds: toggle(s.likedMovieIds, id), dislikedMovieIds: s.dislikedMovieIds.filter((x) => x !== id) }));
  const dislike = (id) => setP((s) => ({ ...s, dislikedMovieIds: toggle(s.dislikedMovieIds, id), likedMovieIds: s.likedMovieIds.filter((x) => x !== id) }));

  const need = { 1: p.genres.length < 3 && 'Pick at least 3 genres.', 2: p.likedMovieIds.length < 3 && movies.list.length >= 3 && 'Pick at least 3 favorites.', 4: p.moods.length < 1 && 'Pick at least one mood.' }[step];
  const optional = step === 3 || step === 5;

  async function finish() {
    setSaving(true); setError('');
    try { await userService.savePreferences(user, p); markOnboarded(); nav('/home', { replace: true }); }
    catch (e) { setError(e.message); setSaving(false); }
  }

  const MovieGrid = ({ mode }) => (
    <div className="ob-movies">
      {movies.list.map((m) => {
        const active = (mode === 'like' ? p.likedMovieIds : p.dislikedMovieIds).includes(m.id);
        return (
          <button key={m.id} type="button" className={`ob-movie ${active ? 'is-on' : ''}`} aria-pressed={active} onClick={() => (mode === 'like' ? like(m.id) : dislike(m.id))}>
            <MoviePoster movie={m} size="w342" />
            <span className="ob-movie__badge">{active ? <Check size={16} /> : mode === 'like' ? <ThumbsUp size={16} /> : <ThumbsDown size={16} />}</span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="ob">
      <div className="ob__bar" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1} aria-label={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}><i style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} /></div>
      <div className="ob__card">
        <p className="ob__step">Step {step + 1} of {STEPS.length}</p>
        {step === 0 && (<><h1>Welcome to <em>CineTale</em>{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}</h1><p>A few quick questions give us your first taste signals, so recommendations feel personal from day one. It takes about a minute.</p></>)}
        {step === 1 && (<><h1>Which genres <em>do you love?</em></h1><p>Pick at least 3.</p><div className="chips">{GENRES.map((g) => <button key={g} type="button" className={`chip ${p.genres.includes(g) ? 'is-on' : ''}`} aria-pressed={p.genres.includes(g)} onClick={() => setP({ ...p, genres: toggle(p.genres, g) })}>{g}</button>)}</div></>)}
        {step === 2 && (<><h1>Pick some <em>favorites</em></h1><p>Choose at least 3 movies you love.{movies.source === 'demo' && ' (Sample titles in demo mode.)'}</p>{movies.error && <p className="notice notice--error" role="alert">{movies.error}</p>}<MovieGrid mode="like" /></>)}
        {step === 3 && (<><h1>Any you <em>didn't enjoy?</em></h1><p>Optional, but it helps us avoid misses.</p><MovieGrid mode="dislike" /></>)}
        {step === 4 && (<><h1>What <em>mood</em> are you usually in?</h1><p>Pick at least one.</p><div className="chips">{MOODS.map((g) => <button key={g} type="button" className={`chip ${p.moods.includes(g) ? 'is-on' : ''}`} aria-pressed={p.moods.includes(g)} onClick={() => setP({ ...p, moods: toggle(p.moods, g) })}>{g}</button>)}</div></>)}
        {step === 5 && (<><h1>Follow some <em>movie lovers</em></h1><p>Optional.</p>
          {people.people.length === 0 ? <p className="notice notice--info">No suggestions yet. You can find people to follow after you finish.</p> : (<>
            {people.demo && <p className="notice notice--info">Sample profiles for demo mode.</p>}
            <ul className="ob-people">{people.people.map((u) => <li key={u.id}><span><strong>{u.name}</strong> @{u.username}</span><Button size="sm" variant={p.followedIds.includes(u.id) ? 'primary' : 'secondary'} aria-pressed={p.followedIds.includes(u.id)} onClick={() => setP({ ...p, followedIds: toggle(p.followedIds, u.id) })}>{p.followedIds.includes(u.id) ? 'Following' : 'Follow'}</Button></li>)}</ul></>)}</>)}
        {step === 6 && (<><h1>You're <em>all set</em></h1><p>{p.genres.length} genres, {p.likedMovieIds.length} favorites and {p.moods.length} moods saved to your Movie DNA{isDemo ? ' (stored in this browser in demo mode)' : ''}.</p>{error && <p className="notice notice--error" role="alert">{error}</p>}</>)}

        {need && <p className="field__error" role="status">{need}</p>}
        <div className="ob__nav">
          <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={step === 0 || saving}>Back</Button>
          <span>
            {optional && <Button variant="ghost" onClick={() => setStep(step + 1)}>Skip</Button>}
            {step < 6 ? <Button onClick={() => setStep(step + 1)} disabled={Boolean(need)}>{step === 0 ? "Let's go" : 'Next'}</Button>
              : <Button onClick={finish} disabled={saving}>{saving ? 'Saving…' : 'Finish'}</Button>}
          </span>
        </div>
      </div>
    </div>
  );
}
