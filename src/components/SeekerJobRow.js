import { useState } from 'react';
import { applicationStatusLabel, formatJobPostedAt } from '../utils/jobs';
import UserAvatar from './UserAvatar';

function LikeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M7 10v12" />
      <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" />
    </svg>
  );
}

function DislikeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 14V2" />
      <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" />
    </svg>
  );
}

function SeekerJobRow({
  job,
  lang,
  page,
  jobTypeLabel,
  categoryLabel,
  onReact,
  onOpenDetails,
  onRemoveSaved,
  isLast,
}) {
  const [reacting, setReacting] = useState(false);
  const [removing, setRemoving] = useState(false);

  const handleReact = async (reaction) => {
    if (reacting) return;
    setReacting(true);
    try {
      await onReact(job.id, reaction);
    } finally {
      setReacting(false);
    }
  };

  const handleRemoveSaved = async () => {
    if (!onRemoveSaved || removing) return;
    setRemoving(true);
    try {
      await onRemoveSaved(job.id);
    } finally {
      setRemoving(false);
    }
  };

  const openDetails = () => onOpenDetails(job.id);

  return (
    <article className={`seeker-job-row${isLast ? ' seeker-job-row-last' : ''}`}>
      <div className="seeker-job-row-heading">
        <button
          type="button"
          className="seeker-job-open-link"
          onClick={openDetails}
        >
          <h3 className="seeker-job-title">
            <span className="seeker-job-title-text">{job.title}</span>
            <span className="seeker-job-category-inline"> ({categoryLabel(job.category)})</span>
          </h3>
          {job.description && (
            <p className="seeker-job-desc text-muted mb-0">{job.description}</p>
          )}
        </button>
        <span className="badge bg-warning text-dark rounded-pill">{job.pay}</span>
      </div>

      <div className="d-flex flex-wrap gap-2 seeker-job-tags">
        <span className="badge seeker-job-badge">{jobTypeLabel(job.jobType)}</span>
        <span className="badge seeker-job-badge">
          {job.employeesRequired ?? 1} · {page.seekerEmployeesRequired}
        </span>
        {job.hasApplied && (
          <span className={`badge application-status-badge application-status-${job.applicationStatus || 'pending'}`}>
            {page.seekerApplied} · {applicationStatusLabel(job.applicationStatus || 'pending', page)}
          </span>
        )}
      </div>

      <p className="seeker-job-location">
        <span className="employer-location-icon" aria-hidden="true" />
        {job.location}
      </p>

      <div className="seeker-job-meta">
        <div className="seeker-job-posted-by">
          <span className="small text-muted">{page.seekerPostedBy}</span>
          <UserAvatar
            name={job.employerName}
            image={job.employerProfilePicture}
            size="sm"
          />
          <span className="small text-muted seeker-job-employer-name">{job.employerName}</span>
        </div>
        {job.createdAt && (
          <p className="small text-muted mb-0">
            {page.seekerPostedOn} {formatJobPostedAt(job.createdAt, lang)}
          </p>
        )}
      </div>

      <div className="seeker-job-reactions">
        {onRemoveSaved && (
          <button
            type="button"
            className="btn btn-sm btn-outline-danger rounded-pill px-3 seeker-remove-saved-btn"
            onClick={handleRemoveSaved}
            disabled={removing}
          >
            {page.seekerRemoveFromSaved}
          </button>
        )}
        <button
          type="button"
          className={`seeker-reaction-btn${job.userReaction === 'like' ? ' seeker-reaction-btn-active' : ''}`}
          onClick={() => handleReact('like')}
          disabled={reacting}
          aria-label={page.seekerLikeJob}
        >
          <LikeIcon />
          <span>{job.likeCount ?? 0}</span>
        </button>
        <button
          type="button"
          className={`seeker-reaction-btn seeker-reaction-btn-dislike${job.userReaction === 'dislike' ? ' seeker-reaction-btn-active' : ''}`}
          onClick={() => handleReact('dislike')}
          disabled={reacting}
          aria-label={page.seekerDislikeJob}
        >
          <DislikeIcon />
          <span>{job.dislikeCount ?? 0}</span>
        </button>
      </div>
    </article>
  );
}

export default SeekerJobRow;
