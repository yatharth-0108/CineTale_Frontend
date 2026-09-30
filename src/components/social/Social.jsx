import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Star, Eye } from 'lucide-react';
import Button from '../common/Button';
import { Avatar } from '../common/Dialogs';
import MoviePoster from '../movies/MoviePoster';
import { useAuth } from '../../context/AuthContext';
import { useSocial } from '../../context/SocialContext';
import { useToast } from '../../context/ToastContext';
import { socialService } from '../../services/socialService';
import { timeAgo } from '../../utils/localStore';

export function FollowButton({ userId, size = 'sm' }) {
  const { user } = useAuth(); const { isFollowing, toggleFollow } = useSocial();
  if (userId === user.id) return null;
  const on = isFollowing(userId);
  return <Button size={size} variant={on ? 'secondary' : 'primary'} aria-pressed={on} onClick={() => toggleFollow(userId)}>{on ? 'Following' : 'Follow'}</Button>;
}

export function UserCard({ person, note }) {
  return (
    <div className="ucard">
      <Avatar name={person.name} size={44} />
      <div className="ucard__info"><Link to={`/profile/${person.username}`}><strong>{person.name}</strong></Link><span>@{person.username}{person.sample && <span className="pill">Sample</span>}</span>{note && <small>{note}</small>}</div>
      <FollowButton userId={person.id} />
    </div>
  );
}

const Stars = ({ n }) => <span className="ro" aria-label={`${n} out of 5 stars`}>{[1, 2, 3, 4, 5].map((i) => <Star key={i} size={14} fill={i <= n ? 'currentColor' : 'none'} />)}</span>;

function Spoiler({ on, children }) {
  const [open, setOpen] = useState(false);
  if (!on || open) return children;
  return <div className="spoiler"><p>Contains spoilers.</p><Button size="sm" variant="secondary" onClick={() => setOpen(true)}><Eye size={14} /> Show</Button></div>;
}

export function ReviewCard({ review }) {
  return (
    <article className="review">
      <header><Avatar name={review.author.name} /><div><Link to={`/profile/${review.author.username}`}><strong>{review.author.name}</strong></Link><small>{timeAgo(review.createdAt)}</small></div><Stars n={review.rating} /></header>
      <h3>{review.title}</h3>
      <Spoiler on={review.spoiler}><p>{review.body}</p></Spoiler>
      {review.movie && <Link to={`/movie/${review.movie.id}`} className="review__movie">{review.movie.title}</Link>}
    </article>
  );
}

export function CommentSection({ postId, onAdded }) {
  const { user } = useAuth(); const toast = useToast();
  const [state, setState] = useState({ list: [], loading: true, error: '' });
  const [text, setText] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { socialService.getComments(user, postId).then((list) => setState({ list, loading: false, error: '' })).catch((e) => setState({ list: [], loading: false, error: e.message })); }, [user, postId]);
  async function submit(e) {
    e.preventDefault(); const body = text.trim(); if (!body || busy) return;
    setBusy(true);
    try { const c = await socialService.addComment(user, postId, body); setState((s) => ({ ...s, list: [...s.list, c] })); setText(''); onAdded?.(); }
    catch (er) { toast(er.message, 'error'); } finally { setBusy(false); }
  }
  return (
    <div className="comments">
      {state.loading && <p className="muted">Loading comments…</p>}
      {state.error && <p className="field__error" role="alert">{state.error}</p>}
      {state.list.map((c) => <div key={c.id} className="comment"><strong>{c.author.name}</strong> <small>{timeAgo(c.createdAt)}</small><p>{c.body}</p></div>)}
      <form onSubmit={submit}><input value={text} onChange={(e) => setText(e.target.value)} maxLength={300} placeholder="Add a comment…" aria-label="Add a comment" /><Button size="sm" type="submit" disabled={busy || !text.trim()}>{busy ? 'Posting…' : 'Post'}</Button></form>
    </div>
  );
}

export function PostCard({ post: initial }) {
  const { user } = useAuth(); const toast = useToast();
  const [post, setPost] = useState(initial); const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false);
  const label = { review: 'reviewed', post: 'posted' }[post.type];
  async function like() {
    if (busy) return; setBusy(true);
    const prev = post, next = !post.likedByMe;
    setPost({ ...post, likedByMe: next, likeCount: post.likeCount + (next ? 1 : -1) });
    try { await socialService.toggleLike(user, post.id, next); } catch { setPost(prev); toast('Could not update your like.', 'error'); } finally { setBusy(false); }
  }
  async function share() {
    const url = post.movie ? `${window.location.origin}/movie/${post.movie.id}` : `${window.location.origin}/profile/${post.author.username}`;
    try { if (navigator.share) await navigator.share({ url }); else { await navigator.clipboard.writeText(url); toast('Link copied', 'success'); } } catch { /* dismissed */ }
  }
  return (
    <article className="post">
      <header><Avatar name={post.author.name} />
        <div><Link to={`/profile/${post.author.username}`}><strong>{post.author.name}</strong></Link> <span className="muted">{label}</span>{post.sample && <span className="pill">Sample</span>}<small>{timeAgo(post.createdAt)}</small></div>
        <FollowButton userId={post.author.id} /></header>
      <Spoiler on={post.spoiler}>
        <p className="post__body">{post.body}</p>
        {post.movie && <Link to={`/movie/${post.movie.id}`} className="post__movie"><div className="post__poster"><MoviePoster movie={post.movie} size="w185" /></div><div><strong>{post.movie.title}</strong><small>{post.movie.release_date?.slice(0, 4)}</small>{post.rating && <Stars n={post.rating} />}</div></Link>}
      </Spoiler>
      <footer>
        <button className={`act ${post.likedByMe ? 'is-on' : ''}`} aria-pressed={post.likedByMe} onClick={like}><Heart size={18} fill={post.likedByMe ? 'currentColor' : 'none'} /> {post.likeCount}</button>
        <button className="act" aria-expanded={open} onClick={() => setOpen(!open)}><MessageCircle size={18} /> {post.commentCount}</button>
        <button className="act" aria-label="Share" onClick={share}><Share2 size={18} /></button>
      </footer>
      {open && <CommentSection postId={post.id} onAdded={() => setPost((p) => ({ ...p, commentCount: p.commentCount + 1 }))} />}
    </article>
  );
}
