import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Button from '../components/common/Button';
import { isDemoMode } from '../config/env';
import './PublicLayout.css';

export const Logo = () => (<Link to="/" className="logo" aria-label="CineTale home">Cine<em>Tale</em></Link>);

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const links = [['Explore', '/#explore'], ['How It Works', '/#how'], ['Community', '/#community']];
  return (
    <div className="public">
      {isDemoMode && <div className="demo-banner" role="status">Demo mode — sample data only. No real accounts or recommendations yet.</div>}
      <header className="nav">
        <div className="container nav__inner">
          <Logo />
          <nav className={`nav__links ${open ? 'is-open' : ''}`} aria-label="Primary">
            {links.map(([label, href]) => <a key={label} href={href} onClick={() => setOpen(false)}>{label}</a>)}
            <NavLink to="/login" className="nav__login" onClick={() => setOpen(false)}>Log In</NavLink>
          </nav>
          <Button to="/signup" size="sm" className="nav__cta">Get Started</Button>
          <button className="nav__toggle" aria-label="Toggle menu" aria-expanded={open} onClick={() => setOpen(!open)}>{open ? <X size={22} /> : <Menu size={22} />}</button>
        </div>
      </header>
      <main><Outlet /></main>
      <footer className="footer">
        <div className="container footer__inner">
          <div><Logo /><p>Movies, tasted together.</p></div>
          <nav aria-label="Footer">
            {['About', 'Features', 'Privacy', 'Terms', 'Contact'].map((l) => <a key={l} href="#top">{l}</a>)}
          </nav>
        </div>
        <p className="footer__note container">© {new Date().getFullYear()} CineTale. Movie data will be provided by TMDB.</p>
      </footer>
    </div>
  );
}
