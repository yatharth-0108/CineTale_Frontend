import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <section className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
      <h1>Scene <em>not found</em></h1>
      <p style={{ color: 'var(--muted)', margin: '1rem 0 2rem' }}>The page you're looking for isn't on the reel.</p>
      <Link to="/">Back to home</Link>
    </section>
  );
}
