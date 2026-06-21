import { useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';
import { authAPI } from '../utils/api';

const MAX_PHOTO_SIZE = 2 * 1024 * 1024;

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function ProfileIcon({ className = '' }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function ThemeIcon({ className = '' }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function PasswordIcon({ className = '' }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ProfileWorkspace({ session, user, refresh }) {
  const { page } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const fileRef = useRef(null);
  const [activeSection, setActiveSection] = useState('profile');
  const [photoError, setPhotoError] = useState('');
  const [passwordForm, setPasswordForm] = useState({ current: '', next: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const profilePicture = user?.profilePicture || session?.profilePicture;
  const phone = user?.phone || session?.phone || '-';

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError('');

    if (!file.type.startsWith('image/')) {
      setPhotoError(page.employerPhotoInvalid);
      return;
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError(page.employerPhotoTooLarge);
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const picture = reader.result;
      const raw = localStorage.getItem('sjk_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed.profilePicture = picture;
        localStorage.setItem('sjk_session', JSON.stringify(parsed));
      }

      try {
        await authAPI.updateProfile({ profilePicture: picture });
      } catch {
        setPhotoError('Failed to save profile photo.');
        return;
      }

      refresh();
      showToast(page.employerPhotoSuccess);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handlePasswordChange = (field) => (e) => {
    setPasswordSuccess(false);
    setPasswordForm((p) => ({ ...p, [field]: e.target.value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (passwordForm.next !== passwordForm.confirm) {
      setPasswordError(page.employerPasswordMismatch);
      return;
    }

    setPasswordLoading(true);
    try {
      const result = await authAPI.changePassword({
        current_password: passwordForm.current,
        new_password: passwordForm.next,
      });
      setPasswordLoading(false);
      if (result.success) {
        showToast(page.employerPasswordSuccess);
        setPasswordForm({ current: '', next: '', confirm: '' });
        setPasswordSuccess(true);
      } else {
        setPasswordError(result.message?.includes('Current password') ? page.employerPasswordWrong : page.signupPasswordHint);
      }
    } catch {
      setPasswordLoading(false);
      setPasswordError('Connection error.');
    }
  };

  const navItems = [
    { key: 'profile', label: 'Profile Details', icon: <ProfileIcon /> },
    { key: 'theme', label: 'Change Theme', icon: <ThemeIcon /> },
    { key: 'password', label: page.employerChangePassword, icon: <PasswordIcon /> },
  ];

  return (
    <div className="profile-workspace">
      <aside className="profile-sidebar" aria-label={page.employerMyProfile}>
        <div className="profile-sidebar-photo-wrap mx-auto">
          {profilePicture ? (
            <img src={profilePicture} alt="" className="profile-sidebar-photo" />
          ) : (
            <div className="profile-sidebar-photo profile-sidebar-photo-empty">
              <ProfileIcon className="profile-sidebar-empty-icon" />
              <span>{getInitials(session?.name)}</span>
            </div>
          )}
          <button
            type="button"
            className="profile-photo-upload"
            aria-label={page.employerUploadPhoto}
            onClick={() => fileRef.current?.click()}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <path d="M17 8l-5-5-5 5" />
              <path d="M12 3v12" />
            </svg>
          </button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="d-none" onChange={handlePhotoChange} />
        <h2 className="profile-sidebar-name">{session?.name}</h2>

        {photoError && (
          <div className="profile-inline-alert profile-inline-alert-error">
            {photoError}
          </div>
        )}

        <nav className="profile-sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`profile-sidebar-link${activeSection === item.key ? ' profile-sidebar-link-active' : ''}`}
              onClick={() => {
                setActiveSection(item.key);
                if (item.key !== 'password') setPasswordSuccess(false);
              }}
            >
              <span className="profile-sidebar-link-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="profile-panel">
        {activeSection === 'profile' && (
          <>
            <h2 className="profile-panel-title">Profile Details</h2>
            <dl className="employer-details-list">
              <div className="employer-details-row">
                <dt>{page.signupName}</dt>
                <dd>{session.name}</dd>
              </div>
              <div className="employer-details-row">
                <dt>{page.signupEmail}</dt>
                <dd>{session.email}</dd>
              </div>
              <div className="employer-details-row">
                <dt>{page.signupPhone}</dt>
                <dd>{phone}</dd>
              </div>
            </dl>
          </>
        )}

        {activeSection === 'theme' && (
          <>
            <h2 className="profile-panel-title">Change Theme</h2>
            <p className="text-muted small mb-3">{page.employerThemeDesc}</p>
            <div className="employer-theme-options">
              <button
                type="button"
                className={`employer-theme-btn${theme === 'light' ? ' employer-theme-btn-active' : ''}`}
                onClick={() => setTheme('light')}
              >
                <span className="employer-theme-icon" aria-hidden="true">Light</span>
                {page.employerThemeLight}
              </button>
              <button
                type="button"
                className={`employer-theme-btn${theme === 'dark' ? ' employer-theme-btn-active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                <span className="employer-theme-icon" aria-hidden="true">Dark</span>
                {page.employerThemeDark}
              </button>
            </div>
          </>
        )}

        {activeSection === 'password' && (
          <form className="profile-password-form" onSubmit={handlePasswordSubmit} noValidate>
            {passwordError && <div className="alert alert-danger py-2 small mb-3">{passwordError}</div>}
            {passwordSuccess && (
              <div className="profile-password-success-check mb-3" role="status" aria-live="polite">
                <label className="profile-password-success-label">
                  <input
                    type="checkbox"
                    className="profile-password-success-input"
                    checked
                    readOnly
                    tabIndex={-1}
                    aria-label={page.employerPasswordSuccessCheck}
                  />
                  <span className="profile-password-success-text">{page.employerPasswordSuccessCheck}</span>
                </label>
              </div>
            )}
            <div className="mb-3">
              <label className="profile-form-label" htmlFor="profile-current-password">
                {page.employerCurrentPassword}
              </label>
              <input
                id="profile-current-password"
                type="password"
                className="form-control profile-form-input"
                value={passwordForm.current}
                onChange={handlePasswordChange('current')}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="mb-3">
              <label className="profile-form-label" htmlFor="profile-new-password">
                {page.employerNewPassword}
              </label>
              <input
                id="profile-new-password"
                type="password"
                className="form-control profile-form-input"
                value={passwordForm.next}
                onChange={handlePasswordChange('next')}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <div className="mb-4">
              <label className="profile-form-label" htmlFor="profile-confirm-password">
                {page.employerConfirmPassword}
              </label>
              <input
                id="profile-confirm-password"
                type="password"
                className="form-control profile-form-input"
                value={passwordForm.confirm}
                onChange={handlePasswordChange('confirm')}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <button type="submit" className="profile-submit-btn" disabled={passwordLoading}>
              {passwordLoading ? '...' : 'Submit'}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

export default ProfileWorkspace;
