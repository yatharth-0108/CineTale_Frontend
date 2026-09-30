const e = import.meta.env;
export const config = {
  supabaseUrl: e.VITE_SUPABASE_URL || '',
  supabaseAnonKey: e.VITE_SUPABASE_ANON_KEY || '',
  tmdbToken: e.VITE_TMDB_READ_TOKEN || '',
  tmdbBaseUrl: e.VITE_TMDB_BASE_URL || 'https://api.themoviedb.org/3',
  recsApiUrl: e.VITE_RECOMMENDATION_API_URL || e.VITE_RECS_API_URL || 'http://127.0.0.1:8000',
};
export const isAuthConfigured = Boolean(config.supabaseUrl && config.supabaseAnonKey);
export const isTmdbConfigured = Boolean(config.tmdbToken);
export const isDemoMode = !isAuthConfigured || !isTmdbConfigured;
