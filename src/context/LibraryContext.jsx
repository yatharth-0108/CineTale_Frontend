import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { interactionService } from '../services/interactionService';
import { watchlistService } from '../services/watchlistService';
import { recommendationService } from '../services/recommendationService';

const Ctx = createContext(null);
export const useLibrary = () => useContext(Ctx);
const EMPTY = { type: null, rating: null };

export function LibraryProvider({ children }) {
  const { user } = useAuth();
  const toast = useToast();
  const [interactions, setI] = useState({});
  const [watchlist, setW] = useState([]);
  const [loading, setLoading] = useState(true);
  const busy = useRef(new Set());

  useEffect(() => {
    let live = true;
    if (!user) { setI({}); setW([]); setLoading(false); return undefined; }
    setLoading(true);
    Promise.all([interactionService.getAll(user), watchlistService.getAll(user)])
      .then(([i, w]) => { if (live) { setI(i); setW(w); } })
      .catch(() => toast('Could not load your library.', 'error'))
      .finally(() => live && setLoading(false));
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const value = useMemo(() => {
    const stateOf = (id) => interactions[id] || EMPTY;
    async function mutate(movie, patch) {
      const k = `i${movie.id}`; if (busy.current.has(k)) return;
      busy.current.add(k);
      const prev = interactions[movie.id] || EMPTY; const next = { ...prev, ...patch };
      setI((s) => ({ ...s, [movie.id]: { ...next, movie } }));
      try { await interactionService.save(user, movie, next); recommendationService.submitInteraction(user, movie.id, next); }
      catch { setI((s) => ({ ...s, [movie.id]: prev })); toast('Could not save that. Please try again.', 'error'); }
      finally { busy.current.delete(k); }
    }
    async function toggleWatchlist(movie) {
      const k = `w${movie.id}`; if (busy.current.has(k)) return;
      busy.current.add(k);
      const prev = watchlist; const has = prev.some((m) => m.id === movie.id);
      setW(has ? prev.filter((m) => m.id !== movie.id) : [{ ...movie, addedAt: new Date().toISOString() }, ...prev]);
      try { has ? await watchlistService.remove(user, movie.id) : await watchlistService.add(user, movie); toast(has ? 'Removed from watchlist' : 'Added to watchlist', 'success'); }
      catch { setW(prev); toast('Watchlist update failed. Please try again.', 'error'); }
      finally { busy.current.delete(k); }
    }
    return {
      loading, interactions, watchlist, stateOf,
      inWatchlist: (id) => watchlist.some((m) => m.id === id),
      toggleLike: (m) => mutate(m, { type: stateOf(m.id).type === 'like' ? null : 'like' }),
      toggleDislike: (m) => mutate(m, { type: stateOf(m.id).type === 'dislike' ? null : 'dislike' }),
      setRating: (m, rating) => mutate(m, { rating: stateOf(m.id).rating === rating ? null : rating }),
      toggleWatchlist,
    };
  }, [interactions, watchlist, loading, user, toast]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
