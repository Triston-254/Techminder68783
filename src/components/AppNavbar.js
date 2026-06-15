import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import AppLogo from './AppLogo';
import GlobeIcon from './GlobeIcon';

function AppNavbar() {
  const { lang, setLang, page } = useLanguage();
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const langMenuRef = useRef(null);
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target)) {
        setLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectLanguage = (code) => {
    setLang(code);
    setLangMenuOpen(false);
  };

  const navHref = (hash) => (isHome ? hash : `/${hash}`);

  return (
    <nav className="navbar navbar-expand-lg fixed-top top-navbar shadow">
      <div className="container">
        <AppLogo className="navbar-brand text-white" size="md" />

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon navbar-toggler-icon-custom" />
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          <ul className="navbar-nav mx-auto gap-lg-2">
            <li className="nav-item">
              <a className="nav-link text-white" href={navHref('#jobs')}>{page.navJobs}</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white" href={navHref('#how-it-works')}>{page.navHow}</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white" href={navHref('#employers')}>{page.navEmployers}</a>
            </li>
            <li className="nav-item">
              <a className="nav-link text-white" href={navHref('#help')}>{page.navHelp}</a>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2 gap-lg-3 flex-wrap justify-content-lg-end mt-3 mt-lg-0">
            <div className="lang-switcher" ref={langMenuRef}>
              <button
                type="button"
                className="lang-globe-btn"
                onClick={() => setLangMenuOpen((open) => !open)}
                aria-label={page.langTooltip}
                aria-expanded={langMenuOpen}
                aria-haspopup="true"
              >
                <GlobeIcon />
                <span className="lang-tooltip">{page.langTooltip}</span>
              </button>
              {langMenuOpen && (
                <ul className="lang-dropdown" role="menu">
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      className={`lang-option${lang === 'en' ? ' active' : ''}`}
                      onClick={() => selectLanguage('en')}
                    >
                      <span className="lang-flag">🇬🇧</span> {page.langEnglish}
                      {lang === 'en' && <span className="lang-check">✓</span>}
                    </button>
                  </li>
                  <li role="none">
                    <button
                      type="button"
                      role="menuitem"
                      className={`lang-option${lang === 'sw' ? ' active' : ''}`}
                      onClick={() => selectLanguage('sw')}
                    >
                      <span className="lang-flag">🇰🇪</span> {page.langSwahili}
                      {lang === 'sw' && <span className="lang-check">✓</span>}
                    </button>
                  </li>
                </ul>
              )}
            </div>

            <Link to="/login" className="btn btn-nav-login btn-sm fw-semibold px-3">
              {page.navLogin}
            </Link>
            <Link to="/choose-role" className="btn btn-light btn-sm fw-semibold px-3 nav-cta-btn">
              {page.navSignup}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default AppNavbar;
