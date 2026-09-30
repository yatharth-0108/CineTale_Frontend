import { useCallback, useEffect, useState } from 'react';
import { PenSquare } from 'lucide-react';
import Button from '../../components/common/Button';
import { EmptyState, ErrorState, Skeleton } from '../../components/common/States';
import { PostCard } from '../../components/social/Social';
import { useAuth } from '../../context/AuthContext';
import { socialService } from '../../services/socialService';

export default function CommunityPage() {
  const { user } = useAuth();
  const [scope, setScope] = useState('discover');
  const [s, setS] = useState({ posts: [], page: 0, hasMore: false, loading: true, more: false, error: null });
  const load = useCallback(async (page) => {
    setS((x) => ({ ...x, loading: page === 0, more: page > 0, error: null }));
    try { const r = await socialService.getFeed(user, { scope, page }); setS((x) => ({ posts: page === 0 ? r.posts : [...x.posts, ...r.posts], page, hasMore: r.hasMore, loading: false, more: false, error: null })); }
    catch (error) { setS((x) => ({ ...x, loading: false, more: false, error })); }
  }, [user, scope]);
  useEffect(() => { load(0); }, [load]);

  return (
    <div className="narrow">
      <div className="pagehead"><h1>The <em>community</em></h1><p>Reviews, ratings and conversation about film.</p></div>
      <div className="tools" style={{ justifyContent: 'space-between' }}>
        <div className="chipbar" role="tablist" style={{ margin: 0 }}>{[['discover', 'Discover'], ['following', 'Following']].map(([k, l]) => <button key={k} role="tab" aria-selected={scope === k} className={`gchip ${scope === k ? 'is-on' : ''}`} onClick={() => setScope(k)}>{l}</button>)}</div>
        <Button to="/create-post" size="sm"><PenSquare size={15} /> New post</Button>
      </div>
      {s.error ? <ErrorState error={s.error} onRetry={() => load(s.page)} /> : s.loading ? <div className="feed">{[0, 1, 2].map((i) => <Skeleton key={i} style={{ height: 160 }} />)}</div>
        : s.posts.length === 0 ? <EmptyState title={scope === 'following' ? 'Nothing from people you follow yet' : 'No posts yet'} message={scope === 'following' ? 'Follow some movie lovers to fill this feed.' : 'Be the first to share a thought.'} action={scope === 'following' ? { label: 'Find people', to: '/people' } : { label: 'Create a post', to: '/create-post' }} />
        : <div className="feed">{s.posts.map((p) => <PostCard key={p.id} post={p} />)}</div>}
      {s.hasMore && !s.loading && <div style={{ textAlign: 'center', marginTop: '1.5rem' }}><Button variant="secondary" onClick={() => load(s.page + 1)} disabled={s.more}>{s.more ? 'Loading…' : 'Load more'}</Button></div>}
    </div>
  );
}
