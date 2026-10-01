const e = import.meta.env;

export const config = {
  // Supabase Configuration
  supabaseUrl: e.VITE_SUPABASE_URL || "",
  supabaseAnonKey: e.VITE_SUPABASE_ANON_KEY || "",

  // TMDB Configuration
  tmdbToken: e.VITE_TMDB_READ_TOKEN || "",
  tmdbBaseUrl: e.VITE_TMDB_BASE_URL || "https://api.themoviedb.org/3",

  // Recommendation API (Render)
  recsApiUrl:
    e.VITE_RECOMMENDATION_API_URL ||
    e.VITE_RECS_API_URL ||
    "https://cinetale-backend.onrender.com",
};

// Configuration Status
export const isAuthConfigured = Boolean(
  config.supabaseUrl && config.supabaseAnonKey,
);

export const isTmdbConfigured = Boolean(config.tmdbToken);

// Demo mode depends on Supabase and TMDB configuration
export const isDemoMode = !isAuthConfigured || !isTmdbConfigured;
