import { useEffect, useRef } from 'react';
import Button from './Button';
export function Modal({ open, onClose, title, children }) {
  const ref = useRef(null);
  useEffect(() => { const d = ref.current; if (!d) return; if (open && !d.open) d.showModal(); if (!open && d.open) d.close(); }, [open]);
  return (
    <dialog ref={ref} className="modal" onClose={onClose} onClick={(e) => e.target === ref.current && onClose()} aria-labelledby="modal-title">
      {open && <div className="modal__body"><h2 id="modal-title">{title}</h2>{children}</div>}
    </dialog>
  );
}
export function ConfirmDialog({ open, title, message, confirmLabel = 'Delete', busy, onConfirm, onCancel }) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <p className="muted">{message}</p>
      <div className="modal__actions"><Button variant="secondary" onClick={onCancel} disabled={busy}>Cancel</Button><Button onClick={onConfirm} disabled={busy} className="btn--danger">{busy ? 'Working…' : confirmLabel}</Button></div>
    </Modal>
  );
}
export const Avatar = ({ name = '?', size = 40 }) => <span className="avatar" style={{ width: size, height: size, fontSize: size * 0.4 }} aria-hidden="true">{name[0]?.toUpperCase()}</span>;
