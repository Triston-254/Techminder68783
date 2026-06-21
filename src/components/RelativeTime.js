import { useEffect, useState } from 'react';
import { formatJobPostedAt } from '../utils/jobs';

function RelativeTime({ value, lang = 'en', className }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((tick) => tick + 1), 30000);
    return () => window.clearInterval(id);
  }, [value]);

  const text = formatJobPostedAt(value, lang);
  if (!text) return null;

  return <span className={className}>{text}</span>;
}

export default RelativeTime;
