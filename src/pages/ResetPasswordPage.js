import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import AuthEmailInput from '../components/AuthEmailInput';
import AuthLayout from '../components/AuthLayout';
import { useLanguage } from '../context/LanguageContext';
import { authAPI } from '../utils/api';
import { isValidEmail } from '../utils/validation';

function ResetSuccessCheck() {
  return (
    <span className="auth-success-check" aria-hidden="true">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6L9 17l-5-5" />
      </svg>
    </span>
  );
}

function ResetPasswordPage() {
  const { page } = useLanguage();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sent, setSent] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorKey, setErrorKey] = useState(0);

  const isConfirmMode = !!token;

  const showError = (message) => {
    setErrorKey((current) => current + 1);
    setError(message);
  };

  const clearError = () => {
    setError((current) => (current ? '' : current));
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      showError(page.authEmailInvalid);
      return;
    }

    setLoading(true);
    try {
      await authAPI.requestPasswordReset({ email });
      setSent(true);
    } catch {
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) {
      showError('Password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const result = await authAPI.resetPassword({ email, token, password: newPassword });
      if (result.success) {
        setResetComplete(true);
      } else {
        showError(result.message || 'Reset failed');
      }
    } catch {
      showError('Connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title={page.resetTitle} subtitle={page.resetSubtitle}>
      {resetComplete ? (
        <div className="auth-success-box text-center p-4 rounded-4">
          <div className="auth-success-icon mb-3">
            <ResetSuccessCheck />
          </div>
          <p className="mb-0 text-muted">{page.loginResetSuccess}</p>
          <Link to="/login" className="btn btn-warning rounded-pill fw-semibold mt-4 px-4">
            {page.resetBackLogin}
          </Link>
        </div>
      ) : isConfirmMode ? (
        <form onSubmit={handleConfirmSubmit} className="auth-form" noValidate>
          <div className="mb-3">
            <label htmlFor="reset-new-password" className="form-label auth-label">New Password</label>
            <input
              id="reset-new-password"
              type="password"
              className="form-control form-control-lg auth-input"
              value={newPassword}
              onChange={(e) => {
                clearError();
                setNewPassword(e.target.value);
              }}
              placeholder={page.authPlaceholderPassword}
              required
              autoComplete="new-password"
              minLength={8}
            />
          </div>
          <div className="mb-3">
            <label htmlFor="reset-confirm-password" className="form-label auth-label">Confirm Password</label>
            <input
              id="reset-confirm-password"
              type="password"
              className="form-control form-control-lg auth-input"
              value={confirmPassword}
              onChange={(e) => {
                clearError();
                setConfirmPassword(e.target.value);
              }}
              placeholder={page.authPlaceholderPassword}
              required
              autoComplete="new-password"
              minLength={8}
            />
          </div>
          {error && (
            <div key={errorKey} className="alert alert-danger auth-alert auth-alert-error rounded-3 py-2 mb-3" role="alert">
              {error}
            </div>
          )}
          <button type="submit" className="btn btn-warning btn-lg w-100 auth-submit-btn rounded-pill fw-semibold" disabled={loading}>
            {loading ? '...' : 'Reset Password'}
          </button>
          <p className="text-center mt-4 mb-0">
            <Link to="/login" className="auth-link">{page.resetBackLogin}</Link>
          </p>
        </form>
      ) : sent ? (
        <div className="auth-success-box text-center p-4 rounded-4">
          <div className="auth-success-icon mb-3">✉️</div>
          <p className="mb-0 text-muted">
            {page.resetSuccess} <strong>{email}</strong>
          </p>
          <Link to="/login" className="btn btn-warning rounded-pill fw-semibold mt-4 px-4">
            {page.resetBackLogin}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleRequestSubmit} className="auth-form" noValidate>
          <AuthEmailInput
            id="reset-email"
            label={page.resetEmail}
            value={email}
            onChange={(e) => {
              clearError();
              setEmail(e.target.value);
            }}
            placeholder={page.authPlaceholderEmailExample}
            required
            autoComplete="email"
            className="mb-4"
          />
          {error && (
            <div key={errorKey} className="alert alert-danger auth-alert auth-alert-error rounded-3 py-2 mb-3" role="alert">
              {error}
            </div>
          )}
          <button type="submit" className="btn btn-warning btn-lg w-100 auth-submit-btn rounded-pill fw-semibold" disabled={loading}>
            {loading ? '...' : page.resetButton}
          </button>
          <p className="text-center mt-4 mb-0">
            <Link to="/login" className="auth-link">{page.resetBackLogin}</Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}

export default ResetPasswordPage;
