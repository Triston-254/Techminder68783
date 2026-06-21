import { useEffect, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

export const OPEN_COOKIES_EVENT = 'sjk:open-cookies';
const CONSENT_KEY = 'sjk_cookie_consent';
const BANNER_DELAY_MS = 3000;

function CookieConsentBanner() {
  const { page } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let timer;
    try {
      const accepted = localStorage.getItem(CONSENT_KEY);
      if (!accepted) {
        timer = window.setTimeout(() => setVisible(true), BANNER_DELAY_MS);
      }
    } catch {
      timer = window.setTimeout(() => setVisible(true), BANNER_DELAY_MS);
    }
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    const openBanner = () => setVisible(true);
    window.addEventListener(OPEN_COOKIES_EVENT, openBanner);
    return () => window.removeEventListener(OPEN_COOKIES_EVENT, openBanner);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(CONSENT_KEY, 'accepted');
    } catch {
      // ignore storage errors
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-sheet-wrap" role="presentation">
      <div
        className="cookie-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-sheet-title"
      >
        <div className="cookie-sheet-content">
          <h2 id="cookie-sheet-title" className="cookie-sheet-title">{page.footerCookies}</h2>
          <p className="cookie-sheet-text">{page.cookieBannerText}</p>
          <ul className="cookie-sheet-list">
            {page.cookieSections.map((item) => (
              <li key={item.heading}>
                <strong>{item.heading}</strong>
                {' — '}
                {item.body}
              </li>
            ))}
          </ul>
        </div>
        <div className="cookie-sheet-actions">
          <button type="button" className="btn btn-outline-secondary legal-dialog-btn" onClick={dismiss}>
            {page.legalClose}
          </button>
          <button type="button" className="btn btn-warning fw-semibold legal-dialog-btn" onClick={dismiss}>
            {page.cookieBannerAccept}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CookieConsentBanner;
