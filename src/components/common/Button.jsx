import { Link } from 'react-router-dom';
import './Button.css';

export default function Button({ to, variant = 'primary', size = 'md', className = '', children, ...rest }) {
  const cls = `btn btn--${variant} btn--${size} ${className}`;
  if (to) return <Link to={to} className={cls} {...rest}>{children}</Link>;
  if (rest.href) return <a className={cls} {...rest}>{children}</a>;
  return <button className={cls} {...rest}>{children}</button>;
}
