import { config } from "../config/env";
import { getPopularMovies, searchMovies } from "./tmdbService";
import { interactionService } from "./interactionService";

const DEFAULT_RECS_API = "http://127.0.0.1:8000";

const getApiUrl = () => config.recsApiUrl || DEFAULT_RECS_API;

const GENRES = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
};

const GENRE_IDS_BY_NAME = Object.fromEntries(
  Object.entries(GENRES).map(([id, name]) => [name.toLowerCase(), Number(id)]),
);

function getGenreIds(movie = {}) {
  const ids = movie.genreIds || movie.genre_ids;

  if (Array.isArray(ids) && ids.length > 0) {
    return ids.map(Number).filter(Number.isFinite);
  }

  if (!Array.isArray(movie.genres)) {
    return [];
  }

  return movie.genres
    .map((genre) => {
      if (typeof genre === "object" && genre !== null) {
        return Number(genre.id);
      }

      return GENRE_IDS_BY_NAME[String(genre).toLowerCase()];
    })
    .filter(Number.isFinite);
}

function formatMovie(movie) {
  const genreIds = getGenreIds(movie);

  return {
    ...movie,
    id: movie.tmdbId ?? movie.id,
    tmdbId: movie.tmdbId ?? movie.id,

    poster_path: movie.posterPath ?? movie.poster_path ?? null,

    rating: movie.rating ?? movie.vote_average ?? 0,
    vote_average: movie.rating ?? movie.vote_average ?? 0,

    backdrop_path: movie.backdropUrl
      ? movie.backdropUrl.replace("https://image.tmdb.org/t/p/w1280", "")
      : (movie.backdrop_path ?? null),

    release_date: movie.releaseDate ?? movie.release_date ?? "",

    genreIds,
    genres: genreIds.map((id) => GENRES[id]).filter(Boolean),
  };
}

// Convert MovieLens titles into searchable TMDB titles.
// Example: "Wrong Trousers, The (1993)" -> "The Wrong Trousers"
function getMovieInfo(title) {
  const originalTitle = String(title || "").trim();

  const yearMatch = originalTitle.match(/\((\d{4})\)\s*$/);
  const year = yearMatch ? yearMatch[1] : "";

  let cleanTitle = yearMatch
    ? originalTitle.slice(0, yearMatch.index).trim()
    : originalTitle;

  // Remove alternate titles in trailing parentheses.
  // Example: "Seven Samurai (The Magnificent Seven)"
  // becomes "Seven Samurai".
  while (/\s*\([^()]*\)\s*$/.test(cleanTitle)) {
    cleanTitle = cleanTitle.replace(/\s*\([^()]*\)\s*$/, "").trim();
  }

  // Move trailing articles to the beginning.
  const articleMatch = cleanTitle.match(/^(.*),\s*(The|A|An)$/i);

  if (articleMatch) {
    cleanTitle = `${articleMatch[2]} ${articleMatch[1]}`;
  }

  return {
    query: cleanTitle.trim(),
    year,
  };
}

function normalizeTitle(title) {
  return String(title || "")
    .replace(/^(The|A|An)\s+/i, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

// Find a matching TMDB movie without changing SVD predictions.
async function findTmdbMatch(originalTitle, releaseYear) {
  const { query, year } = getMovieInfo(originalTitle);

  if (!query) {
    return null;
  }

  try {
    const results = await searchMovies(query);

    const normalizedQuery = normalizeTitle(query);

    const exactMatches = results.filter(
      (candidate) => normalizeTitle(candidate.title) === normalizedQuery,
    );

    // Prefer matching both title and release year.
    const yearMatch = exactMatches.find(
      (candidate) =>
        String(candidate.releaseYear || "") ===
        String(releaseYear || year || ""),
    );

    // If no year match exists, use an exact title match.
    const matchedMovie = yearMatch || exactMatches[0] || null;

    if (!matchedMovie) {
      console.warn(`No exact TMDB title match found for "${originalTitle}".`);
      return null;
    }

    return matchedMovie;
  } catch (error) {
    console.warn(`TMDB lookup failed for "${originalTitle}":`, error);

    return null;
  }
}

export const recommendationService = {
  async getRecommendations(user, { limit = 10, refresh = false } = {}) {
    if (!user?.id) {
      throw new Error("Please log in to load recommendations.");
    }

    // Load saved interactions from Supabase.
    const interactions = await interactionService.getAll(user);

    const genreScores = {};
    const seenMovieIds = new Set();

    // Build genre preferences using likes, dislikes and ratings.
    for (const [movieId, interaction] of Object.entries(interactions)) {
      seenMovieIds.add(String(movieId));

      const type = String(interaction.type || "").toLowerCase();
      const rating = Number(interaction.rating);

      const disliked =
        type === "dislike" ||
        type === "disliked" ||
        (Number.isFinite(rating) && rating > 0 && rating <= 2);

      const liked =
        type === "like" ||
        type === "liked" ||
        type === "favorite" ||
        type === "favourite" ||
        (Number.isFinite(rating) && rating >= 4);

      const weight = disliked ? -3 : liked ? 2 : 0;

      if (weight === 0) continue;

      for (const genreId of getGenreIds(interaction.movie)) {
        genreScores[genreId] = (genreScores[genreId] || 0) + weight;
      }
    }

    // Fetch real movies from TMDB.
    const pages = await Promise.all([
      getPopularMovies(1),
      getPopularMovies(2),
      getPopularMovies(3),
    ]);

    const candidates = pages
      .flat()
      .map(formatMovie)
      .filter((movie) => {
        if (seenMovieIds.has(String(movie.id))) {
          return false;
        }

        if (!movie.genreIds || movie.genreIds.length === 0) {
          return false;
        }

        if (!movie.rating || movie.rating <= 0) {
          return false;
        }

        return true;
      });

    const hasPreferenceSignal = Object.values(genreScores).some(
      (score) => score !== 0,
    );

    // Rank movies using genre preferences and TMDB ratings.
    const scored = candidates.map((movie) => {
      const genreIds = getGenreIds(movie);

      const preferenceScore = genreIds.reduce(
        (total, id) => total + (genreScores[id] || 0),
        0,
      );

      const matchedGenres = genreIds.filter((id) => (genreScores[id] || 0) > 0);

      return {
        ...movie,
        preferenceScore,
        matchedGenres,
      };
    });

    // If preferences exist, keep movies with positive scores.
    // Otherwise, show popular movies as a fallback.
    const eligible = hasPreferenceSignal
      ? scored.filter((movie) => movie.preferenceScore > 0)
      : scored;

    const ranked = eligible
      .sort((a, b) => {
        if (!hasPreferenceSignal) {
          return (b.rating || 0) - (a.rating || 0);
        }

        const scoreA = a.preferenceScore * 2 + (a.rating || 0) / 10;

        const scoreB = b.preferenceScore * 2 + (b.rating || 0) / 10;

        return scoreB - scoreA;
      })
      .slice(0, limit);

    // Format results for existing movie cards.
    const movies = ranked.map((movie) => ({
      ...formatMovie(movie),
      preferenceScore: movie.preferenceScore,
      reason:
        hasPreferenceSignal && movie.matchedGenres.length > 0
          ? `Matches your taste: ${movie.matchedGenres
              .map((id) => GENRES[id])
              .join(", ")}`
          : hasPreferenceSignal
            ? "Recommended based on your overall genre preferences"
            : "Popular movie from TMDB",
    }));

    return {
      movies,
      source: hasPreferenceSignal ? "tmdb_genre_personalized" : "tmdb_popular",
      isFallback: !hasPreferenceSignal,
      isPersonalized: hasPreferenceSignal,
      message: hasPreferenceSignal
        ? "Ranked using your saved movie interactions."
        : "Like or dislike movies with genre information to personalize recommendations.",
      userId: user.id,
    };
  },

  // SVD model recommendations from the original MovieLens backend.
  async getModelDemoRecommendations(modelUserId = 1, limit = 10) {
    const url =
      `${getApiUrl()}/recommend/` +
      `${encodeURIComponent(modelUserId)}?limit=${limit}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`SVD recommendation service error (${response.status}).`);
    }

    const data = await response.json();
    const recommendations = data.recommendations || [];

    // Fetch TMDB metadata for posters while preserving SVD ranking.
    const movies = await Promise.all(
      recommendations.map(async (movie) => {
        const originalTitle = movie.title || "";
        const releaseYear = String(movie.release_year ?? "");

        const matchedMovie = await findTmdbMatch(originalTitle, releaseYear);

        return {
          // TMDB ID for opening the movie details page.
          id: matchedMovie?.tmdbId ?? matchedMovie?.id ?? null,

          // Preserve the original MovieLens ID for SVD.
          movie_id: movie.movie_id,
          movieLensId: movie.movie_id,

          // Keep the original title and year.
          title: originalTitle,
          release_date: releaseYear,
          release_year: releaseYear,

          // Keep the SVD predicted rating.
          vote_average:
            typeof movie.predicted_rating === "number"
              ? Number(movie.predicted_rating.toFixed(1))
              : 0,

          predicted_rating: movie.predicted_rating,

          genres:
            typeof movie.genres === "string"
              ? movie.genres.split("|")
              : movie.genres || [],

          // TMDB artwork metadata.
          poster_path: matchedMovie?.posterPath || null,
          posterUrl: matchedMovie?.posterUrl || null,
          tmdbId: matchedMovie?.tmdbId || matchedMovie?.id || null,

          // Preserve the SVD explanation.
          reason:
            typeof movie.predicted_rating === "number"
              ? `SVD Predicted Rating: ${movie.predicted_rating.toFixed(2)} ★`
              : "SVD model recommendation",
        };
      }),
    );

    return {
      movies,
      source: "fastapi_svd",
      isFallback: Boolean(data.is_fallback),
      userId: data.user_id,
    };
  },

  // Supabase is the source of truth for user interactions.
  // The current FastAPI backend has no POST /interactions endpoint.
  async submitInteraction() {
    return;
  },
};
