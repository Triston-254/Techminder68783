import { useState } from 'react';
import { useToast } from '../context/ToastContext';
import { shareJob } from '../utils/shareJob';

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function ShareJobButton({ job, page, className = '', showLabel = false }) {
  const { showToast } = useToast();
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (sharing || !job?.id) return;
    setSharing(true);
    try {
      const result = await shareJob(job, page);
      if (result === 'copied') {
        showToast(page.shareJobCopied);
      } else if (result === 'shared') {
        showToast(page.shareJobShared);
      }
    } catch (err) {
      showToast(err.message || page.shareJobFailed);
    } finally {
      setSharing(false);
    }
  };

  return (
    <button
      type="button"
      className={`share-job-btn${showLabel ? ' share-job-btn-labeled' : ''}${className ? ` ${className}` : ''}`}
      onClick={handleShare}
      disabled={sharing}
      aria-label={page.shareJob}
      title={page.shareJob}
    >
      <ShareIcon />
      {showLabel && <span>{page.shareJob}</span>}
    </button>
  );
}

export default ShareJobButton;
