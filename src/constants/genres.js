export const TMDB_GENRES = { 28:'Action',12:'Adventure',16:'Animation',35:'Comedy',80:'Crime',99:'Documentary',18:'Drama',10751:'Family',14:'Fantasy',36:'History',27:'Horror',10402:'Music',9648:'Mystery',10749:'Romance',878:'Sci-Fi',10770:'TV Movie',53:'Thriller',10752:'War',37:'Western' };
export const GENRE_IDS = Object.fromEntries(Object.entries(TMDB_GENRES).map(([id, n]) => [n, Number(id)]));
// Mood browsing maps to genres; it is a genre-based shortcut, not a learned signal.
export const MOOD_GENRES = { 'Cozy & comforting': ['Family', 'Comedy'], 'Mind-bending': ['Sci-Fi', 'Mystery'], 'Edge-of-seat': ['Thriller', 'Action'], 'Feel-good': ['Comedy', 'Romance'], 'Dark & gritty': ['Crime', 'Horror'], 'Epic & sweeping': ['Adventure', 'Fantasy'] };
