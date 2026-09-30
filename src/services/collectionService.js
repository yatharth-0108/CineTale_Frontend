import { supabase } from './supabaseClient';
import { ls, uid } from '../utils/localStore';
const key = (u) => `cinetale_demo_collections_${u.id}`;
const isDemo = (u) => u.demo || !supabase;
const fail = (e, m) => { if (e) throw new Error(m); };
const map = (c) => ({ id: c.id, ownerId: c.user_id, title: c.title, description: c.description || '', isPublic: c.is_public, movies: (c.collection_movies || []).map((x) => x.movie) });

export const collectionService = {
  /** ownerId defaults to the current user; other users' private collections are hidden (and blocked by RLS remotely). */
  async list(user, ownerId = user.id) {
    if (isDemo(user)) return ownerId === user.id ? ls.get(key(user), []) : [];
    let q = supabase.from('collections').select('*,collection_movies(movie)').eq('user_id', ownerId).order('created_at', { ascending: false });
    if (ownerId !== user.id) q = q.eq('is_public', true);
    const { data, error } = await q; fail(error, 'Could not load collections.'); return data.map(map);
  },
  async get(user, id) {
    if (isDemo(user)) return ls.get(key(user), []).find((c) => c.id === id) || null;
    const { data, error } = await supabase.from('collections').select('*,collection_movies(movie)').eq('id', id).maybeSingle();
    fail(error, 'Could not load this collection.'); return data ? map(data) : null;
  },
  async create(user, { title, description, isPublic }) {
    if (isDemo(user)) { const c = { id: uid(), ownerId: user.id, title, description, isPublic, movies: [] }; ls.set(key(user), [c, ...ls.get(key(user), [])]); return c; }
    const { data, error } = await supabase.from('collections').insert({ user_id: user.id, title, description, is_public: isPublic }).select('*,collection_movies(movie)').single();
    fail(error, 'Could not create the collection.'); return map(data);
  },
  async update(user, id, { title, description, isPublic }) {
    if (isDemo(user)) { ls.set(key(user), ls.get(key(user), []).map((c) => (c.id === id ? { ...c, title, description, isPublic } : c))); return; }
    fail((await supabase.from('collections').update({ title, description, is_public: isPublic }).eq('id', id)).error, 'Could not save changes.');
  },
  async remove(user, id) {
    if (isDemo(user)) { ls.set(key(user), ls.get(key(user), []).filter((c) => c.id !== id)); return; }
    fail((await supabase.from('collections').delete().eq('id', id)).error, 'Could not delete the collection.');
  },
  async addMovie(user, id, movie) {
    if (isDemo(user)) { ls.set(key(user), ls.get(key(user), []).map((c) => (c.id === id && !c.movies.some((m) => m.id === movie.id) ? { ...c, movies: [...c.movies, movie] } : c))); return; }
    fail((await supabase.from('collection_movies').upsert({ collection_id: id, movie_id: movie.id, movie })).error, 'Could not add the movie.');
  },
  async removeMovie(user, id, movieId) {
    if (isDemo(user)) { ls.set(key(user), ls.get(key(user), []).map((c) => (c.id === id ? { ...c, movies: c.movies.filter((m) => m.id !== movieId) } : c))); return; }
    fail((await supabase.from('collection_movies').delete().eq('collection_id', id).eq('movie_id', movieId)).error, 'Could not remove the movie.');
  },
};
