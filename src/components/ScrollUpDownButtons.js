import { useEffect, useMemo, useState } from 'react';
import './ScrollUpDownButtons.css';

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function useScrollY() {
  const [y, setY] = useState(0);

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setY(window.scrollY || 0));
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return y;
}

export default function ScrollUpDownButtons({
  upLabel = '↑',
  downLabel = '↓',
  showAt = 600,
  stepPx = 700,
  className = '',
}) {
  const y = useScrollY();

  const progress = useMemo(() => {
    const doc = document.documentElement;
    const max = Math.max(1, doc.scrollHeight - doc.clientHeight);
    return clamp(y / max, 0, 1);
  }, [y]);

  const visible = y > showAt;

  const opacity = 1;
  const showDown = visible || y <= showAt;
  const showUp = true;

  const scrollUp = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollDown = () => {
    window.scrollTo({ top: y + stepPx, behavior: 'smooth' });
  };

  return (
    <div
      className={`scroll-up-down ${className}`}
      aria-hidden={opacity === 0}
      style={{ opacity }}
    >
      <button
        type="button"
        className={`scroll-up-down-btn scroll-up-down-up ${showUp ? '' : 'is-hidden'}`}
        onClick={scrollUp}
        aria-label="Scroll to top"
        title="Scroll to top"
      >
        {upLabel}
      </button>

      <button
        type="button"
        className={`scroll-up-down-btn scroll-up-down-down ${showDown ? '' : 'is-hidden'}`}
        onClick={scrollDown}
        aria-label="Scroll down"
        title="Scroll down"
      >
        {downLabel}
      </button>
    </div>
  );
}

