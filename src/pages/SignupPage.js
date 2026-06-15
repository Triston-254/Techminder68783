import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { useLanguage } from '../context/LanguageContext';
import { authAPI } from '../utils/api';
import { getPasswordChecks, isPasswordValid, validatePhone } from '../utils/passwordRules';
import { setPendingWelcome } from '../utils/notifications';

function SignupPage() {
  const { page } = useLanguage();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const role = sessionStorage.getItem('sjk_selected_role');
    if (!role || (role !== 'seeker' && role !== 'employer')) {
      navigate('/choose-role', { replace: true });
      return;
    }
    setSelectedRole(role);
  }, [navigate]);

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const focusField = (e) => e.target.focus();

  const roleLabel = selectedRole === 'employer' ? page.roleEmployerTitle : page.roleSeekerTitle;
  const passwordChecks = getPasswordChecks(form.password);
  const passwordRules = [
    { key: 'length', met: passwordChecks.length, label: page.signupPasswordLength },
    { key: 'uppercase', met: passwordChecks.uppercase, label: page.signupPasswordUpper },
    { key: 'digit', met: passwordChecks.digit, label: page.signupPasswordDigit },
    { key: 'special', met: passwordChecks.special, label: page.signupPasswordSpecial },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isPasswordValid(form.password)) {
      setError(page.signupPasswordInvalid);
      return;
    }

    if (form.phone && !validatePhone(form.phone)) {
      setError(page.signupPhoneInvalid || 'Enter a valid phone number');
      return;
    }

    setLoading(true);
    try {
      const result = await authAPI.signup({ ...form, role: selectedRole });
      if (result.success) {
        setPendingWelcome({
          email: form.email,
          name: form.name,
          role: selectedRole,
        });
        sessionStorage.removeItem('sjk_selected_role');
        navigate('/login', { state: { signupSuccess: true } });
      } else {
        setError(result.message || 'Signup failed');
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!selectedRole) return null;

  return (
    <AuthLayout title={page.signupTitle} subtitle={page.signupSubtitle} backLink={
      <Link to="/" className="auth-back-link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {page.authBack}
      </Link>
    }>
      <div className="signup-role-badge mb-4">
        <span className="signup-role-label">{page.roleTitle}:</span>
        <span className="signup-role-value">{roleLabel}</span>
        <Link to="/choose-role" className="signup-role-change">{page.roleChangeLink}</Link>
      </div>

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="mb-3">
          <label htmlFor="signup-name" className="form-label auth-label">{page.signupName}</label>
          <input
            id="signup-name"
            type="text"
            className="form-control form-control-lg auth-input"
            value={form.name}
            onChange={update('name')}
            onMouseEnter={focusField}
            placeholder="Input your name"
            required
            autoComplete="name"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="signup-email" className="form-label auth-label">{page.signupEmail}</label>
          <input
            id="signup-email"
            type="email"
            className="form-control form-control-lg auth-input"
            value={form.email}
            onChange={update('email')}
            onMouseEnter={focusField}
            placeholder="Input email"
            required
            autoComplete="email"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="signup-phone" className="form-label auth-label">{page.signupPhone}</label>
          <input
            id="signup-phone"
            type="tel"
            className="form-control form-control-lg auth-input"
            value={form.phone}
            onChange={update('phone')}
            onMouseEnter={focusField}
            placeholder="07XX XXX XXX"
            autoComplete="tel"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="signup-password" className="form-label auth-label">{page.signupPassword}</label>
          <div className="auth-password-wrap">
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              className="form-control form-control-lg auth-input auth-input-with-toggle"
              value={form.password}
              onChange={update('password')}
              onMouseEnter={focusField}
              placeholder="Input password"
              required
              autoComplete="new-password"
              minLength={8}
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
        <div className="form-text auth-hint mb-2">{page.signupPasswordHint}</div>
        <ul className="password-requirements list-unstyled mb-0">
          {passwordRules.map((rule) => (
            <li
              key={rule.key}
              className={`password-requirement${rule.met ? ' password-requirement-met' : ''}`}
            >
              <span className="password-requirement-check" aria-hidden="true">
                {rule.met && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </span>
              <span>{rule.label}</span>
            </li>
          ))}
        </ul>

        <button type="submit" className="btn btn-warning btn-lg w-100 auth-submit-btn rounded-pill fw-semibold mt-2" disabled={loading}>
          {loading ? '...' : page.signupButton}
        </button>

        {error && <div className="alert alert-danger auth-alert rounded-3 py-2 mt-3">{error}</div>}

        <p className="text-center text-muted mt-4 mb-0 auth-footer-text">
          {page.signupHasAccount}{' '}
          <Link to="/login" className="auth-link">{page.signupLoginLink}</Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export default SignupPage;