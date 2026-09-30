import { supabase } from './supabaseClient';
import { ls, uid } from '../utils/localStore';
const KEY = 'cinetale_demo_reviews';
const isDemo = (u) => u.demo || !supabase;
const authorOf = (u) => ({ id: u.id, username: u.username, name: u.fullName || u.username });
const map = (r) => ({ id: r.id, movieId: r.movie_id, movie: r.movie, rating: r.rating, title: r.title, body: r.body, spoiler: r.spoiler, createdAt: r.created_at, author: { id: r.author.id, username: r.author.username, name: r.author.full_name || r.author.username } });
const SEL = '*,author:profiles!reviews_user_id_fkey(id,username,full_name)';

export const reviewService = {
  async forMovie(user, movieId) {
    if (isDemo(user)) return ls.get(KEY, []).filter((r) => r.movieId === Number(movieId));
    const { data, error } = await supabase.from('reviews').select(SEL).eq('movie_id', movieId).order('created_at', { ascending: false });
    if (error) throw new Error('Could not load reviews.'); return data.map(map);
  },
  async byUser(user, userId) {
    if (isDemo(user)) return ls.get(KEY, []).filter((r) => r.author.id === userId);
    const { data, error } = await supabase.from('reviews').select(SEL).eq('user_id', userId).order('created_at', { ascending: false });
    if (error) throw new Error('Could not load reviews.'); return data.map(map);
  },
  async create(user, { movie, rating, title, body, spoiler }) {
    if (isDemo(user)) {
      const r = { id: uid(), movieId: movie.id, movie, rating, title, body, spoiler, author: authorOf(user), createdAt: new Date().toISOString() };
      ls.set(KEY, [r, ...ls.get(KEY, [])]); return r;
    }
    const { data, error } = await supabase.from('reviews').insert({ user_id: user.id, movie_id: movie.id, movie, rating, title, body, spoiler }).select(SEL).single();
    if (error) throw new Error(error.code === '23505' ? 'You have already reviewed this movie.' : 'Could not submit your review.');
    return map(data);
  },
};
