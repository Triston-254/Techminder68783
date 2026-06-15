import { useLanguage } from '../context/LanguageContext';

function notificationIcon(type) {
  if (type === 'welcome') return '👋';
  if (type === 'profile') return '👤';
  if (type === 'job') return '💼';
  if (type === 'like') return '👍';
  if (type === 'dislike') return '👎';
  return '🔔';
}

function EmployerNotificationPanel({ notifications, onArchive, onMarkAllRead }) {
  const { lang, page } = useLanguage();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="employer-notif-panel">
      <div className="employer-notif-panel-head">
        <h2 className="employer-notif-panel-title">{page.employerNotifications}</h2>
        {unread > 0 && (
          <button type="button" className="employer-notif-panel-action" onClick={onMarkAllRead}>
            {page.employerMarkAllRead}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="employer-notif-panel-empty">
          <span className="employer-notif-panel-empty-icon">🔔</span>
          <p>{page.employerNotificationsEmpty}</p>
        </div>
      ) : (
        <ul className="employer-notif-panel-list">
          {notifications.map((notif) => (
            <li
              key={notif.id}
              className={`employer-notif-panel-item${notif.read ? '' : ' employer-notif-panel-item-unread'}`}
            >
              <span className="employer-notif-panel-item-icon">{notificationIcon(notif.type)}</span>
              <div className="employer-notif-panel-item-body">
                <div className="employer-notif-panel-item-top">
                  <strong>{notif.title}</strong>
                  <time>
                    {new Date(notif.createdAt).toLocaleDateString(lang === 'sw' ? 'sw-KE' : 'en-KE', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </time>
                </div>
                <p>{notif.message}</p>
                <button
                  type="button"
                  className="employer-notif-panel-archive"
                  onClick={() => onArchive(notif.id)}
                >
                  {page.employerArchive}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default EmployerNotificationPanel;
