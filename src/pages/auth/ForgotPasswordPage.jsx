import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { authService } from '../../services/authService';
import { validateEmail } from '../../utils/validators';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState({ state: 'idle', message: '', demo: false });

  async function submit(e) {
    e.preventDefault();
    if (status.state === 'loading') return;
    const err = validateEmail(email); setError(err);
    if (err) return;
    setStatus({ state: 'loading' });
    try { const r = await authService.requestPasswordReset(email); setStatus({ state: 'sent', demo: r.demo }); }
    catch (er) { setStatus({ state: 'error', message: er.message }); }
  }

  if (status.state === 'sent') return (
    <>
      <h1>Check your <em>email</em></h1>
      {status.demo
        ? <p className="notice notice--info" role="status">Demo mode: no email was sent. Connect Supabase to enable password reset.</p>
        : <p className="notice notice--ok" role="status">If an account exists for {email}, a reset link is on its way.</p>}
      <Link to="/login" className="auth__link">Back to log in</Link>
    </>
  );
  return (
    <>
      <h1>Reset your <em>password</em></h1>
      <p className="auth__sub">Enter your email and we'll send a reset link.</p>
      {status.state === 'error' && <p className="notice notice--error" role="alert">{status.message}</p>}
      <form onSubmit={submit} noValidate>
        <Input label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} />
        <Button type="submit" size="lg" disabled={status.state === 'loading'}>{status.state === 'loading' ? 'Sending…' : 'Send Reset Link'}</Button>
      </form>
      <Link to="/login" className="auth__link">Back to log in</Link>
    </>
  );
}
