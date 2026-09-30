import { useMemo, useState } from 'react';
import { EmptyState } from '../../components/common/States';
import { MovieGrid } from '../../components/movies/MovieLists';
import { useLibrary } from '../../context/LibraryContext';

export default function WatchlistPage() {
  const { watchlist, loading } = useLibrary();
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('added');
  const [genre, setGenre] = useState('All');
  const genres = useMemo(() => ['All', ...new Set(watchlist.flatMap((m) => m.genres || []))], [watchlist]);
  const movies = useMemo(() => {
    let l = watchlist.filter((m) => m.title.toLowerCase().includes(q.toLowerCase()) && (genre === 'All' || m.genres?.includes(genre)));
    if (sort === 'title') l = [...l].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === 'year') l = [...l].sort((a, b) => (b.release_date || '').localeCompare(a.release_date || ''));
    return l; // 'added' keeps stored order (newest first)
  }, [watchlist, q, sort, genre]);
  return (
    <>
      <div className="pagehead"><h1>Your <em>watchlist</em></h1><p>{watchlist.length} saved movie{watchlist.length === 1 ? '' : 's'}</p></div>
      {(watchlist.length > 0 || loading) && (
        <div className="tools">
          <input type="search" aria-label="Search watchlist" placeholder="Search your watchlist" value={q} onChange={(e) => setQ(e.target.value)} />
          <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}><option value="added">Recently added</option><option value="title">Title</option><option value="year">Release year</option></select>
          <select aria-label="Genre" value={genre} onChange={(e) => setGenre(e.target.value)}>{genres.map((g) => <option key={g}>{g}</option>)}</select>
        </div>
      )}
      <MovieGrid movies={movies} loading={loading}
        empty={watchlist.length ? <EmptyState title="No matches" message="Try a different search or genre." /> : <EmptyState title="Your watchlist is empty" message="Save movies you want to watch and they'll appear here." action={{ label: 'Discover movies', to: '/discover' }} />} />
    </>
  );
}
