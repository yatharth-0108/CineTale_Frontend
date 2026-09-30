import { supabase } from './supabaseClient';
// Per-movie state: { type: 'like'|'dislike'|null, rating: 1-5|null, movie: snapshot, updatedAt }
const key = (u) => `cinetale_interactions_${u.id}`;
const readLocal = (u) => { try { return JSON.parse(localStorage.getItem(key(u))) || {}; } catch { return {}; } };

export const interactionService = {
  async getAll(user) {
    if (user.demo || !supabase) return readLocal(user);
    const { data, error } = await supabase.from('interactions').select('*').eq('user_id', user.id);
    if (error) throw new Error('Could not load interactions.');
    return Object.fromEntries(data.map((r) => [r.movie_id, { type: r.type, rating: r.rating, movie: r.movie, updatedAt: r.updated_at }]));
  },
  async save(user, movie, { type, rating }) {
    const updatedAt = new Date().toISOString();
    if (user.demo || !supabase) {
      const all = readLocal(user); all[movie.id] = { type, rating, movie, updatedAt };
      localStorage.setItem(key(user), JSON.stringify(all)); return;
    }
    const { error } = await supabase.from('interactions').upsert({ user_id: user.id, movie_id: movie.id, type, rating, movie, updated_at: updatedAt });
    if (error) throw new Error('Could not save interaction.');
  },
};
