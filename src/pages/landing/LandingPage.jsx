import { useEffect, useState } from 'react';
import { Heart, Users, Dna, Sparkles, MessageCircle, Popcorn } from 'lucide-react';
import Button from '../../components/common/Button';
import MoviePoster from '../../components/movies/MoviePoster';
import { getTrending } from '../../services/movieService';
import { MOCK_MOVIES } from '../../constants/mockMovies';
import './LandingPage.css';

const STEPS = [
  ['Tell us your taste', 'Pick genres and a few favorites. Every like, dislike and rating sharpens your Movie DNA.'],
  ['Meet your taste-twins', 'Collaborative filtering finds people who love what you love, then surfaces what they loved next.'],
  ['Watch, review, share', 'Save to your watchlist, write reviews and follow friends with great taste.'],
];
const FEATURES = [
  [Dna, 'Movie DNA', 'A living portrait of your taste: genres, decades and moods, built only from what you actually do.', 'var(--mint)'],
  [Sparkles, 'Personal picks', 'Recommendations from people with similar taste, not just what is popular.', 'var(--lavender)'],
  [Users, 'Movie rooms', 'Invite friends, vote on suggestions and land on a film everyone will enjoy.', 'var(--peach)'],
  [MessageCircle, 'Real conversation', 'Reviews, ratings and discussions from people who care about film.', 'var(--yellow)'],
];

export default function LandingPage() {
  const [state, setState] = useState({ movies: MOCK_MOVIES, source: 'demo' });
  useEffect(() => { getTrending().then(setState).catch(() => {}); }, []);
  const m = state.movies.slice(0, 8);

  return (
    <>
      <section className="hero container" id="top">
        <div className="hero__copy">
          <p className="eyebrow"><Popcorn size={16} /> Social movie discovery</p>
          <h1>Find the films that <em>feel</em> like <em>you.</em></h1>
          <p className="hero__lead">CineTale learns your taste from every like, rating and review, then pairs it with people who watch like you. Discover better films, and share them with friends.</p>
          <div className="hero__cta">
            <Button to="/signup" size="lg">Discover Your Movie DNA</Button>
            <Button href="#explore" variant="secondary" size="lg">Explore Movies</Button>
          </div>
        </div>
        <div className="hero__collage">
          {m.slice(0, 5).map((mv, i) => <div key={mv.id} className={`collage__item c${i}`}><MoviePoster movie={mv} /></div>)}
          <div className="hero__preview">
            <span className="hero__preview-label">Picked for you</span>
            <strong>{m[2]?.title}</strong>
            <span>{state.source === 'demo' ? 'Sample preview' : 'From trending on TMDB'}</span>
          </div>
        </div>
      </section>

      <section className="section container" id="explore">
        <h2>Trending <em>this week</em></h2>
        {state.source === 'demo' && <p className="note">Sample titles shown. Connect TMDB to see real artwork.</p>}
        <div className="rail">{m.map((mv) => <div key={mv.id} className="rail__item"><MoviePoster movie={mv} /></div>)}</div>
      </section>

      <section className="section container" id="how">
        <h2>How it <em>works</em></h2>
        <ol className="steps">{STEPS.map(([t, d], i) => <li key={t}><span>0{i + 1}</span><h3>{t}</h3><p>{d}</p></li>)}</ol>
      </section>

      <section className="section container" id="community">
        <h2>Built for <em>movie lovers</em></h2>
        <div className="features">
          {FEATURES.map(([Icon, t, d, bg]) => (
            <article key={t} className="feature" style={{ background: bg }}><Icon size={26} /><h3>{t}</h3><p>{d}</p></article>
          ))}
        </div>
      </section>

      <section className="cta container">
        <Heart size={28} />
        <h2>Your next favorite film is <em>waiting.</em></h2>
        <Button to="/signup" size="lg">Get Started</Button>
      </section>
    </>
  );
}
