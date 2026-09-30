import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import DemoNotice from './DemoNotice';
import { authService } from '../../services/authService';
import { validateEmail } from '../../utils/validators';

export default function LoginPage() {
  const nav = useNavigate();
  const from = useLocation().state?.from || '/home';
  const [f, setF] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  async function submit(e) {
    e.preventDefault();
    if (status.state === 'loading') return;
    const errs = { email: validateEmail(f.email), password: f.password ? '' : 'Password is required.' };
    setErrors(errs);
    if (errs.email || errs.password) return;
    setStatus({ state: 'loading', message: '' });
    try { await authService.signIn(f); nav(from, { replace: true }); }
    catch (err) { setStatus({ state: 'error', message: navigator.onLine ? err.message : 'You appear to be offline. Check your connection and try again.' }); }
  }

  return (
    <>
      <h1>Welcome <em>back</em></h1>
      <p className="auth__sub">Log in to pick up where you left off.</p>
      <DemoNotice>Demo mode: no password is verified. Any email opens a local demo session.</DemoNotice>
      {status.state === 'error' && <p className="notice notice--error" role="alert">{status.message}</p>}
      <form onSubmit={submit} noValidate>
        <Input label="Email" type="email" autoComplete="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} error={errors.email} />
        <Input label="Password" type="password" autoComplete="current-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} error={errors.password} />
        <Link to="/forgot-password" className="auth__link">Forgot password?</Link>
        <Button type="submit" size="lg" disabled={status.state === 'loading'}>{status.state === 'loading' ? 'Logging in…' : 'Log In'}</Button>
      </form>
      <p className="auth__alt">New to CineTale? <Link to="/signup">Create an account</Link></p>
    </>
  );
}
