import { Link } from 'react-router-dom';

function LandingBanner({
  variant = 'signup',
  eyebrow,
  title,
  message,
  ctaLabel,
  ctaTo,
  onCtaClick,
  secondaryCtaLabel,
  secondaryCtaTo,
  chips = [],
}) {
  const primaryButton = ctaLabel && (
    onCtaClick ? (
      <button type="button" className="landing-banner-btn landing-banner-btn-primary" onClick={onCtaClick}>
        {ctaLabel}
      </button>
    ) : (
      <Link to={ctaTo || '/choose-role'} className="landing-banner-btn landing-banner-btn-primary">
        {ctaLabel}
      </Link>
    )
  );

  const secondaryButton = secondaryCtaLabel && (
    <Link to={secondaryCtaTo || '/login'} className="landing-banner-btn landing-banner-btn-secondary">
      {secondaryCtaLabel}
    </Link>
  );

  if (variant === 'trust') {
    return (
      <section className="landing-banner landing-banner-trust" aria-label={title}>
        <div className="container">
          <div className="landing-banner-trust-inner">
            {title && <p className="landing-banner-trust-title mb-0">{title}</p>}
            <div className="landing-banner-trust-chips">
              {chips.map((chip) => (
                <span key={chip} className="landing-banner-trust-chip">{chip}</span>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`landing-banner landing-banner-${variant}`} aria-label={title}>
      <div className="container">
        <div className="landing-banner-card">
          <div className="landing-banner-copy">
            {eyebrow && <p className="landing-banner-eyebrow">{eyebrow}</p>}
            {title && <h2 className="landing-banner-title">{title}</h2>}
            {message && <p className="landing-banner-message mb-0">{message}</p>}
          </div>
          {(primaryButton || secondaryButton) && (
            <div className="landing-banner-actions">
              {primaryButton}
              {secondaryButton}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default LandingBanner;
