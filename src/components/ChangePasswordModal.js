import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../utils/api';

function ChangePasswordModal({ email, open, onClose }) {
  const { page } = useLanguage();
  const { showToast } = useToast();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm({ current: '', next: '', confirm: '' });
    setError('');
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.next !== form.confirm) {
      setError(page.employerPasswordMismatch);
      return;
    }

    setLoading(true);
    try {
      const result = await authAPI.changePassword({
        current_password: form.current,
        new_password: form.next,
      });
      setLoading(false);
      if (result.success) {
        showToast(page.employerPasswordSuccess);
        setForm({ current: '', next: '', confirm: '' });
        setTimeout(onClose, 300);
      } else {
        if (result.message?.includes('Current password')) setError(page.employerPasswordWrong);
        else setError(result.message || page.signupPasswordHint);
      }
    } catch {
      setLoading(false);
      setError('Connection error.');
    }
  };

  return (
    <div className="employer-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="employer-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="employer-modal-header">
          <h2 id="change-password-title" className="employer-modal-title">{page.employerChangePassword}</h2>
          <button type="button" className="employer-modal-close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="employer-modal-desc">{page.employerChangePasswordDesc}</p>

        {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label employer-label" htmlFor="modal-current-password">
              {page.employerCurrentPassword}
            </label>
            <input
              id="modal-current-password"
              type="password"
              className="form-control employer-input"
              value={form.current}
              onChange={(e) => setForm((p) => ({ ...p, current: e.target.value }))}
              required
              autoComplete="current-password"
            />
          </div>
          <div className="mb-3">
            <label className="form-label employer-label" htmlFor="modal-new-password">
              {page.employerNewPassword}
            </label>
            <input
              id="modal-new-password"
              type="password"
              className="form-control employer-input"
              value={form.next}
              onChange={(e) => setForm((p) => ({ ...p, next: e.target.value }))}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div className="mb-4">
            <label className="form-label employer-label" htmlFor="modal-confirm-password">
              {page.employerConfirmPassword}
            </label>
            <input
              id="modal-confirm-password"
              type="password"
              className="form-control employer-input"
              value={form.confirm}
              onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>
          <div className="d-flex gap-2 justify-content-end">
            <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>
              {page.employerModalCancel}
            </button>
            <button type="submit" className="btn btn-warning fw-semibold rounded-pill px-4" disabled={loading}>
              {loading ? '...' : page.employerUpdatePassword}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;
