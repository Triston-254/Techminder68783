import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { formatStatCount, getPlatformStats } from '../utils/jobs';
import '../Auth.css';

function AuthLayout({ children, title, subtitle, backLink }) {
  const { page } = useLanguage();
  const [stats, setStats] = useState({ jobs: 0, counties: 47 });

  useEffect(() => {
    let active = true;

    getPlatformStats()
      .then((data) => {
        if (active) setStats(data);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-bg-pattern" />
      <div className="container auth-container">
        <div className="row justify-content-center align-items-center min-vh-100 py-5">
          <div className="col-lg-10">
            <div className="row g-0 auth-card shadow-lg rounded-4 overflow-hidden">
              <div className="col-lg-5 auth-panel-left d-none d-lg-flex flex-column justify-content-between p-5">
                <div>
                  <Link to="/" className="auth-brand text-white text-decoration-none">
                    <span className="brand-icon me-2">SJ</span>
                    <span className="fw-bold">{page.brand}</span>
                  </Link>
                  <h2 className="auth-panel-title mt-5">{page.heroTitle}</h2>
                  <p className="auth-panel-desc mt-3">{page.heroSubtitle}</p>
                </div>
                <div className="auth-panel-stats d-flex gap-4">
                  <div>
                    <div className="auth-stat-value">
                      {formatStatCount(stats.jobs, { compact: true })}
                    </div>
                    <div className="auth-stat-label">{page.statJobs}</div>
                  </div>
                  <div>
                    <div className="auth-stat-value">
                      {formatStatCount(stats.counties, { plus: false })}
                    </div>
                    <div className="auth-stat-label">{page.statCounties}</div>
                  </div>
                </div>
              </div>

              <div className="col-lg-7 auth-panel-right p-4 p-md-5">
                {backLink && <div className="auth-back-wrap">{backLink}</div>}
                <div className="d-lg-none mb-4">
                  <Link to="/" className="auth-brand-mobile text-decoration-none">
                    <span className="brand-icon me-2">SJ</span>
                    <span className="fw-bold">{page.brand}</span>
                  </Link>
                </div>
                <div className="auth-form-header mb-4">
                  <h1 className="auth-form-title">{title}</h1>
                  <p className="auth-form-subtitle text-muted mb-0">{subtitle}</p>
                </div>
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
