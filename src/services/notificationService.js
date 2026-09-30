import { supabase } from './supabaseClient';
import { ls, uid } from '../utils/localStore';
const key = (u) => `cinetale_demo_notifications_${u.id}`;
const isDemo = (u) => u.demo || !supabase;
const fail = (e, m) => { if (e) throw new Error(m); };
/* Remote notifications are expected to be created by database triggers (follows, post_likes, comments).
   Refresh is explicit; no realtime subscription is assumed. */
export const notificationService = {
  async list(user) {
    if (isDemo(user)) {
      const seeded = `${key(user)}_seeded`;
      if (!ls.get(seeded, false)) { ls.set(key(user), [{ id: uid(), type: 'system', text: 'Welcome to CineTale! Notifications about follows, likes and comments will show up here.', link: '/discover', read: false, createdAt: new Date().toISOString() }]); ls.set(seeded, true); }
      return ls.get(key(user), []);
    }
    const { data, error } = await supabase.from('notifications').select('id,type,text,link,read,created_at').eq('user_id', user.id).order('created_at', { ascending: false }).limit(50);
    fail(error, 'Could not load notifications.');
    return data.map((n) => ({ id: n.id, type: n.type, text: n.text, link: n.link, read: n.read, createdAt: n.created_at }));
  },
  async markRead(user, id) {
    if (isDemo(user)) { ls.set(key(user), ls.get(key(user), []).map((n) => (n.id === id ? { ...n, read: true } : n))); return; }
    fail((await supabase.from('notifications').update({ read: true }).eq('id', id)).error, 'Could not update the notification.');
  },
  async markAllRead(user) {
    if (isDemo(user)) { ls.set(key(user), ls.get(key(user), []).map((n) => ({ ...n, read: true }))); return; }
    fail((await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)).error, 'Could not mark all as read.');
  },
};
