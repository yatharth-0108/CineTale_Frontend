import { config, isTmdbConfigured } from '../config/env';
import { MOCK_MOVIES } from '../constants/mockMovies';
import { TMDB_GENRES } from '../constants/genres';

export const IMG_BASE = 'https://image.tmdb.org/t/p';
export const imageUrl = (path, size = 'w500') => (path ? `${IMG_BASE}/${size}${path}` : null);

async function tmdb(path) {
  const res = await fetch(`${config.tmdbBaseUrl}${path}`, { headers: { Authorization: `Bearer ${config.tmdbToken}`, accept: 'application/json' } });
  if (res.status === 404) { const e = new Error('Movie not found'); e.status = 404; throw e; }
  if (!res.ok) throw new Error(`Movie data request failed (${res.status})`);
  return res.json();
}
const norm = (m) => ({
  id: m.id, title: m.title, overview: m.overview || '', poster_path: m.poster_path || null, backdrop_path: m.backdrop_path || null,
  release_date: m.release_date || '', vote_average: m.vote_average || 0, vote_count: m.vote_count, runtime: m.runtime,
  genres: m.genres ? m.genres.map((g) => g.name) : (m.genre_ids || []).map((id) => TMDB_GENRES[id]).filter(Boolean),
});
const list = async (path, mock) => {
  if (!isTmdbConfigured) return { movies: mock(), source: 'demo' };
  const d = await tmdb(path);
  return { movies: d.results.map(norm), source: 'tmdb', totalPages: d.total_pages };
};
const q = encodeURIComponent;

export const getTrending = (window = 'week') => list(`/trending/movie/${window}`, () => MOCK_MOVIES);
export const getPopular = (page = 1) => list(`/movie/popular?page=${page}`, () => [...MOCK_MOVIES].reverse());
export const getUpcoming = () => list('/movie/upcoming', () => MOCK_MOVIES.slice(0, 6));
export const getSimilar = (id) => list(`/movie/${id}/similar`, () => MOCK_MOVIES.filter((m) => m.id !== Number(id)).slice(0, 6));
export const discoverByGenre = (genreId, genreName, page = 1) => list(`/discover/movie?with_genres=${genreId}&sort_by=popularity.desc&page=${page}`, () => MOCK_MOVIES.filter((m) => m.genres.includes(genreName)));
export const searchMovies = (query, page = 1) => list(`/search/movie?query=${q(query)}&page=${page}`, () => MOCK_MOVIES.filter((m) => m.title.toLowerCase().includes(query.toLowerCase())));

/** Details with credits and trailer. Throws an error with status 404 if missing. */
export async function getMovie(id) {
  if (!isTmdbConfigured) {
    const movie = MOCK_MOVIES.find((m) => m.id === Number(id));
    if (!movie) { const e = new Error('Movie not found'); e.status = 404; throw e; }
    return { movie, director: null, cast: [], trailerKey: null, source: 'demo' };
  }
  const d = await tmdb(`/movie/${id}?append_to_response=credits,videos`);
  const trailer = d.videos?.results?.find((v) => v.site === 'YouTube' && v.type === 'Trailer');
  return {
    movie: norm(d), source: 'tmdb', trailerKey: trailer?.key || null,
    director: d.credits?.crew?.find((c) => c.job === 'Director')?.name || null,
    cast: (d.credits?.cast || []).slice(0, 8).map((c) => c.name),
  };
}
