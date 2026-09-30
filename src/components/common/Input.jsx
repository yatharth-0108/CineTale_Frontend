import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { passwordStrength } from '../../utils/validators';
import './Input.css';

export default function Input({ label, error, hint, type = 'text', strength = false, ...rest }) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPw = type === 'password';
  const s = strength ? passwordStrength(rest.value || '') : 0;
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <div className="field__wrap">
        <input id={id} type={isPw && show ? 'text' : type} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-e` : hint ? `${id}-h` : undefined} {...rest} />
        {isPw && <button type="button" className="field__eye" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>}
      </div>
      {strength && rest.value && (
        <div className="strength" aria-live="polite"><div className="strength__bars">{[1, 2, 3, 4].map((n) => <i key={n} className={s >= n ? `on s${s}` : ''} />)}</div><span>{['', 'Weak', 'Fair', 'Good', 'Strong'][s]}</span></div>
      )}
      {error ? <p id={`${id}-e`} className="field__error" role="alert">{error}</p> : hint && <p id={`${id}-h`} className="field__hint">{hint}</p>}
    </div>
  );
}
