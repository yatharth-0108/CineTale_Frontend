import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import { Home, Sparkles, Compass, Bookmark, Search, LogOut, Users, UserPlus, Bell, FolderHeart, User, Menu } from 'lucide-react';
import { Logo } from './PublicLayout';
import { useAuth } from '../context/AuthContext';
import './AppLayout.css';

const NAV = [['/home', 'Home', Home], ['/for-you', 'For You', Sparkles], ['/discover', 'Discover', Compass], ['/community', 'Community', Users], ['/watchlist', 'Watchlist', Bookmark], ['/collections', 'Collections', FolderHeart], ['/people', 'People', UserPlus], ['/notifications', 'Notifications', Bell]];

export default function AppLayout() {
  const { user, signOut, isDemo } = useAuth();
  const { pathname } = useLocation();
  const name = user.fullName || user.username || user.email;
  const me = `/profile/${user.username}`;
  const TABS = [['/home', 'Home', Home], ['/discover', 'Discover', Compass], ['/community', 'Community', Users], ['/notifications', 'Alerts', Bell], [me, 'Me', User]];
  return (
    <div className="shell">
      <aside className="side">
        <Logo />
        <nav aria-label="Main">{NAV.map(([to, label, Icon]) => <NavLink key={to} to={to} className="side__link"><Icon size={20} />{label}</NavLink>)}
          <NavLink to="/search" className="side__link"><Search size={20} />Search</NavLink>
          <NavLink to={me} className="side__link"><User size={20} />Profile</NavLink></nav>
        <details className="account">
          <summary><span className="avatar" aria-hidden="true">{name[0]?.toUpperCase()}</span><span className="account__name">{name}</span></summary>
          <div className="account__menu">{isDemo && <p>Demo session</p>}<button onClick={signOut}><LogOut size={16} /> Sign out</button></div>
        </details>
      </aside>
      <div className="shell__main">
        <header className="topbar"><Logo /><div className="topbar__r"><Link to="/search" aria-label="Search"><Search size={22} /></Link>
          <details className="tmenu"><summary aria-label="Menu"><Menu size={22} /></summary><div>{[...NAV, [me, 'Profile', User]].map(([to, label]) => <Link key={to} to={to} onClick={(e) => e.currentTarget.closest('details').removeAttribute('open')}>{label}</Link>)}<button onClick={signOut}>Sign out</button></div></details></div></header>
        <main key={pathname} className="page"><Outlet /></main>
      </div>
      <nav className="tabs" aria-label="Mobile">{TABS.map(([to, label, Icon]) => <NavLink key={to} to={to}><Icon size={22} /><span>{label}</span></NavLink>)}</nav>
    </div>
  );
}
