import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
export default function SearchBar({ initial = '', onClear, placeholder = 'Search movies…' }) {
  const nav = useNavigate();
  const [v, setV] = useState(initial);
  useEffect(() => setV(initial), [initial]);
  return (
    <form className="searchbar" role="search" onSubmit={(e) => { e.preventDefault(); if (v.trim()) nav(`/search?q=${encodeURIComponent(v.trim())}`); }}>
      <Search size={18} aria-hidden="true" />
      <input value={v} onChange={(e) => setV(e.target.value)} placeholder={placeholder} aria-label="Search movies" />
      {v && <button type="button" aria-label="Clear search" onClick={() => { setV(''); onClear?.(); }}><X size={16} /></button>}
    </form>
  );
}
