import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import Button from '../../components/common/Button';
import { ErrorState, Skeleton } from '../../components/common/States';
import { ConfirmDialog, Modal } from '../../components/common/Dialogs';
import MovieCard from '../../components/movies/MovieCard';
import MovieSearchPicker from '../../components/movies/MovieSearchPicker';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { collectionService } from '../../services/collectionService';
import { CollectionForm } from './CollectionsPage';
import NotFound from '../NotFound';

export default function CollectionDetailPage() {
  const { collectionId } = useParams(); const { user } = useAuth(); const toast = useToast(); const nav = useNavigate();
  const { data: c, loading, error, reload } = useAsync(() => collectionService.get(user, collectionId), [collectionId]);
  const [edit, setEdit] = useState(false); const [del, setDel] = useState(false); const [busy, setBusy] = useState(false); const [err, setErr] = useState('');
  if (loading) return <Skeleton style={{ height: 300 }} />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!c) return <NotFound />;
  const own = c.ownerId === user.id;
  const run = async (fn, ok) => { try { await fn(); if (ok) toast(ok, 'success'); reload(); } catch (e) { toast(e.message, 'error'); } };
  return (
    <>
      <p><Link to="/collections" className="auth__link">← Collections</Link></p>
      <div className="pagehead"><h1>{c.title}</h1>{c.description && <p>{c.description}</p>}<p>{c.movies.length} movies · {c.isPublic ? 'Public' : 'Private'}</p></div>
      {own && <div className="tools"><Button size="sm" variant="secondary" onClick={() => { setErr(''); setEdit(true); }}>Edit</Button><Button size="sm" variant="secondary" onClick={() => setDel(true)}>Delete</Button></div>}
      {own && <div className="panel" style={{ marginBottom: '1.5rem' }}><MovieSearchPicker label="Add a movie to this collection" onPick={(m) => run(() => collectionService.addMovie(user, c.id, m), `Added ${m.title}`)} /></div>}
      {c.movies.length === 0 ? <p className="muted">No movies in this collection yet.</p> : (
        <div className="mgrid">{c.movies.map((m) => <div key={m.id} style={{ position: 'relative' }}><MovieCard movie={m} />{own && <button className="act rm" aria-label={`Remove ${m.title}`} onClick={() => run(() => collectionService.removeMovie(user, c.id, m.id))}><X size={14} /></button>}</div>)}</div>
      )}
      <Modal open={edit} onClose={() => setEdit(false)} title="Edit collection"><CollectionForm initial={{ title: c.title, description: c.description, isPublic: c.isPublic }} busy={busy} error={err} onCancel={() => setEdit(false)}
        onSubmit={async (f) => { setBusy(true); try { await collectionService.update(user, c.id, f); setEdit(false); toast('Saved', 'success'); reload(); } catch (e) { setErr(e.message); } finally { setBusy(false); } }} /></Modal>
      <ConfirmDialog open={del} title="Delete collection?" message={`“${c.title}” will be permanently deleted. Movies themselves are not affected.`} busy={busy} onCancel={() => setDel(false)}
        onConfirm={async () => { setBusy(true); try { await collectionService.remove(user, c.id); toast('Collection deleted', 'success'); nav('/collections'); } catch (e) { toast(e.message, 'error'); setBusy(false); setDel(false); } }} />
    </>
  );
}
