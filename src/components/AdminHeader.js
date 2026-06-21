import AppLogo from './AppLogo';

function AdminHeader({ session, onLogout }) {
  const firstName = session?.name?.split(' ').filter(Boolean)[0] || 'Admin';

  return (
    <header className="employer-dashboard-header">
      <div className="container employer-header-inner">
        <AppLogo to="/admin-dashboard" className="employer-dash-brand text-white" size="sm" />
        <div className="employer-header-actions d-flex align-items-center">
          <span className="employer-header-greeting text-white">Hi, {firstName}</span>
          <button type="button" className="btn btn-light btn-sm fw-semibold rounded-pill px-3" onClick={onLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}

export default AdminHeader;
