import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Lock, Globe } from 'lucide-react';
import Button from '../../components/common/Button';
import { EmptyState, ErrorState, Skeleton } from '../../components/common/States';
import { Modal } from '../../components/common/Dialogs';
import MoviePoster from '../../components/movies/MoviePoster';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { collectionService } from '../../services/collectionService';

export function CollectionForm({ initial, onSubmit, onCancel, busy, error }) {
  const [f, setF] = useState(initial || { title: '', description: '', isPublic: false }); const [err, setErr] = useState('');
  return (
    <form className="formstack" noValidate onSubmit={(e) => { e.preventDefault(); if (f.title.trim().length < 2) return setErr('Give your collection a title.'); setErr(''); onSubmit({ ...f, title: f.title.trim(), description: f.description.trim() }); }}>
      {error && <p className="notice notice--error" role="alert">{error}</p>}
      <label className="field"><span>Title</span><input value={f.title} maxLength={60} onChange={(e) => setF({ ...f, title: e.target.value })} aria-invalid={Boolean(err)} />{err && <p className="field__error" role="alert">{err}</p>}</label>
      <label className="field"><span>Description</span><textarea rows={3} maxLength={200} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></label>
      <label className="check"><input type="checkbox" checked={f.isPublic} onChange={(e) => setF({ ...f, isPublic: e.target.checked })} /><span>Public: visible on my profile</span></label>
      <div className="modal__actions"><Button type="button" variant="secondary" onClick={onCancel} disabled={busy}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save'}</Button></div>
    </form>
  );
}

export default function CollectionsPage() {
  const { user } = useAuth(); const toast = useToast();
  const { data, loading, error, reload } = useAsync(() => collectionService.list(user), [user.id]);
  const [open, setOpen] = useState(false); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  async function create(f) { setBusy(true); setErr(''); try { await collectionService.create(user, f); setOpen(false); toast('Collection created', 'success'); reload(); } catch (e) { setErr(e.message); } finally { setBusy(false); } }
  return (
    <>
      <div className="pagehead"><h1>Your <em>collections</em></h1><p>Organize movies into themed lists.</p></div>
      <div className="tools"><Button size="sm" onClick={() => { setErr(''); setOpen(true); }}><Plus size={15} /> New collection</Button></div>
      {error ? <ErrorState error={error} onRetry={reload} /> : loading ? <Skeleton style={{ height: 200 }} /> : !data.length ? <EmptyState title="No collections yet" message="Try “Comfort Movies” or “Mind-Bending Sci-Fi”." action={{ label: 'Create your first', onClick: () => setOpen(true) }} /> : (
        <div className="colgrid">{data.map((c) => (
          <Link key={c.id} to={`/collections/${c.id}`} className="colcard">
            <div className="colcard__art">{c.movies.slice(0, 3).map((m) => <MoviePoster key={m.id} movie={m} size="w185" />)}{c.movies.length === 0 && <span className="muted">Empty</span>}</div>
            <h3>{c.title}</h3><p className="muted">{c.movies.length} movie{c.movies.length === 1 ? '' : 's'} · {c.isPublic ? <><Globe size={12} /> Public</> : <><Lock size={12} /> Private</>}</p>
            {c.description && <p>{c.description}</p>}
          </Link>))}</div>
      )}
      <Modal open={open} onClose={() => setOpen(false)} title="New collection"><CollectionForm onSubmit={create} onCancel={() => setOpen(false)} busy={busy} error={err} /></Modal>
    </>
  );
}
