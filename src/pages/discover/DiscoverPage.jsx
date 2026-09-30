import { useState } from "react";
import SearchBar from "../../components/common/SearchBar";
import { MovieCarousel, MovieGrid } from "../../components/movies/MovieLists";
import { useAsync } from "../../hooks/useAsync";
import {
  discoverByGenre,
  getPopular,
  getTrending,
  getUpcoming,
} from "../../services/movieService";
import { recommendationService } from "../../services/recommendationService";
import { GENRE_IDS, MOOD_GENRES } from "../../constants/genres";

const GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
];

export default function DiscoverPage() {
  const [genre, setGenre] = useState(null);
  const [mood, setMood] = useState(null);

  const trending = useAsync(() => getTrending(), []);
  const popular = useAsync(() => getPopular(), []);
  const upcoming = useAsync(() => getUpcoming(), []);
  const modelDemo = useAsync(
    () => recommendationService.getModelDemoRecommendations(1, 10),
    [],
  );
  console.log(
    "SVD MOVIE DETAILS:",
    JSON.stringify(modelDemo.data?.movies, null, 2),
  );
  const browse = useAsync(() => {
    const g = genre || (mood && MOOD_GENRES[mood][0]);
    return g ? discoverByGenre(GENRE_IDS[g], g) : Promise.resolve(null);
  }, [genre, mood]);

  const demo = trending.data?.source === "demo";
  const label = genre || (mood && `${mood} (${MOOD_GENRES[mood].join(" / ")})`);

  return (
    <>
      <div className="pagehead">
        <h1>
          Discover <em>movies</em>
        </h1>
        <p>
          {demo
            ? "Demo mode: sample titles."
            : "Live from TMDB & CineTale FastAPI Recommendation Backend."}
        </p>
      </div>

      <SearchBar />

      <h2 style={{ fontSize: "1.4rem", marginTop: "2rem" }}>Browse by genre</h2>
      <div className="chipbar">
        {GENRES.map((g) => (
          <button
            key={g}
            className={`gchip ${genre === g ? "is-on" : ""}`}
            aria-pressed={genre === g}
            onClick={() => {
              setMood(null);
              setGenre(genre === g ? null : g);
            }}
          >
            {g}
          </button>
        ))}
      </div>

      <h2 style={{ fontSize: "1.4rem" }}>Browse by mood</h2>
      <p className="muted" style={{ margin: ".25rem 0 0", fontSize: ".85rem" }}>
        Moods are shortcuts to genre combinations.
      </p>
      <div className="chipbar">
        {Object.keys(MOOD_GENRES).map((m) => (
          <button
            key={m}
            className={`gchip ${mood === m ? "is-on" : ""}`}
            aria-pressed={mood === m}
            onClick={() => {
              setGenre(null);
              setMood(mood === m ? null : m);
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {label && (
        <>
          <h2 style={{ fontSize: "1.7rem", margin: "1.5rem 0 1rem" }}>
            {label}
          </h2>
          <MovieGrid
            movies={browse.data?.movies}
            loading={browse.loading}
            error={browse.error}
            onRetry={browse.reload}
          />
        </>
      )}

      {/* Explicitly Labeled SVD Model Preview Demo Section */}
      <MovieCarousel
        title="Beyond the Watchlist"
        sub="Explicit preview of predictions from the trained SVD Collaborative Filtering model (FastAPI Backend)."
        movies={modelDemo.data?.movies}
        loading={modelDemo.loading}
        error={modelDemo.error}
        onRetry={modelDemo.reload}
      />

      <MovieCarousel
        title="Trending"
        movies={trending.data?.movies}
        loading={trending.loading}
        error={trending.error}
        onRetry={trending.reload}
      />
      <MovieCarousel
        title="Popular"
        movies={popular.data?.movies}
        loading={popular.loading}
        error={popular.error}
        onRetry={popular.reload}
      />
      <MovieCarousel
        title="Upcoming"
        movies={upcoming.data?.movies}
        loading={upcoming.loading}
        error={upcoming.error}
        onRetry={upcoming.reload}
      />
    </>
  );
}
