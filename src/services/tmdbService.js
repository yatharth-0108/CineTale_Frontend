const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

async function tmdbRequest(endpoint) {
  if (!API_KEY) {
    throw new Error("TMDB API key is missing. Check your .env.local file.");
  }

  const separator = endpoint.includes("?") ? "&" : "?";

  const response = await fetch(
    `${BASE_URL}${endpoint}${separator}api_key=${API_KEY}`,
  );

  if (!response.ok) {
    throw new Error(`TMDB request failed: ${response.status}`);
  }

  return response.json();
}

export function getPosterUrl(posterPath) {
  if (!posterPath) {
    return null;
  }

  return `${IMAGE_BASE_URL}${posterPath}`;
}

export async function getPopularMovies(page = 1) {
  const data = await tmdbRequest(`/movie/popular?language=en-US&page=${page}`);

  return data.results.map((movie) => ({
    id: movie.id,
    tmdbId: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterPath: movie.poster_path,
    posterUrl: getPosterUrl(movie.poster_path),
    backdropUrl: movie.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
      : null,
    releaseDate: movie.release_date,
    releaseYear: movie.release_date ? movie.release_date.slice(0, 4) : "N/A",
    rating: movie.vote_average,
    genreIds: movie.genre_ids,
  }));
}

export async function searchMovies(query) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return [];
  }

  const data = await tmdbRequest(
    `/search/movie?language=en-US&query=${encodeURIComponent(trimmedQuery)}`,
  );

  return data.results.map((movie) => ({
    id: movie.id,
    tmdbId: movie.id,
    title: movie.title,
    overview: movie.overview,
    posterPath: movie.poster_path,
    posterUrl: getPosterUrl(movie.poster_path),
    releaseDate: movie.release_date,
    releaseYear: movie.release_date ? movie.release_date.slice(0, 4) : "N/A",
    rating: movie.vote_average,
    genreIds: movie.genre_ids,
  }));
}
export async function getTrendingMovies() {
  const data = await tmdbRequest("/trending/movie/week?language=en-US");

  return data.results.map((movie) => ({
    id: movie.id,
    tmdbId: movie.id,
    title: movie.title,
    overview: movie.overview,

    // Fields used by your existing CineTale components
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    release_date: movie.release_date,
    vote_average: movie.vote_average,

    // Fields provided by your TMDB service
    posterPath: movie.poster_path,
    posterUrl: getPosterUrl(movie.poster_path),
    backdropUrl: movie.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
      : null,
    releaseDate: movie.release_date,
    releaseYear: movie.release_date ? movie.release_date.slice(0, 4) : "N/A",
    rating: movie.vote_average,
    genreIds: movie.genre_ids,
  }));
}
