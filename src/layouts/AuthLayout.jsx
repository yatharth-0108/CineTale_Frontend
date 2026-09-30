import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Logo } from "./PublicLayout";
import MoviePoster from "../components/movies/MoviePoster";
import { MOCK_MOVIES } from "../constants/mockMovies";
import { getPopularMovies } from "../services/tmdbService";
import "./AuthLayout.css";

export default function AuthLayout() {
  const [movies, setMovies] = useState(MOCK_MOVIES.slice(2, 8));

  useEffect(() => {
    let active = true;

    async function loadMovies() {
      try {
        const data = await getPopularMovies(1);
        console.log("TMDB movies for login:", data);

        const results = Array.isArray(data) ? data : data?.results || [];

        const posters = results
          .filter((movie) => movie.posterPath || movie.poster_path)
          .slice(0, 6)
          .map((movie) => ({
            ...movie,
            poster_path: movie.posterPath || movie.poster_path,
            release_date: movie.releaseDate || movie.release_date,
          }));

        if (active && posters.length > 0) {
          setMovies(posters);
        }
      } catch (error) {
        console.error("Failed to load login posters:", error);
      }
    }

    loadMovies();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="auth">
      <aside className="auth__art" aria-hidden="true">
        <div className="auth__posters">
          {movies.map((movie) => (
            <MoviePoster key={movie.id} movie={movie} />
          ))}
        </div>

        <p className="auth__quote">
          Every film you love is a clue to the next one.
        </p>
      </aside>

      <section className="auth__panel">
        <Logo />
        <div className="auth__form">
          <Outlet />
        </div>
      </section>
    </div>
  );
}
