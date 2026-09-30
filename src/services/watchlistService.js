import { supabase } from './supabaseClient';
const key = (u) => `cinetale_watchlist_${u.id}`;
const readLocal = (u) => { try { return JSON.parse(localStorage.getItem(key(u))) || []; } catch { return []; } };

export const watchlistService = {
  async getAll(user) {
    if (user.demo || !supabase) return readLocal(user);
    const { data, error } = await supabase.from('watchlist').select('movie, added_at').eq('user_id', user.id).order('added_at', { ascending: false });
    if (error) throw new Error('Could not load your watchlist.');
    return data.map((r) => ({ ...r.movie, addedAt: r.added_at }));
  },
  async add(user, movie) {
    const addedAt = new Date().toISOString();
    if (user.demo || !supabase) { localStorage.setItem(key(user), JSON.stringify([{ ...movie, addedAt }, ...readLocal(user).filter((m) => m.id !== movie.id)])); return; }
    const { error } = await supabase.from('watchlist').upsert({ user_id: user.id, movie_id: movie.id, movie, added_at: addedAt });
    if (error) throw new Error('Could not add to watchlist.');
  },
  async remove(user, movieId) {
    if (user.demo || !supabase) { localStorage.setItem(key(user), JSON.stringify(readLocal(user).filter((m) => m.id !== movieId))); return; }
    const { error } = await supabase.from('watchlist').delete().eq('user_id', user.id).eq('movie_id', movieId);
    if (error) throw new Error('Could not remove from watchlist.');
  },
};
