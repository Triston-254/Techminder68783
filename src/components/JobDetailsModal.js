import { useEffect, useMemo, useState } from 'react';
import ConfirmDialog from './ConfirmDialog';
import UserAvatar from './UserAvatar';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import {
  JOB_TYPES,
  MIN_APPLY_WORDS,
  applicationStatusLabel,
  applyToJob,
  countApplyWords,
  formatJobPostedAt,
  getJobById,
  reactToJob,
  toggleSaveJob,
  withdrawApplication,
} from '../utils/jobs';

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

function BookmarkIcon({ filled }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function ApplySuccessBox({ page, onDone }) {
  return (
    <div className="seeker-apply-success-box" role="status">
      <div className="seeker-apply-success-check-lg" aria-hidden="true">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path className="seeker-apply-success-check-path" d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h3 className="seeker-apply-success-box-title">{page.seekerApplySuccessTitle}</h3>
      <div className="seeker-apply-success-line-track" aria-hidden="true">
        <span className="seeker-apply-success-line" />
      </div>
      <p className="seeker-apply-success-box-message">{page.seekerApplySuccessMessage}</p>
      <button type="button" className="btn btn-warning fw-semibold rounded-pill px-4 py-2" onClick={onDone}>
        {page.seekerApplySuccessDone}
      </button>
    </div>
  );
}

function JobDetailsModal({
  jobId,
  open,
  onClose,
  onJobUpdate,
  onApplicationSubmitted,
  onApplicationSuccessDone,
  categoryLabel,
  session,
  autoOpenApply = false,
  onRequireLogin,
}) {
  const { lang, page } = useLanguage();
  const { showToast } = useToast();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [reacting, setReacting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applyMessage, setApplyMessage] = useState('');
  const [applying, setApplying] = useState(false);
  const [showApplyWarning, setShowApplyWarning] = useState(false);
  const [showSuccessView, setShowSuccessView] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const wordCount = useMemo(() => countApplyWords(applyMessage), [applyMessage]);
  const messageTooShort = wordCount < MIN_APPLY_WORDS;

  useEffect(() => {
    if (!open || !jobId) return undefined;

    let active = true;

    const loadJob = async () => {
      setLoading(true);
      setNotFound(false);
      setShowApplyForm(false);
      setApplyMessage('');
      setShowApplyWarning(false);
      setShowSuccessView(false);
      setShowWithdrawDialog(false);
      try {
        const nextJob = await getJobById(jobId);
        if (active) setJob(nextJob);
      } catch {
        if (active) {
          setJob(null);
          setNotFound(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadJob();
    return () => {
      active = false;
    };
  }, [open, jobId]);

  useEffect(() => {
    if (!open || !autoOpenApply || !job || job.hasApplied) return;
    setShowApplyForm(true);
  }, [open, autoOpenApply, job]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const jobTypeLabel = (value) => {
    const type = JOB_TYPES.find((t) => t.key === value || t.en === value || t.sw === value);
    return type ? (lang === 'en' ? type.en : type.sw) : value;
  };

  const syncJob = (updates) => {
    setJob((prev) => {
      const next = { ...prev, ...updates };
      onJobUpdate?.(next);
      return next;
    });
  };

  const handleReact = async (reaction) => {
    if (!job || reacting) return;
    setReacting(true);
    try {
      const result = await reactToJob(job.id, reaction);
      syncJob({
        likeCount: result.likeCount,
        dislikeCount: result.dislikeCount,
        userReaction: result.userReaction,
      });
    } catch (err) {
      showToast(err.message || 'Failed to react to job');
    } finally {
      setReacting(false);
    }
  };

  const handleToggleSave = async () => {
    if (!job || saving) return;
    setSaving(true);
    try {
      const result = await toggleSaveJob(job.id);
      syncJob({ isSaved: result.isSaved });
      showToast(result.isSaved ? page.seekerJobSaved : page.seekerJobUnsaved);
    } catch (err) {
      showToast(err.message || 'Failed to save job');
    } finally {
      setSaving(false);
    }
  };

  const handleApplyMessageChange = (event) => {
    const nextMessage = event.target.value;
    setApplyMessage(nextMessage);
    const nextWordCount = countApplyWords(nextMessage);
    if (nextWordCount >= MIN_APPLY_WORDS) {
      setShowApplyWarning(false);
    } else if (nextMessage.trim()) {
      setShowApplyWarning(true);
    }
  };

  const handleApply = async (event) => {
    event.preventDefault();
    if (!job || applying) return;

    const message = applyMessage.trim();
    if (countApplyWords(message) < MIN_APPLY_WORDS) {
      setShowApplyWarning(true);
      return;
    }

    setApplying(true);
    try {
      const result = await applyToJob(job.id, message);
      syncJob({
        hasApplied: true,
        applicationStatus: result.applicationStatus || result.status || 'pending',
      });
      setShowApplyForm(false);
      setApplyMessage('');
      setShowApplyWarning(false);
      setShowSuccessView(true);
      onApplicationSubmitted?.();
    } catch (err) {
      showToast(err.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleWithdraw = async () => {
    if (!job || withdrawing) return;

    setWithdrawing(true);
    try {
      await withdrawApplication(job.id);
      syncJob({
        hasApplied: false,
        applicationStatus: null,
      });
      setShowWithdrawDialog(false);
      setShowSuccessView(false);
      onApplicationSubmitted?.();
    } catch (err) {
      showToast(err.message || 'Failed to withdraw application');
    } finally {
      setWithdrawing(false);
    }
  };

  const handleSuccessDone = () => {
    setShowSuccessView(false);
    onApplicationSuccessDone?.();
  };

  if (!open) return null;

  return (
    <>
      <div className="employer-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="employer-modal seeker-job-details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="seeker-job-details-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="employer-modal-header">
          <h2 id="seeker-job-details-title" className="employer-modal-title">
            {showSuccessView ? page.seekerApplySuccessTitle : page.seekerJobDetails}
          </h2>
          <button type="button" className="employer-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {loading ? (
          <p className="text-muted text-center py-4 mb-0">...</p>
        ) : notFound || !job ? (
          <div className="text-center py-4">
            <p className="text-muted mb-0">{page.seekerJobNotFound}</p>
          </div>
        ) : showSuccessView ? (
          <ApplySuccessBox page={page} onDone={handleSuccessDone} />
        ) : (
          <>
            <div className="seeker-job-details-heading">
              <h3 className="seeker-job-details-modal-title">
                {job.title}
                <span className="seeker-job-category-inline"> ({categoryLabel(job.category)})</span>
              </h3>
              <span className="badge bg-warning text-dark rounded-pill">{job.pay}</span>
            </div>

            <div className="d-flex flex-wrap gap-2 seeker-job-tags mt-2">
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

            <p className="seeker-job-location mt-2 mb-2">
              <span className="employer-location-icon" aria-hidden="true" />
              {job.location}
            </p>

            <div className="seeker-job-meta seeker-job-details-meta">
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

            {job.description && (
              <section className="seeker-job-details-section">
                <h3 className="seeker-job-details-label">{page.seekerJobDescription}</h3>
                <p className="seeker-job-details-desc text-muted mb-0">{job.description}</p>
              </section>
            )}

            {!job.hasApplied && !showApplyForm && (
              <div className="seeker-apply-cta mb-3">
                <button
                  type="button"
                  className="btn btn-warning fw-semibold rounded-pill w-100 py-2"
                  onClick={() => {
                    if (!session) {
                      onRequireLogin?.(job.id);
                      return;
                    }
                    setShowApplyForm(true);
                  }}
                >
                  {page.seekerApplyNow}
                </button>
              </div>
            )}

            {!job.hasApplied && showApplyForm && (
              <form className="seeker-apply-form mb-3" onSubmit={handleApply} noValidate>
                <h3 className="seeker-job-details-label">{page.seekerApplyTitle}</h3>
                <p className="text-muted small mb-3">{page.seekerApplyDesc}</p>

                {session && (
                  <div className="seeker-apply-profile-card mb-3">
                    <span className="small text-muted d-block mb-2">{page.seekerYourProfile}</span>
                    <div className="seeker-apply-profile-row">
                      <UserAvatar
                        name={session.name}
                        image={session.profilePicture}
                        size="md"
                      />
                      <div>
                        <p className="seeker-apply-profile-name mb-0">{session.name}</p>
                        <p className="text-muted small mb-0">{session.email}</p>
                        {session.phone && (
                          <p className="text-muted small mb-0">{session.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <label className="form-label employer-label" htmlFor="apply-message">
                  {page.seekerApplyMessage} *
                </label>
                <textarea
                  id="apply-message"
                  className={`form-control employer-input seeker-apply-textarea${showApplyWarning && messageTooShort ? ' seeker-apply-textarea-warning' : ''}`}
                  rows="4"
                  value={applyMessage}
                  onChange={handleApplyMessageChange}
                  placeholder={page.seekerApplyMessagePlaceholder}
                  maxLength={1000}
                  aria-invalid={showApplyWarning && messageTooShort}
                  aria-describedby="apply-message-hint apply-message-warning"
                />
                <div id="apply-message-hint" className="form-text mb-2">
                  {page.seekerApplyMessageHint}
                  {' '}
                  <span className={`seeker-apply-word-count${messageTooShort ? ' seeker-apply-word-count-short' : ' seeker-apply-word-count-ok'}`}>
                    {page.seekerApplyWordCount.replace('{count}', String(wordCount))}
                  </span>
                </div>

                {showApplyWarning && messageTooShort && (
                  <div id="apply-message-warning" className="seeker-apply-warning mb-3" role="alert">
                    <span className="seeker-apply-warning-icon" aria-hidden="true">!</span>
                    <span>{page.seekerApplyMessageTooShort}</span>
                  </div>
                )}

                <div className="d-flex flex-wrap gap-2">
                  <button
                    type="submit"
                    className="btn btn-warning fw-semibold rounded-pill px-4"
                    disabled={applying || messageTooShort}
                  >
                    {applying ? page.seekerApplying : page.seekerApplySubmit}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary rounded-pill px-4"
                    onClick={() => {
                      setShowApplyForm(false);
                      setApplyMessage('');
                      setShowApplyWarning(false);
                    }}
                    disabled={applying}
                  >
                    {page.employerModalCancel}
                  </button>
                </div>
              </form>
            )}

            {job.hasApplied && (
              <div className="seeker-withdraw-section mb-3">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger rounded-pill px-3"
                  onClick={() => setShowWithdrawDialog(true)}
                >
                  {page.seekerWithdrawApplication}
                </button>
              </div>
            )}

            <div className="seeker-job-details-actions">
              <button
                type="button"
                className={`btn rounded-pill px-4 fw-semibold seeker-save-job-btn${job.isSaved ? ' seeker-save-job-btn-active' : ''}`}
                onClick={handleToggleSave}
                disabled={saving}
              >
                <BookmarkIcon filled={job.isSaved} />
                <span>{job.isSaved ? page.seekerSavedForLater : page.seekerSaveForLater}</span>
              </button>

              <div className="seeker-job-reactions">
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
            </div>
          </>
        )}
      </div>
      </div>

      <ConfirmDialog
        open={showWithdrawDialog}
        title={page.seekerWithdrawTitle}
        message={page.seekerWithdrawConfirm}
        confirmLabel={withdrawing ? page.seekerWithdrawing : page.seekerWithdrawConfirmBtn}
        cancelLabel={page.seekerWithdrawCancel}
        onConfirm={handleWithdraw}
        onCancel={() => setShowWithdrawDialog(false)}
        loading={withdrawing}
        variant="danger"
      />
    </>
  );
}

export default JobDetailsModal;
