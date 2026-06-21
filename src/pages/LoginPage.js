import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import AuthEmailInput from '../components/AuthEmailInput';
import AuthLayout from '../components/AuthLayout';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { getDashboardPath } from '../utils/dashboard';
import { authAPI } from '../utils/api';
import { isValidEmail } from '../utils/validation';
import { initSessionActivity, getSession } from '../utils/sessionActivity';

function LoginPage() {
  const { page } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [errorKey, setErrorKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sessionNotice, setSessionNotice] = useState('');

  useEffect(() => {
    const state = location.state;
    if (!state) return;

    if (state.sessionExpired) {
      setSessionNotice(page.loginSessionExpired);
      const storedSession = getSession();
      if (storedSession?.email) setEmail(storedSession.email);
    }
    if (state.signupSuccess) {
      showToast(page.signupSuccess);
    }
    if (state.fromLogout) {
      setEmail('');
      setPassword('');
      setError('');
    }

    const preservedState = state.jobId
      ? { returnTo: state.returnTo, jobId: state.jobId, openApply: state.openApply }
      : state.returnTo
        ? { returnTo: state.returnTo, sessionExpired: state.sessionExpired }
        : null;

    navigate(location.pathname, { replace: true, state: preservedState });
  }, [location, navigate, page, showToast]);

  const showError = (message) => {
    setErrorKey((current) => current + 1);
    setError(message);
  };

  const clearError = () => {
    setError((current) => (current ? '' : current));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isValidEmail(email)) {
      showError(page.authEmailInvalid);
      return;
    }

    setLoading(true);

    try {
      const result = await authAPI.login({ email, password });
      setLoading(false);
      if (result.success) {
        localStorage.setItem('sjk_session', JSON.stringify({
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
          profilePicture: result.user.profilePicture || null,
        }));
        initSessionActivity();

        const redirect = location.state;
        if (redirect?.jobId && redirect?.returnTo) {
          if ((result.user.role || 'seeker') !== 'seeker') {
            showToast(page.loginSeekerRequired);
            navigate(getDashboardPath(result.user.role || 'seeker'));
          } else {
            navigate(redirect.returnTo, {
              state: { jobId: redirect.jobId, openApply: redirect.openApply },
            });
          }
        } else if (redirect?.returnTo) {
          navigate(redirect.returnTo, { replace: true });
        } else {
          navigate(getDashboardPath(result.user.role || 'seeker'));
        }
      } else {
        showError(result.message || 'Login failed');
      }
    } catch {
      setLoading(false);
      showError('Connection error. Please try again.');
    }
  };

  const unlockField = (e) => e.target.removeAttribute('readonly');

  return (
    <AuthLayout title={page.loginTitle} subtitle={page.loginSubtitle} backLink={
      <Link to="/" className="auth-back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {page.authBack}
      </Link>
    }>
      <form onSubmit={handleSubmit} className="auth-form" noValidate autoComplete="off">
        {sessionNotice && (
          <div className="alert alert-warning auth-alert rounded-3 py-2 small mb-3" role="status">
            {sessionNotice}
          </div>
        )}

        <AuthEmailInput
          id="login-email"
          name="sjk-login-email"
          label={page.loginEmail}
          value={email}
          onChange={(e) => {
            clearError();
            setEmail(e.target.value);
          }}
          onFocus={unlockField}
          placeholder={page.authPlaceholderEmail}
          required
          autoComplete="off"
          readOnly
        />

        <div className="mb-3">
          <label htmlFor="login-password" className="form-label auth-label">{page.loginPassword}</label>
          <div className="auth-password-wrap">
            <input
              id="login-password"
              name="sjk-login-password"
              type={showPassword ? 'text' : 'password'}
              className="form-control form-control-lg auth-input auth-input-with-toggle"
              value={password}
              onChange={(e) => {
                clearError();
                setPassword(e.target.value);
              }}
              onFocus={unlockField}
              placeholder={page.authPlaceholderPassword}
              required
              autoComplete="off"
              minLength={8}
              readOnly
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                  <path d="m14.12 14.12a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {error && (
          <div key={errorKey} className="alert alert-danger auth-alert auth-alert-error rounded-3 py-2 mb-3" role="alert">
            {error}
          </div>
        )}

        <button type="submit" className="btn btn-warning btn-lg w-100 auth-submit-btn rounded-pill fw-semibold mt-2" disabled={loading}>
          {loading ? '...' : page.loginButton}
        </button>

        <div className="auth-forgot-wrap mt-3">
          <div className="auth-forgot-right">
            <Link to="/reset-password" className="auth-link-small">{page.loginForgot}</Link>
          </div>
        </div>

        <p className="text-center text-muted mt-4 mb-0 auth-footer-text">
          {page.loginNoAccount}{' '}
          <Link to="/choose-role" className="auth-link">{page.loginSignupLink}</Link>
        </p>

      </form>
    </AuthLayout>
  );
}

export default LoginPage;
