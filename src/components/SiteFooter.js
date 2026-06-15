import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

function SocialLinks() {
  return (
    <div className="social-links d-flex gap-2">
      <a href="https://www.facebook.com/SmartJobKenya" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook" data-label="Facebook">
        <span className="social-icon">f</span>
      </a>
      <a href="https://x.com/SmartJobKenya" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="X" data-label="X">
        <span className="social-icon">X</span>
      </a>
      <a href="https://www.instagram.com/SmartJobKenya" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram" data-label="Instagram">
        <span className="social-icon instagram-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="4" width="16" height="16" rx="5" ry="5" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
          </svg>
        </span>
      </a>
      <a href="https://www.linkedin.com/company/smartjobkenya" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn" data-label="LinkedIn">
        <span className="social-icon">in</span>
      </a>
    </div>
  );
}

function LanguageSwitcher() {
  const { lang, setLang, page } = useLanguage();

  return (
    <div className="footer-lang-switcher">
      <h6 className="footer-heading text-white fw-semibold mb-2">
        {page.langEnglish} / {page.langSwahili}
      </h6>
      <div className="d-flex flex-wrap gap-2">
        <button
          type="button"
          className={`btn btn-sm ${lang === 'en' ? 'btn-warning' : 'btn-outline-light'} rounded-pill`}
          onClick={() => setLang('en')}
        >
          {page.langEnglish}
        </button>
        <button
          type="button"
          className={`btn btn-sm ${lang === 'sw' ? 'btn-warning' : 'btn-outline-light'} rounded-pill`}
          onClick={() => setLang('sw')}
        >
          {page.langSwahili}
        </button>
      </div>
    </div>
  );
}

function SiteFooter({ compact = false }) {
  const { page } = useLanguage();
  const currentYear = new Date().getFullYear();

  if (compact) {
    return (
      <footer className="site-footer site-footer-compact mt-auto">
        <div className="footer-top py-4">
          <div className="container">
            <div className="row g-4 align-items-center">
              <div className="col-lg-7">
                <Link to="/" className="text-decoration-none">
                  <h5 className="fw-bold text-white mb-2">
                    <span className="brand-icon me-2">SJ</span>
                    {page.brand}
                  </h5>
                </Link>
                <p className="footer-tagline mb-3">{page.footerTagline}</p>
                <SocialLinks />
              </div>
              <div className="col-lg-5 text-lg-end">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
        <div className="footer-bottom py-3">
          <div className="container">
            <div className="row align-items-center gy-2">
              <div className="col-12 text-center text-md-start">
                <p className="mb-0 small footer-copyright">
                  © {currentYear} {page.brand}. {page.footerRights}
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  return null;
}

export default SiteFooter;
export { SocialLinks, LanguageSwitcher };
