import { supabase } from './supabaseClient';
import { ls, uid } from '../utils/localStore';
import { MOCK_MOVIES } from '../constants/mockMovies';

const PAGE = 10;
// DEMO ONLY: clearly labeled sample people and posts so social pages are not empty in demo mode.
export const SAMPLE_USERS = [
  { id: 'sample-1', username: 'sample_a', name: 'Sample Reviewer A', bio: 'Sample profile for demo mode.', sample: true },
  { id: 'sample-2', username: 'sample_b', name: 'Sample Reviewer B', bio: 'Sample profile for demo mode.', sample: true },
  { id: 'sample-3', username: 'sample_c', name: 'Sample Reviewer C', bio: 'Sample profile for demo mode.', sample: true },
];
const SAMPLE_POSTS = [
  { id: 'sp1', type: 'review', authorId: 'sample-1', body: 'Sample post: a slow burn that rewards patience.', movieId: 3, rating: 5, createdAt: '2026-09-20T10:00:00Z' },
  { id: 'sp2', type: 'post', authorId: 'sample-2', body: 'Sample post: what is your comfort rewatch?', movieId: 4, createdAt: '2026-09-22T18:30:00Z' },
  { id: 'sp3', type: 'post', authorId: 'sample-3', body: 'Sample post: double-feature night planned.', movieId: null, createdAt: '2026-09-24T21:00:00Z' },
];
const K = { posts: 'cinetale_demo_posts', comments: 'cinetale_demo_comments', likes: 'cinetale_demo_likes', follows: (u) => `cinetale_demo_follows_${u.id}` };
const isDemo = (u) => u.demo || !supabase;
const authorOf = (u) => ({ id: u.id, username: u.username, name: u.fullName || u.username });
const fail = (e, msg) => { if (e) throw new Error(msg); };

function demoPosts() {
  const samples = SAMPLE_POSTS.map((p) => ({ ...p, author: SAMPLE_USERS.find((u) => u.id === p.authorId), movie: MOCK_MOVIES.find((m) => m.id === p.movieId) || null, sample: true }));
  return [...samples, ...ls.get(K.posts, [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
function hydrate(user, p) {
  const likes = ls.get(K.likes, {})[p.id] || [];
  return { ...p, likeCount: likes.length, likedByMe: likes.includes(user.id), commentCount: ls.get(K.comments, []).filter((c) => c.postId === p.id).length };
}
const fromRow = (r, liked, uid_) => ({
  id: r.id, type: r.type, body: r.body, movie: r.movie, rating: r.rating, spoiler: r.spoiler, createdAt: r.created_at,
  author: { id: r.author.id, username: r.author.username, name: r.author.full_name || r.author.username },
  likeCount: r.likes?.[0]?.count || 0, commentCount: r.comments?.[0]?.count || 0, likedByMe: liked.has(r.id) && uid_,
});
const POST_SELECT = 'id,type,body,movie,rating,spoiler,created_at,author:profiles!posts_user_id_fkey(id,username,full_name),likes:post_likes(count),comments(count)';

async function likedSet(user, rows) {
  if (!rows.length) return new Set();
  const { data } = await supabase.from('post_likes').select('post_id').eq('user_id', user.id).in('post_id', rows.map((r) => r.id));
  return new Set((data || []).map((r) => r.post_id));
}

export const socialService = {
  PAGE,

  async getFollowIds(user) {
    if (isDemo(user)) return ls.get(K.follows(user), []);
    const { data, error } = await supabase.from('follows').select('followee_id').eq('follower_id', user.id);
    fail(error, 'Could not load who you follow.');
    return data.map((r) => r.followee_id);
  },
  async follow(user, id) {
    if (isDemo(user)) { ls.set(K.follows(user), [...new Set([...ls.get(K.follows(user), []), id])]); return; }
    fail((await supabase.from('follows').upsert({ follower_id: user.id, followee_id: id })).error, 'Could not follow.');
  },
  async unfollow(user, id) {
    if (isDemo(user)) { ls.set(K.follows(user), ls.get(K.follows(user), []).filter((x) => x !== id)); return; }
    fail((await supabase.from('follows').delete().eq('follower_id', user.id).eq('followee_id', id)).error, 'Could not unfollow.');
  },

  /** scope: 'following' | 'discover'. Returns { posts, hasMore }. */
  async getFeed(user, { scope = 'discover', page = 0, authorId } = {}) {
    if (isDemo(user)) {
      const follows = ls.get(K.follows(user), []);
      let all = demoPosts();
      if (authorId) all = all.filter((p) => p.author.id === authorId);
      else if (scope === 'following') all = all.filter((p) => follows.includes(p.author.id) || p.author.id === user.id);
      const slice = all.slice(page * PAGE, page * PAGE + PAGE);
      return { posts: slice.map((p) => hydrate(user, p)), hasMore: all.length > (page + 1) * PAGE };
    }
    let q = supabase.from('posts').select(POST_SELECT).order('created_at', { ascending: false }).range(page * PAGE, page * PAGE + PAGE);
    if (authorId) q = q.eq('user_id', authorId);
    else if (scope === 'following') q = q.in('user_id', [...(await this.getFollowIds(user)), user.id]);
    const { data, error } = await q; fail(error, 'Could not load the feed.');
    const rows = data.slice(0, PAGE); const liked = await likedSet(user, rows);
    return { posts: rows.map((r) => fromRow(r, liked, true)), hasMore: data.length > PAGE };
  },

  async createPost(user, { body, movie = null, rating = null, spoiler = false, type = 'post' }) {
    if (isDemo(user)) {
      const post = { id: uid(), type, author: authorOf(user), body, movie, rating, spoiler, createdAt: new Date().toISOString() };
      ls.set(K.posts, [post, ...ls.get(K.posts, [])]); return hydrate(user, post);
    }
    const { data, error } = await supabase.from('posts').insert({ user_id: user.id, type, body, movie, rating, spoiler }).select(POST_SELECT).single();
    fail(error, 'Could not publish your post.'); return fromRow(data, new Set(), false);
  },

  async toggleLike(user, postId, like) {
    if (isDemo(user)) {
      const all = ls.get(K.likes, {}); const cur = new Set(all[postId] || []);
      like ? cur.add(user.id) : cur.delete(user.id); all[postId] = [...cur]; ls.set(K.likes, all); return;
    }
    const r = like ? await supabase.from('post_likes').upsert({ post_id: postId, user_id: user.id }) : await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', user.id);
    fail(r.error, 'Could not update your like.');
  },

  async getComments(user, postId) {
    if (isDemo(user)) return ls.get(K.comments, []).filter((c) => c.postId === postId).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    const { data, error } = await supabase.from('comments').select('id,body,created_at,author:profiles!comments_user_id_fkey(id,username,full_name)').eq('post_id', postId).order('created_at');
    fail(error, 'Could not load comments.');
    return data.map((r) => ({ id: r.id, body: r.body, createdAt: r.created_at, author: { id: r.author.id, username: r.author.username, name: r.author.full_name || r.author.username } }));
  },
  async addComment(user, postId, body) {
    if (isDemo(user)) { const c = { id: uid(), postId, body, author: authorOf(user), createdAt: new Date().toISOString() }; ls.set(K.comments, [...ls.get(K.comments, []), c]); return c; }
    const { data, error } = await supabase.from('comments').insert({ post_id: postId, user_id: user.id, body }).select('id,created_at').single();
    fail(error, 'Could not post your comment.');
    return { id: data.id, body, createdAt: data.created_at, author: authorOf(user) };
  },

  /** { profile, followers, following, isSelf } or null when not found. */
  async getProfile(user, username) {
    const self = username.toLowerCase() === (user.username || '').toLowerCase();
    if (isDemo(user)) {
      const p = self ? { ...authorOf(user), bio: '', favoriteGenres: [] } : SAMPLE_USERS.find((u) => u.username === username);
      if (!p) return null;
      return { profile: p, isSelf: self, followers: 0, following: self ? ls.get(K.follows(user), []).length : 0 };
    }
    const { data: p, error } = await supabase.from('profiles').select('id,username,full_name,bio,favorite_genres').eq('username', username).maybeSingle();
    fail(error, 'Could not load this profile.'); if (!p) return null;
    const count = async (col) => (await supabase.from('follows').select('*', { count: 'exact', head: true }).eq(col, p.id)).count || 0;
    return { profile: { id: p.id, username: p.username, name: p.full_name || p.username, bio: p.bio || '', favoriteGenres: p.favorite_genres || [] }, isSelf: p.id === user.id, followers: await count('followee_id'), following: await count('follower_id') };
  },

  async searchPeople(user, query = '') {
    const q = query.trim().toLowerCase();
    if (isDemo(user)) return { people: SAMPLE_USERS.filter((u) => !q || u.username.includes(q) || u.name.toLowerCase().includes(q)), demo: true };
    let r = supabase.from('profiles').select('id,username,full_name').neq('id', user.id).limit(20);
    if (q) r = r.or(`username.ilike.%${q}%,full_name.ilike.%${q}%`);
    const { data, error } = await r; fail(error, 'Could not load people.');
    return { people: data.map((p) => ({ id: p.id, username: p.username, name: p.full_name || p.username })), demo: false };
  },
};
