import UserAvatar from './UserAvatar';
import { useLanguage } from '../context/LanguageContext';

function SeekerProfileModal({ applicant, open, onClose }) {
  const { page } = useLanguage();

  if (!open || !applicant) return null;

  return (
    <div className="employer-modal-backdrop seeker-profile-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="employer-modal seeker-profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="seeker-profile-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="employer-modal-header">
          <h2 id="seeker-profile-title" className="employer-modal-title">
            {page.employerSeekerProfile}
          </h2>
          <button type="button" className="employer-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="seeker-profile-modal-hero">
          <UserAvatar
            name={applicant.seekerName}
            image={applicant.seekerProfilePicture}
            size="lg"
          />
          <div>
            <h3 className="seeker-profile-modal-name">{applicant.seekerName}</h3>
            <p className="text-muted small mb-0">{page.employerSeekerProfileDesc}</p>
          </div>
        </div>

        <section className="seeker-profile-modal-section">
          <h4 className="seeker-profile-modal-label">{page.employerApplicantContact}</h4>
          <dl className="seeker-profile-modal-details">
            <div className="seeker-profile-detail-row">
              <dt>{page.employerSeekerEmail}</dt>
              <dd>
                {applicant.seekerEmail ? (
                  <a href={`mailto:${applicant.seekerEmail}`}>{applicant.seekerEmail}</a>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </dd>
            </div>
            <div className="seeker-profile-detail-row">
              <dt>{page.employerSeekerPhone}</dt>
              <dd>
                {applicant.seekerPhone ? (
                  <a href={`tel:${applicant.seekerPhone}`}>{applicant.seekerPhone}</a>
                ) : (
                  <span className="text-muted">—</span>
                )}
              </dd>
            </div>
          </dl>
        </section>

        {applicant.message && (
          <section className="seeker-profile-modal-section">
            <h4 className="seeker-profile-modal-label">{page.employerApplicantMessage}</h4>
            <p className="seeker-profile-modal-message">{applicant.message}</p>
          </section>
        )}

        <div className="d-grid">
          <button type="button" className="btn btn-outline-secondary rounded-pill py-2" onClick={onClose}>
            {page.employerCloseApplicants}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SeekerProfileModal;
