import Button from './Button';
export const Skeleton = ({ className = '', style }) => <div className={`skeleton ${className}`} style={style} aria-hidden="true" />;
export function EmptyState({ title, message, action }) {
  return <div className="state"><h3>{title}</h3>{message && <p>{message}</p>}{action && (action.to ? <Button to={action.to}>{action.label}</Button> : <Button onClick={action.onClick}>{action.label}</Button>)}</div>;
}
export function ErrorState({ error, onRetry }) {
  return <div className="state state--error" role="alert"><h3>Something went wrong</h3><p>{error?.message || 'Please try again.'}</p>{onRetry && <Button variant="secondary" onClick={onRetry}>Try again</Button>}</div>;
}
