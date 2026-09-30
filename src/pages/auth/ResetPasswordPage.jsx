import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { validatePassword } from '../../utils/validators';

export default function ResetPasswordPage() {
  const { user, loading, recovery, isDemo } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  if (loading) return <p role="status">Checking your link…</p>;
  if (isDemo || !(recovery || user)) return (
    <>
      <h1>Link <em>invalid</em></h1>
      <p className="notice notice--error" role="alert">{isDemo ? 'Password reset is unavailable in demo mode.' : 'This reset link is invalid or has expired.'}</p>
      <Button to="/forgot-password" variant="secondary">Request a new link</Button>
    </>
  );
  if (status.state === 'done') return (
    <>
      <h1>Password <em>updated</em></h1>
      <p className="notice notice--ok" role="status">Your password was changed successfully.</p>
      <Button onClick={() => nav('/home', { replace: true })}>Continue</Button>
    </>
  );

  async function submit(e) {
    e.preventDefault();
    if (status.state === 'loading') return;
    const errs = { password: validatePassword(f.password), confirm: f.confirm !== f.password ? 'Passwords do not match.' : '' };
    setErrors(errs);
    if (errs.password || errs.confirm) return;
    setStatus({ state: 'loading' });
    try { await authService.updatePassword(f.password); setStatus({ state: 'done' }); }
    catch (er) { setStatus({ state: 'error', message: er.message }); }
  }
  return (
    <>
      <h1>Choose a new <em>password</em></h1>
      {status.state === 'error' && <p className="notice notice--error" role="alert">{status.message}</p>}
      <form onSubmit={submit} noValidate>
        <Input label="New password" type="password" autoComplete="new-password" strength value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} error={errors.password} />
        <Input label="Confirm password" type="password" autoComplete="new-password" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} error={errors.confirm} />
        <Button type="submit" size="lg" disabled={status.state === 'loading'}>{status.state === 'loading' ? 'Saving…' : 'Update Password'}</Button>
      </form>
      <Link to="/login" className="auth__link">Back to log in</Link>
    </>
  );
}
