import { useEffect, useState } from 'react';
import UserAvatar from './UserAvatar';
import SeekerProfileModal from './SeekerProfileModal';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import {
  applicationStatusLabel,
  formatJobPostedAt,
  getJobApplicants,
  updateApplicationStatus,
} from '../utils/jobs';

function JobApplicantsModal({ jobId, jobTitle, open, onClose, onCountChange }) {
  const { lang, page } = useLanguage();
  const { showToast } = useToast();
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [resolvedTitle, setResolvedTitle] = useState(jobTitle || '');

  useEffect(() => {
    if (!open || !jobId) return undefined;

    let active = true;

    const loadApplicants = async () => {
      setLoading(true);
      try {
        const result = await getJobApplicants(jobId);
        if (!active) return;
        setApplicants(result.applicants);
        setResolvedTitle(result.jobTitle || jobTitle || '');
        onCountChange?.(result.applicants.length);
      } catch (err) {
        if (active) {
          setApplicants([]);
          showToast(err.message || 'Failed to load applicants');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadApplicants();
    return () => {
      active = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, jobId, jobTitle, showToast]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const handleStatusUpdate = async (applicationId, status) => {
    setUpdatingId(applicationId);
    try {
      await updateApplicationStatus(applicationId, status);
      setApplicants((prev) => prev.map((item) => (
        item.id === applicationId ? { ...item, status } : item
      )));
      showToast(page.employerUpdateStatus);
    } catch (err) {
      showToast(err.message || 'Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="employer-modal-backdrop" onClick={onClose} role="presentation">
        <div
          className="employer-modal job-applicants-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="job-applicants-title"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="employer-modal-header">
            <div>
              <h2 id="job-applicants-title" className="employer-modal-title mb-1">
                {page.employerApplicants}
              </h2>
              {resolvedTitle && (
                <p className="text-muted small mb-0">{resolvedTitle}</p>
              )}
            </div>
            <button type="button" className="employer-modal-close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>

          <p className="employer-modal-desc mb-3">{page.employerApplicantsDesc}</p>

          {loading ? (
            <p className="text-muted text-center py-4 mb-0">...</p>
          ) : applicants.length === 0 ? (
            <div className="employer-empty-state text-center py-4">
              <div className="employer-empty-icon mb-3">👤</div>
              <p className="text-muted mb-0">{page.employerNoApplicants}</p>
            </div>
          ) : (
            <div className="job-applicants-list">
              {applicants.map((applicant) => (
                <article key={applicant.id} className="job-applicant-card">
                  <div className="job-applicant-card-header">
                    <div className="job-applicant-identity">
                      <UserAvatar
                        name={applicant.seekerName}
                        image={applicant.seekerProfilePicture}
                        size="md"
                      />
                      <div>
                        <h3 className="job-applicant-name">{applicant.seekerName}</h3>
                        <p className="text-muted small mb-0">
                          {page.employerApplicantApplied}{' '}
                          {formatJobPostedAt(applicant.createdAt, lang)}
                        </p>
                      </div>
                    </div>
                    <span className={`badge application-status-badge application-status-${applicant.status}`}>
                      {applicationStatusLabel(applicant.status, page)}
                    </span>
                  </div>

                  <p className="job-applicant-message">{applicant.message}</p>

                  <div className="job-applicant-actions">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-warning rounded-pill px-3"
                      onClick={() => setSelectedApplicant(applicant)}
                    >
                      {page.employerApplicantProfile}
                    </button>
                    {applicant.status !== 'viewed' && (
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                        onClick={() => handleStatusUpdate(applicant.id, 'viewed')}
                        disabled={updatingId === applicant.id}
                      >
                        {page.employerMarkViewed}
                      </button>
                    )}
                    {applicant.status !== 'contacted' && (
                      <button
                        type="button"
                        className="btn btn-sm btn-warning rounded-pill px-3"
                        onClick={() => handleStatusUpdate(applicant.id, 'contacted')}
                        disabled={updatingId === applicant.id}
                      >
                        {page.employerMarkContacted}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      <SeekerProfileModal
        applicant={selectedApplicant}
        open={selectedApplicant !== null}
        onClose={() => setSelectedApplicant(null)}
      />
    </>
  );
}

export default JobApplicantsModal;
