import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Avatar } from '../../components/common/Dialogs';
import { EmptyState, ErrorState, Skeleton } from '../../components/common/States';
import { MovieGrid } from '../../components/movies/MovieLists';
import MovieDNAWidget from '../../components/movies/MovieDNAWidget';
import { FollowButton, PostCard, ReviewCard } from '../../components/social/Social';
import { useAuth } from '../../context/AuthContext';
import { useLibrary } from '../../context/LibraryContext';
import { useSocial } from '../../context/SocialContext';
import { useAsync } from '../../hooks/useAsync';
import { socialService } from '../../services/socialService';
import { reviewService } from '../../services/reviewService';
import { collectionService } from '../../services/collectionService';
import { userService } from '../../services/userService';
import NotFound from '../NotFound';

const TABS = ['Activity', 'Reviews', 'Ratings', 'Collections'];

function Tab({ name, data, isSelf }) {
  const { interactions } = useLibrary();
  const { p, posts, reviews, cols } = data;
  if (name === 'Activity') return posts.length ? <div className="feed">{posts.map((x) => <PostCard key={x.id} post={x} />)}</div> : <EmptyState title="No activity yet" />;
  if (name === 'Reviews') return reviews.length ? <div className="feed">{reviews.map((r) => <ReviewCard key={r.id} review={r} />)}</div> : <EmptyState title="No reviews yet" />;
  if (name === 'Ratings') {
    if (!isSelf) return <EmptyState title="Ratings are private" message="Star ratings are only visible to their owner." />;
    const rated = Object.values(interactions).filter((i) => i.rating && i.movie);
    return <MovieGrid movies={rated.map((i) => i.movie)} note={(m) => `You rated ${interactions[m.id].rating}/5`} empty={<EmptyState title="No ratings yet" action={{ label: 'Discover movies', to: '/discover' }} />} />;
  }
  return cols.length ? <div className="mgrid">{cols.map((c) => <Link key={c.id} to={`/collections/${c.id}`} className="panel"><h3>{c.title}</h3><p className="muted">{c.movies.length} movies</p></Link>)}</div> : <EmptyState title={isSelf ? 'No collections yet' : 'No public collections'} action={isSelf ? { label: 'Create one', to: '/collections' } : undefined} />;
}

export default function ProfilePage() {
  const { username } = useParams(); const { user } = useAuth(); const { isFollowing } = useSocial();
  const [tab, setTab] = useState('Activity');
  const [initial, setInitial] = useState(null);
  const { data, loading, error, reload } = useAsync(async () => {
    const res = await socialService.getProfile(user, username); if (!res) return null;
    const id = res.profile.id;
    const [posts, reviews, cols, prefs] = await Promise.all([socialService.getFeed(user, { authorId: id }), reviewService.byUser(user, id), collectionService.list(user, id), res.isSelf ? userService.getPreferences(user).catch(() => null) : null]);
    setInitial(isFollowing(id));
    return { ...res, p: res.profile, posts: posts.posts, reviews, cols: cols.filter((c) => res.isSelf || c.isPublic), genres: res.isSelf ? prefs?.genres || [] : res.profile.favoriteGenres || [] };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, user.id]);

  if (loading) return <Skeleton style={{ height: 300 }} />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!data) return <NotFound />;
  const followers = data.followers + (isFollowing(data.p.id) ? 1 : 0) - (initial ? 1 : 0);

  return (
    <div className="cols">
      <div>
        <div className="cover" aria-hidden="true" />
        <div className="phead"><Avatar name={data.p.name} size={88} />
          <div><h1>{data.p.name}{data.p.sample && <span className="pill">Sample</span>}</h1><p className="muted">@{data.p.username}</p></div>
          {!data.isSelf && <FollowButton userId={data.p.id} size="md" />}</div>
        {data.p.bio && <p>{data.p.bio}</p>}
        <p className="muted"><strong>{followers}</strong> followers · <strong>{data.following}</strong> following</p>
        {data.genres.length > 0 && <div className="chipbar">{data.genres.map((g) => <span key={g} className="gchip">{g}</span>)}</div>}
        <div className="chipbar" role="tablist">{TABS.map((t) => <button key={t} role="tab" aria-selected={tab === t} className={`gchip ${tab === t ? 'is-on' : ''}`} onClick={() => setTab(t)}>{t}</button>)}</div>
        <Tab name={tab} data={data} isSelf={data.isSelf} />
      </div>
      {data.isSelf && <aside className="sidecol"><div className="panel"><MovieDNAWidget /></div></aside>}
    </div>
  );
}
