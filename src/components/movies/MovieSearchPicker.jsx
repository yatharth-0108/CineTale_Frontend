import { useState } from 'react';
import Button from '../common/Button';
import { searchMovies } from '../../services/movieService';
import MoviePoster from './MoviePoster';
export default function MovieSearchPicker({ onPick, label = 'Search a movie' }) {
  const [q, setQ] = useState(''); const [res, setRes] = useState(null); const [err, setErr] = useState('');
  async function go(e) { e.preventDefault(); if (!q.trim()) return; setErr(''); try { setRes((await searchMovies(q.trim())).movies.slice(0, 6)); } catch (er) { setErr(er.message); } }
  return (
    <div className="picker">
      <div className="picker__row"><input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && go(e)} placeholder={label} aria-label={label} /><Button type="button" size="sm" variant="secondary" onClick={go}>Search</Button></div>
      {err && <p className="field__error" role="alert">{err}</p>}
      {res && (res.length === 0 ? <p className="muted">No results.</p> : <ul>{res.map((m) => <li key={m.id}><button type="button" onClick={() => { onPick(m); setRes(null); setQ(''); }}><div style={{ width: 36 }}><MoviePoster movie={m} size="w92" /></div><span>{m.title} <small>{m.release_date?.slice(0, 4)}</small></span></button></li>)}</ul>)}
    </div>
  );
}
