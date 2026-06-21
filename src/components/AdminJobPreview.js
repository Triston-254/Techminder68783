import RelativeTime from './RelativeTime';
import UserAvatar from './UserAvatar';
import { JOB_TYPES } from '../utils/jobs';

function AdminJobPreview({ job, page, lang }) {
  if (!job) return null;

  const jobTypeLabel = (() => {
    const type = JOB_TYPES.find((t) => t.key === job.jobType || t.en === job.jobType || t.sw === job.jobType);
    return type ? (lang === 'en' ? type.en : type.sw) : job.jobType;
  })();

  return (
    <div className="admin-job-preview seeker-job-details-modal">
      <div className="seeker-job-details-heading">
        <h3 className="seeker-job-details-modal-title mb-2">
          {job.title}
          <span className="seeker-job-category-inline"> ({job.category})</span>
        </h3>
        <span className="badge bg-warning text-dark rounded-pill">{job.pay}</span>
      </div>

      <div className="d-flex flex-wrap gap-2 seeker-job-tags mt-2">
        <span className="badge seeker-job-badge">{jobTypeLabel}</span>
        <span className="badge seeker-job-badge">
          {job.employeesRequired ?? 1} · {page.seekerEmployeesRequired}
        </span>
        <span className={`badge ${job.status === 'active' ? 'text-bg-success' : 'text-bg-secondary'}`}>
          {job.status}
        </span>
      </div>

      <p className="seeker-job-location mt-2 mb-2">
        <span className="employer-location-icon" aria-hidden="true" />
        {job.location}
      </p>

      <div className="seeker-job-meta seeker-job-details-meta">
        <div className="seeker-job-posted-by">
          <span className="small text-muted">{page.seekerPostedBy}</span>
          <UserAvatar name={job.employerName} image={job.employerProfilePicture} size="sm" />
          <span className="small text-muted seeker-job-employer-name">{job.employerName}</span>
        </div>
        {job.createdAt && (
          <p className="small text-muted mb-0">
            {page.seekerPostedOn} <RelativeTime value={job.createdAt} lang={lang} />
          </p>
        )}
      </div>

      <div className="admin-job-reaction-row d-flex flex-wrap gap-3 mt-3 mb-3">
        <span className="small text-muted">👍 {job.likeCount ?? 0} likes</span>
        <span className="small text-muted">👎 {job.dislikeCount ?? 0} dislikes</span>
        <span className="small text-muted">📋 {job.applicationCount ?? 0} applications</span>
      </div>

      {job.description && (
        <section className="seeker-job-details-section">
          <h3 className="seeker-job-details-label">{page.seekerJobDescription}</h3>
          <p className="seeker-job-details-desc text-muted mb-0">{job.description}</p>
        </section>
      )}
    </div>
  );
}

export default AdminJobPreview;
