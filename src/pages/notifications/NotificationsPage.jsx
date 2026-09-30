import { useNavigate } from 'react-router-dom';
import { Bell, RefreshCw } from 'lucide-react';
import Button from '../../components/common/Button';
import { EmptyState, ErrorState, Skeleton } from '../../components/common/States';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useAsync } from '../../hooks/useAsync';
import { notificationService } from '../../services/notificationService';
import { timeAgo } from '../../utils/localStore';
import { useState } from 'react';

export default function NotificationsPage() {
  const { user } = useAuth(); const toast = useToast(); const nav = useNavigate();
  const { data, loading, error, reload } = useAsync(() => notificationService.list(user), [user.id]);
  const [read, setRead] = useState(new Set());
  const isRead = (n) => n.read || read.has(n.id);
  const unread = (data || []).filter((n) => !isRead(n)).length;
  async function open(n) {
    if (!isRead(n)) { setRead((s) => new Set(s).add(n.id)); try { await notificationService.markRead(user, n.id); } catch { setRead((s) => { const c = new Set(s); c.delete(n.id); return c; }); toast('Could not mark as read.', 'error'); } }
    if (n.link) nav(n.link);
  }
  async function markAll() { try { await notificationService.markAllRead(user); setRead(new Set((data || []).map((n) => n.id))); } catch (e) { toast(e.message, 'error'); } }
  return (
    <div className="narrow">
      <div className="pagehead"><h1><em>Notifications</em></h1><p>{unread ? `${unread} unread` : 'You are all caught up.'}</p></div>
      <div className="tools"><Button size="sm" variant="secondary" onClick={markAll} disabled={!unread}>Mark all as read</Button><Button size="sm" variant="ghost" onClick={() => { setRead(new Set()); reload(); }}><RefreshCw size={14} /> Refresh</Button></div>
      {error ? <ErrorState error={error} onRetry={reload} /> : loading ? <Skeleton style={{ height: 90 }} /> : !data?.length ? <EmptyState title="No notifications" message="Follows, likes and comments will appear here." /> : (
        <ul className="notes">{data.map((n) => <li key={n.id}><button className={isRead(n) ? '' : 'unread'} onClick={() => open(n)}><Bell size={18} /><span>{n.text}<small>{timeAgo(n.createdAt)}</small></span>{!isRead(n) && <i aria-label="Unread" />}</button></li>)}</ul>
      )}
    </div>
  );
}
