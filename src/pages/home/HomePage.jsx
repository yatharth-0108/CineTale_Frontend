import { Link } from "react-router-dom";
import SearchBar from "../../components/common/SearchBar";
import { MovieCarousel } from "../../components/movies/MovieLists";
import MoviePoster from "../../components/movies/MoviePoster";
import MovieDNAWidget from "../../components/movies/MovieDNAWidget";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { useLibrary } from "../../context/LibraryContext";
import { useAsync } from "../../hooks/useAsync";
import { getSimilar, imageUrl } from "../../services/movieService";
import { getTrendingMovies } from "../../services/tmdbService";
import { recommendationService } from "../../services/recommendationService";

export default function HomePage() {
  const { user } = useAuth();
  const { interactions } = useLibrary();
  const trending = useAsync(
    async () => ({
      source: "tmdb",
      movies: await getTrendingMovies(),
    }),
    [],
  );
  const recs = useAsync(
    () => recommendationService.getRecommendations(user),
    [user.id],
  );
  const recent = Object.values(interactions)
    .filter((i) => i.movie)
    .sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""))
    .slice(0, 10);
  const lastLiked = recent.find((i) => i.type === "like")?.movie;
  const because = useAsync(
    () => (lastLiked ? getSimilar(lastLiked.id) : Promise.resolve(null)),
    [lastLiked?.id],
  );
  const hero = trending.data?.movies?.[0];
  const hour = new Date().getHours();
  const first = (user.fullName || user.username || "").split(" ")[0];

  return (
    <div className="cols">
      <div>
        <div className="home-main">
        <div className="pagehead"></div>
          <h1>
            {hour < 12
              ? "Good morning"
              : hour < 18
                ? "Good afternoon"
                : "Good evening"}
            {first && (
              <>
                , <em>{first}</em>
              </>
            )}
          </h1>
        </div>
        <SearchBar />
        {hero && (
          <div className="feature-banner" style={{ marginTop: "1.5rem" }}>
            {hero.backdrop_path && (
              <img
                className="feature-banner__img"
                src={imageUrl(hero.backdrop_path, "w1280")}
                alt=""
              />
            )}
            <div className="feature-banner__body">
              <p style={{ margin: 0, fontSize: ".8rem" }}>
                {trending.data.source === "demo"
                  ? "Sample featured film"
                  : "Trending now"}
              </p>
              <h2>{hero.title}</h2>
              <p>{hero.overview}</p>
              <Button to={`/movie/${hero.id}`} variant="secondary">
                View details
              </Button>
            </div>
          </div>
        )}
        <MovieCarousel
          title="Trending"
          sub={
            trending.data?.source === "demo"
              ? "Sample data (demo mode)"
              : "This week on TMDB"
          }
          movies={trending.data?.movies}
          loading={trending.loading}
          error={trending.error}
          onRetry={trending.reload}
        />
        <MovieCarousel
          title="Recommended for you"
          sub={
            recs.data?.source === "tmdb_fallback"
              ? "Popular films from TMDB"
              : recs.data?.source === "demo"
                ? "Demo shuffle, not real recommendations"
                : undefined
          }
          movies={recs.data?.movies}
          loading={recs.loading}
          error={recs.error}
          onRetry={recs.reload}
        />
        {lastLiked && (
          <MovieCarousel
            title={`Because you liked ${lastLiked.title}`}
            sub="Similar titles from TMDB"
            movies={because.data?.movies}
            loading={because.loading}
            error={because.error}
            onRetry={because.reload}
          />
        )}
        {recent.length > 0 && (
          <MovieCarousel
            title="Recently interacted with"
            movies={recent.map((i) => i.movie)}
          />
        )}
      </div>
      <aside className="sidecol" aria-label="Sidebar">
        <div className="panel">
          <MovieDNAWidget />
          <Link
            to="/for-you"
            className="auth__link"
            style={{ display: "inline-block", marginTop: ".5rem" }}
          >
            See your picks →
          </Link>
        </div>
        <div className="panel">
          <h3>Trending this week</h3>
          <ol className="trendlist">
            {(trending.data?.movies || []).slice(0, 6).map((m) => (
              <li key={m.id}>
                <Link to={`/movie/${m.id}`}>{m.title}</Link>
              </li>
            ))}
          </ol>
        </div>
      </aside>
    </div>
  );
}
