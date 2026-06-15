import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const MARK_SIZES = {
  sm: 30,
  md: 38,
  lg: 44,
};

function AppLogo({
  to = '/',
  showText = true,
  size = 'md',
  className = '',
  asLink = true,
}) {
  const { page } = useLanguage();
  const markSize = MARK_SIZES[size] || MARK_SIZES.md;

  const content = (
    <>
      <img
        src={`${process.env.PUBLIC_URL}/favicon.png`}
        alt=""
        className={`app-logo-mark app-logo-mark-${size}`}
        width={markSize}
        height={markSize}
        decoding="async"
      />
      {showText && (
        <span className="app-logo-wordmark">
          <span className="app-logo-primary">SmartJob</span>
          <span className="app-logo-secondary">Kenya</span>
        </span>
      )}
      <span className="visually-hidden">{page.brand}</span>
    </>
  );

  if (asLink) {
    return (
      <Link to={to} className={`app-logo ${className}`.trim()}>
        {content}
      </Link>
    );
  }

  return <span className={`app-logo ${className}`.trim()}>{content}</span>;
}

export default AppLogo;
