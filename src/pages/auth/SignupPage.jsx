import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import DemoNotice from './DemoNotice';
import { authService } from '../../services/authService';
import { userService } from '../../services/userService';
import { validateName, validateUsername, validateEmail, validatePassword } from '../../utils/validators';

export default function SignupPage() {
  const nav = useNavigate();
  const [f, setF] = useState({ fullName: '', username: '', email: '', password: '', confirm: '', terms: false });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const validate = () => ({
    fullName: validateName(f.fullName), username: validateUsername(f.username), email: validateEmail(f.email),
    password: validatePassword(f.password), confirm: f.confirm !== f.password ? 'Passwords do not match.' : '',
    terms: f.terms ? '' : 'Please accept the Terms and Privacy Policy.',
  });

  async function submit(e) {
    e.preventDefault();
    if (status.state === 'loading') return;
    const errs = validate(); setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setStatus({ state: 'loading', message: '' });
    try {
      if (!(await userService.isUsernameAvailable(f.username))) { setErrors({ username: 'That username is taken.' }); setStatus({ state: 'idle', message: '' }); return; }
      const res = await authService.signUp(f);
      if (res.needsVerification) setStatus({ state: 'verify', message: '' });
      else nav('/onboarding', { replace: true });
    } catch (err) {
      setStatus({ state: 'error', message: navigator.onLine ? err.message : 'You appear to be offline. Check your connection and try again.' });
    }
  }

  if (status.state === 'verify') return (
    <>
      <h1>Check your <em>inbox</em></h1>
      <p className="notice notice--ok" role="status">We sent a verification link to {f.email}. Confirm your email, then log in to continue.</p>
      <Button to="/login" variant="secondary">Go to Log In</Button>
    </>
  );

  return (
    <>
      <h1>Create your <em>account</em></h1>
      <p className="auth__sub">Start building your Movie DNA.</p>
      <DemoNotice>Demo mode: your profile is stored only in this browser and no email is verified.</DemoNotice>
      {status.state === 'error' && <p className="notice notice--error" role="alert">{status.message}</p>}
      <form onSubmit={submit} noValidate>
        <Input label="Full name" autoComplete="name" value={f.fullName} onChange={set('fullName')} error={errors.fullName} />
        <Input label="Username" autoComplete="username" value={f.username} onChange={set('username')} error={errors.username} hint="Letters, numbers, underscores." />
        <Input label="Email" type="email" autoComplete="email" value={f.email} onChange={set('email')} error={errors.email} />
        <Input label="Password" type="password" autoComplete="new-password" strength value={f.password} onChange={set('password')} error={errors.password} />
        <Input label="Confirm password" type="password" autoComplete="new-password" value={f.confirm} onChange={set('confirm')} error={errors.confirm} />
        <label className="check"><input type="checkbox" checked={f.terms} onChange={set('terms')} /><span>I agree to the Terms and Privacy Policy.</span></label>
        {errors.terms && <p className="field__error" role="alert">{errors.terms}</p>}
        <Button type="submit" size="lg" disabled={status.state === 'loading'}>{status.state === 'loading' ? 'Creating account…' : 'Create Account'}</Button>
      </form>
      <p className="auth__alt">Already have an account? <Link to="/login">Log in</Link></p>
    </>
  );
}
