import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AppLogo from './AppLogo';
import EmployerNotificationPanel from './EmployerNotificationPanel';
import { useLanguage } from '../context/LanguageContext';
import { EMPLOYER_ROUTES } from '../utils/dashboardRoutes';
import { notificationsAPI } from '../utils/api';
import {
  addWelcomeNotification,
  archiveNotification,
  clearPendingWelcome,
  getNotifications,
  getPendingWelcome,
  getUnreadCount,
  markAllAsRead,
} from '../utils/notifications';

const WELCOME_DELAY_MS = 5000;
const NOTIFICATION_POLL_MS = 10000;

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

function getFirstName(name = '') {
  return name.split(' ').filter(Boolean)[0] || '';
}

function DashboardHeader({ session, user, onLogout, routes = EMPLOYER_ROUTES }) {
  const { page } = useLanguage();
  const { pathname } = useLocation();
  const showBack = pathname !== routes.dashboard;
  const [unread, setUnread] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const notifRef = useRef(null);
  const menuRef = useRef(null);

  const profilePicture = user?.profilePicture || session?.profilePicture;

  const loadNotifications = useCallback(async () => {
    if (!session?.email) return;

    const local = getNotifications(session.email);
    try {
      const result = await notificationsAPI.list();
      if (result.success) {
        const merged = [...result.notifications, ...local].sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
        );
        setNotifications(merged);
        setUnread(merged.filter((n) => !n.read).length);
        return;
      }
    } catch {
      /* fall back to local notifications */
    }

    setNotifications(local);
    setUnread(getUnreadCount(session.email));
  }, [session?.email]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    if (!session?.email) return undefined;

    const interval = setInterval(loadNotifications, NOTIFICATION_POLL_MS);
    const handleFocus = () => loadNotifications();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadNotifications();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [session?.email, loadNotifications]);

  useEffect(() => {
    if (!session?.email) return undefined;

    const pending = getPendingWelcome(session.email);
    if (!pending) return undefined;

    const timer = setTimeout(() => {
      clearPendingWelcome();
      const firstName = pending.name.split(' ')[0];
      const isEmployer = pending.role === 'employer';
      const title = isEmployer ? page.notifWelcomeEmployerTitle : page.notifWelcomeSeekerTitle;
      const message = (isEmployer ? page.notifWelcomeEmployerMessage : page.notifWelcomeSeekerMessage)
        .replace('{name}', firstName);
      addWelcomeNotification(session.email, { title, message });
      loadNotifications();
    }, WELCOME_DELAY_MS);

    return () => clearTimeout(timer);
  }, [session?.email, page, loadNotifications]);

  useEffect(() => {
    const handleClick = (e) => {
      const inNotif = notifRef.current?.contains(e.target);
      const inMenu = menuRef.current?.contains(e.target);
      if (!inNotif) setNotifOpen(false);
      if (!inMenu) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleNotif = () => {
    setNotifOpen((o) => !o);
    setMenuOpen(false);
    loadNotifications();
  };

  const toggleMenu = () => {
    setMenuOpen((o) => !o);
    setNotifOpen(false);
  };

  const handleArchive = async (id) => {
    const notif = notifications.find((n) => n.id === id);
    if (notif?.source === 'server' && notif.serverId) {
      await notificationsAPI.archive(notif.serverId);
    } else {
      archiveNotification(session.email, id);
    }
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    markAllAsRead(session.email);
    try {
      await notificationsAPI.markAllRead();
    } catch {
      /* local notifications still marked read above */
    }
    loadNotifications();
  };

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  const firstName = getFirstName(session?.name);

  return (
    <header className="employer-dashboard-header">
        <div className="container employer-header-inner">
          <div className="employer-header-left">
            {showBack && (
              <Link to={routes.dashboard} className="employer-header-back text-white text-decoration-none">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                {page.employerBackNav}
              </Link>
            )}
            <AppLogo
              to={routes.dashboard}
              className="employer-dash-brand text-white"
              size="sm"
            />
          </div>

          <div className="employer-header-actions d-flex align-items-center">
            <div className="employer-header-notif flex-shrink-0" ref={notifRef}>
              <button
                type="button"
                className="employer-header-icon-btn employer-header-icon-btn-bell"
                title={page.employerNotifications}
                aria-label={page.employerNotifications}
                aria-expanded={notifOpen}
                aria-haspopup="true"
                onClick={toggleNotif}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              </button>
              {unread > 0 && (
                <span className="employer-header-badge" aria-hidden="true">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}

              {notifOpen && (
                <EmployerNotificationPanel
                  notifications={notifications}
                  onArchive={handleArchive}
                  onMarkAllRead={handleMarkAllRead}
                />
              )}
            </div>

            <div className="employer-header-profile flex-shrink-0" ref={menuRef}>
              <button
                type="button"
                className="employer-header-profile-btn"
                title={page.employerProfile}
                aria-label={page.employerProfile}
                aria-expanded={menuOpen}
                aria-haspopup="true"
                onClick={toggleMenu}
              >
                <span className={`employer-header-icon-btn${profilePicture ? ' employer-header-icon-btn-photo' : ''}`}>
                  {profilePicture ? (
                    <img src={profilePicture} alt="" className="employer-header-avatar-img" />
                  ) : (
                    <span className="employer-header-avatar-initials">{getInitials(session?.name)}</span>
                  )}
                </span>
                {firstName && <span className="employer-header-greeting">Hi, {firstName}</span>}
              </button>

              {menuOpen && (
                <div className="employer-header-dropdown">
                  <Link
                    to={routes.profile}
                    className="employer-header-dropdown-item"
                    onClick={() => setMenuOpen(false)}
                  >
                    <svg className="employer-header-dropdown-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M20 21a8 8 0 0 0-16 0" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    {page.employerMyProfile}
                  </Link>
                  <button type="button" className="employer-header-dropdown-item text-danger" onClick={handleLogout}>
                    <svg className="employer-header-dropdown-icon" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <path d="M16 17l5-5-5-5" />
                      <path d="M21 12H9" />
                    </svg>
                    {page.employerLogout}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
    </header>
  );
}

export default DashboardHeader;
