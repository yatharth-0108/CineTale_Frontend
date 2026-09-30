import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { socialService } from '../services/socialService';

const Ctx = createContext(null);
export const useSocial = () => useContext(Ctx);

export function SocialProvider({ children }) {
  const { user } = useAuth(); const toast = useToast();
  const [ids, setIds] = useState([]); const busy = useRef(new Set());
  useEffect(() => { if (!user) { setIds([]); return; } socialService.getFollowIds(user).then(setIds).catch(() => toast('Could not load who you follow.', 'error')); /* eslint-disable-next-line */ }, [user?.id]);
  const value = useMemo(() => ({
    followIds: ids, isFollowing: (id) => ids.includes(id),
    async toggleFollow(id) {
      if (busy.current.has(id)) return; busy.current.add(id);
      const prev = ids, was = prev.includes(id);
      setIds(was ? prev.filter((x) => x !== id) : [...prev, id]);
      try { was ? await socialService.unfollow(user, id) : await socialService.follow(user, id); }
      catch { setIds(prev); toast('Could not update follow. Please try again.', 'error'); }
      finally { busy.current.delete(id); }
    },
  }), [ids, user, toast]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
