import { Bookmark, BookmarkCheck, ThumbsDown, ThumbsUp } from 'lucide-react';
import { useLibrary } from '../../context/LibraryContext';

export function LikeButton({ movie, label }) {
  const { stateOf, toggleLike } = useLibrary(); const on = stateOf(movie.id).type === 'like';
  return <button type="button" className={`act ${on ? 'is-on' : ''}`} aria-pressed={on} aria-label={`Like ${movie.title}`} onClick={() => toggleLike(movie)}><ThumbsUp size={18} fill={on ? 'currentColor' : 'none'} />{label && 'Like'}</button>;
}
export function DislikeButton({ movie, label }) {
  const { stateOf, toggleDislike } = useLibrary(); const on = stateOf(movie.id).type === 'dislike';
  return <button type="button" className={`act act--dis ${on ? 'is-on' : ''}`} aria-pressed={on} aria-label={`Dislike ${movie.title}`} onClick={() => toggleDislike(movie)}><ThumbsDown size={18} fill={on ? 'currentColor' : 'none'} />{label && 'Dislike'}</button>;
}
export function WatchlistButton({ movie, label }) {
  const { inWatchlist, toggleWatchlist } = useLibrary(); const on = inWatchlist(movie.id);
  return <button type="button" className={`act ${on ? 'is-on' : ''}`} aria-pressed={on} aria-label={on ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`} onClick={() => toggleWatchlist(movie)}>{on ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}{label && (on ? 'In watchlist' : 'Watchlist')}</button>;
}
