import { Link } from 'react-router-dom';
import { useLibrary } from '../../context/LibraryContext';

const MIN = 5;
/** Computed only from the user's actual likes and ratings. */
export default function MovieDNAWidget() {
  const { interactions } = useLibrary();
  const positive = Object.values(interactions).filter((i) => i.movie && (i.type === 'like' || i.rating >= 4));
  if (positive.length < MIN) return (
    <div className="dna"><h3>Your Movie DNA</h3><p className="muted">Like or rate {MIN - positive.length} more movie{MIN - positive.length > 1 ? 's' : ''} to reveal your taste profile.</p><div className="dna__bar"><i style={{ width: `${(positive.length / MIN) * 100}%` }} /></div></div>
  );
  const counts = {};
  positive.forEach((i) => i.movie.genres?.forEach((g) => { counts[g] = (counts[g] || 0) + 1; }));
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);
  return (
    <div className="dna"><h3>Your Movie DNA</h3>
      {top.map(([g, c]) => <div key={g} className="dna__row"><span>{g}</span><div className="dna__bar"><i style={{ width: `${(c / top[0][1]) * 100}%` }} /></div></div>)}
      <p className="muted">Based on {positive.length} liked or highly rated movies.</p>
    </div>
  );
}
