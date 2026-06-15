import EmployerHeader from '../components/EmployerHeader';
import ProfileWorkspace from '../components/ProfileWorkspace';
import SiteFooter from '../components/SiteFooter';
import { useLanguage } from '../context/LanguageContext';
import { useEmployerSession } from '../hooks/useEmployerSession';
import '../App.css';

function EmployerProfilePage() {
  const { page } = useLanguage();
  const { session, user, refresh, logout, ready } = useEmployerSession();

  if (!ready) return null;

  return (
    <div className="employer-dashboard">
      <EmployerHeader session={session} user={user} onLogout={logout} />

      <main className="container employer-dashboard-main py-4 py-lg-5 flex-grow-1">
        <div className="employer-page-heading mb-4">
          <p className="employer-dash-eyebrow text-muted mb-1">{page.employerProfile}</p>
          <h1 className="employer-page-title mb-2">{page.employerProfileTitle}</h1>
          <p className="text-muted mb-0">{page.employerProfileSubtitle}</p>
        </div>

        <ProfileWorkspace session={session} user={user} refresh={refresh} />
      </main>

      <SiteFooter compact />
    </div>
  );
}

export default EmployerProfilePage;
