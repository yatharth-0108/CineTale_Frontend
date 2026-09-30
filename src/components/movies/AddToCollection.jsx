import { useEffect, useState } from 'react';
import { FolderPlus, Check } from 'lucide-react';
import { Modal } from '../common/Dialogs';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { collectionService } from '../../services/collectionService';

export default function AddToCollection({ movie }) {
  const { user } = useAuth(); const toast = useToast();
  const [open, setOpen] = useState(false); const [cols, setCols] = useState(null); const [busy, setBusy] = useState(null);
  useEffect(() => { if (open) collectionService.list(user).then(setCols).catch((e) => { toast(e.message, 'error'); setOpen(false); }); }, [open, user, toast]);
  async function toggle(c) {
    if (busy) return; setBusy(c.id); const has = c.movies.some((m) => m.id === movie.id);
    try { has ? await collectionService.removeMovie(user, c.id, movie.id) : await collectionService.addMovie(user, c.id, movie);
      setCols((l) => l.map((x) => (x.id === c.id ? { ...x, movies: has ? x.movies.filter((m) => m.id !== movie.id) : [...x.movies, movie] } : x))); }
    catch (e) { toast(e.message, 'error'); } finally { setBusy(null); }
  }
  return (
    <>
      <button className="act" style={{ padding: '.6rem 1.1rem' }} onClick={() => setOpen(true)}><FolderPlus size={18} /> Collect</button>
      <Modal open={open} onClose={() => setOpen(false)} title="Add to collection">
        {!cols ? <p className="muted">Loading…</p> : cols.length === 0 ? <p className="muted">You have no collections yet. <Link to="/collections">Create one</Link></p> : (
          <ul className="picklist">{cols.map((c) => { const has = c.movies.some((m) => m.id === movie.id); return <li key={c.id}><button onClick={() => toggle(c)} disabled={busy === c.id} aria-pressed={has}>{c.title}{has && <Check size={16} />}</button></li>; })}</ul>
        )}
        <div className="modal__actions"><button className="btn btn--secondary btn--sm" onClick={() => setOpen(false)}>Done</button></div>
      </Modal>
    </>
  );
}
