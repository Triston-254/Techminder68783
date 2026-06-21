import SessionExpiredPrompt from '../components/SessionExpiredPrompt';
import EmployerHeader from '../components/EmployerHeader';
import SiteFooter from '../components/SiteFooter';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useEmployerSession } from '../hooks/useEmployerSession';
import '../App.css';

function EmployerSettingsPage() {
  const { page } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { session, user, logout, ready, sessionExpired } = useEmployerSession();

  if (!ready) return null;

  return (
    <div className="employer-dashboard">
      <EmployerHeader session={session} user={user} onLogout={logout} />

      <main className="container employer-dashboard-main py-4 py-lg-5 flex-grow-1">
        <div className="employer-page-heading mb-4">
          <p className="employer-dash-eyebrow text-muted mb-1">{page.employerSettings}</p>
          <h1 className="employer-page-title mb-2">{page.employerSettingsTitle}</h1>
          <p className="text-muted mb-0">{page.employerSettingsSubtitle}</p>
        </div>

        <div className="row g-4">
          <div className="col-lg-6">
            <div className="employer-card">
              <h2 className="employer-card-title">{page.employerTheme}</h2>
              <p className="text-muted small mb-3">{page.employerThemeDesc}</p>
              <div className="employer-theme-options">
                <button
                  type="button"
                  className={`employer-theme-btn${theme === 'light' ? ' employer-theme-btn-active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  <span className="employer-theme-icon">☀️</span>
                  {page.employerThemeLight}
                </button>
                <button
                  type="button"
                  className={`employer-theme-btn${theme === 'dark' ? ' employer-theme-btn-active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  <span className="employer-theme-icon">🌙</span>
                  {page.employerThemeDark}
                </button>
              </div>
            </div>
          </div>
        </div>

      </main>

      <SiteFooter compact />
      {sessionExpired && <SessionExpiredPrompt />}
    </div>
  );
}

export default EmployerSettingsPage;
