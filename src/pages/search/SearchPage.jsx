import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import SearchBar from '../../components/common/SearchBar';
import { EmptyState } from '../../components/common/States';
import { MovieGrid } from '../../components/movies/MovieLists';
import { useAsync } from '../../hooks/useAsync';
import { searchMovies } from '../../services/movieService';

export default function SearchPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q')?.trim() || '';
  const [sort, setSort] = useState('relevance');
  const [genre, setGenre] = useState('All');
  const { data, loading, error, reload } = useAsync(() => (query ? searchMovies(query) : Promise.resolve(null)), [query]);
  const genres = useMemo(() => ['All', ...new Set((data?.movies || []).flatMap((m) => m.genres))], [data]);
  const movies = useMemo(() => {
    let l = (data?.movies || []).filter((m) => genre === 'All' || m.genres.includes(genre));
    if (sort === 'rating') l = [...l].sort((a, b) => b.vote_average - a.vote_average);
    if (sort === 'newest') l = [...l].sort((a, b) => b.release_date.localeCompare(a.release_date));
    return l;
  }, [data, sort, genre]);

  return (
    <>
      <div className="pagehead"><h1>Search</h1>{query && <p>Results for “{query}”{data?.source === 'demo' && ' (demo data)'}</p>}</div>
      <SearchBar initial={query} onClear={() => setParams({})} />
      {!query ? <div style={{ marginTop: '1.5rem' }}><EmptyState title="Search for a movie" message="Type a title above and press Enter." /></div> : (
        <>
          <div className="tools"><select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}><option value="relevance">Sort: Relevance</option><option value="rating">Highest rated</option><option value="newest">Newest</option></select>
            <select aria-label="Genre" value={genre} onChange={(e) => setGenre(e.target.value)}>{genres.map((g) => <option key={g}>{g}</option>)}</select></div>
          <MovieGrid movies={movies} loading={loading} error={error} onRetry={reload} empty={<EmptyState title={`No results for “${query}”`} message="Check the spelling or try a different title." action={{ label: 'Clear search', onClick: () => setParams({}) }} />} />
        </>
      )}
    </>
  );
}
