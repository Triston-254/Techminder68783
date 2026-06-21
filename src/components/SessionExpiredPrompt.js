import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

export const SESSION_EXPIRED_EVENT = 'sjk:session-expired';

function SessionExpiredPrompt() {
  const { page } = useLanguage();
  const location = useLocation();

  return (
    <div
      className="session-expired-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
    >
      <div className="session-expired-card">
        <div className="session-expired-icon" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 id="session-expired-title" className="session-expired-title">{page.sessionExpiredTitle}</h2>
        <p className="session-expired-message">{page.sessionExpiredMessage}</p>
        <Link
          to="/login"
          className="btn btn-warning fw-semibold rounded-pill px-4"
          state={{ returnTo: location.pathname, sessionExpired: true }}
        >
          {page.sessionExpiredLogin}
        </Link>
      </div>
    </div>
  );
}

export default SessionExpiredPrompt;
