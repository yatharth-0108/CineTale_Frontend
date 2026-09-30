import { useEffect, useState } from 'react';
import { EmptyState, ErrorState, Skeleton } from '../../components/common/States';
import { UserCard } from '../../components/social/Social';
import { useAuth } from '../../context/AuthContext';
import { socialService } from '../../services/socialService';

export default function PeoplePage() {
  const { user } = useAuth();
  const [q, setQ] = useState(''); const [dq, setDq] = useState('');
  const [s, setS] = useState({ people: [], demo: false, loading: true, error: null });
  useEffect(() => { const t = setTimeout(() => setDq(q), 300); return () => clearTimeout(t); }, [q]);
  useEffect(() => {
    let live = true; setS((x) => ({ ...x, loading: true, error: null }));
    socialService.searchPeople(user, dq).then((r) => live && setS({ ...r, loading: false, error: null })).catch((error) => live && setS((x) => ({ ...x, loading: false, error })));
    return () => { live = false; };
  }, [user, dq]);
  return (
    <div className="narrow">
      <div className="pagehead"><h1>Find <em>people</em></h1><p>Follow movie lovers to fill your Following feed.</p></div>
      <div className="tools"><input type="search" aria-label="Search people" placeholder="Search by name or username" value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: 1 }} /></div>
      {s.demo && <p className="notice notice--info">Demo mode: these are sample profiles.</p>}
      {s.error ? <ErrorState error={s.error} /> : s.loading ? <Skeleton style={{ height: 80 }} /> : s.people.length === 0 ? <EmptyState title="No people found" message={dq ? 'Try a different name.' : 'Nobody to suggest yet.'} /> : <div className="ulist">{s.people.map((p) => <UserCard key={p.id} person={p} />)}</div>}
    </div>
  );
}
