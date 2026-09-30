import { useAuth } from '../../context/AuthContext';
export default function DemoNotice({ children }) {
  const { isDemo } = useAuth();
  return isDemo ? <p className="notice notice--info" role="note">{children}</p> : null;
}
