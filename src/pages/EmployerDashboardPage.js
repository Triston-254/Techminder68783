import { useEffect, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import EmployerHeader from '../components/EmployerHeader';
import RelativeTime from '../components/RelativeTime';
import ShareJobButton from '../components/ShareJobButton';
import SessionExpiredPrompt from '../components/SessionExpiredPrompt';
import SiteFooter from '../components/SiteFooter';
import JobApplicantsModal from '../components/JobApplicantsModal';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { categories } from '../data/landingData';
import { formatJobLocation, getAreasForCounty, parseJobLocation } from '../data/kenyaLocations';
import { useEmployerSession } from '../hooks/useEmployerSession';
import {
  COUNTIES,
  JOB_TYPES,
  closeJob,
  deleteJob,
  formatStatCount,
  getJobsByEmployer,
  postJob,
  updateJob,
} from '../utils/jobs';
import '../App.css';

const emptyForm = {
  title: '',
  category: '',
  county: '',
  area: '',
  jobType: '',
  pay: '',
  employeesRequired: '1',
  description: '',
};

function jobToForm(job, lang = 'en') {
  const category = categories.find(
    (c) => c.key === job.category || c.en === job.category || c.sw === job.category,
  );
  const jobType = JOB_TYPES.find(
    (t) => t.key === job.jobType || t.en === job.jobType || t.sw === job.jobType,
  );

  const { county, area } = parseJobLocation(job.location);

  return {
    title: job.title || '',
    category: category ? (lang === 'en' ? category.en : category.sw) : (job.category || ''),
    county,
    area,
    jobType: jobType ? (lang === 'en' ? jobType.en : jobType.sw) : (job.jobType || ''),
    pay: job.pay || '',
    employeesRequired: String(job.employeesRequired ?? 1),
    description: job.description || '',
  };
}

function EmployerDashboardPage() {
  const { lang, page } = useLanguage();
  const { showToast } = useToast();
  const { session, user, logout, ready, sessionExpired } = useEmployerSession();
  const [form, setForm] = useState(emptyForm);
  const [editingJob, setEditingJob] = useState(null);
  const [myJobs, setMyJobs] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [closingJobId, setClosingJobId] = useState(null);
  const [applicantsJob, setApplicantsJob] = useState(null);
  const [applicationCounts, setApplicationCounts] = useState({});
  const [deleteJobId, setDeleteJobId] = useState(null);
  const [deletingJob, setDeletingJob] = useState(false);

  const loadJobs = async () => {
    if (!session) return;
    setJobsLoading(true);
    try {
      const jobs = await getJobsByEmployer();
      setMyJobs(jobs);
      setApplicationCounts(
        jobs.reduce((acc, job) => {
          acc[job.id] = job.applicationCount ?? 0;
          return acc;
        }, {}),
      );
    } catch {
      setMyJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, [session]);


  const update = (field) => (e) => {
    const value = e.target.value;
    if (field === 'county') {
      setForm((prev) => ({ ...prev, county: value, area: '' }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingJob(null);
    setError('');
  };

  const startEdit = (job) => {
    setEditingJob(job);
    setForm(jobToForm(job, lang));
    setError('');
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    category: form.category.trim(),
    location: formatJobLocation(form.county, form.area),
    jobType: form.jobType.trim(),
    pay: form.pay.trim(),
    employeesRequired: Number(form.employeesRequired),
    description: form.description.trim(),
  });

  const validateForm = () => {
    if (
      !form.title.trim()
      || !form.category.trim()
      || !form.county.trim()
      || !form.area.trim()
      || !form.jobType.trim()
      || !form.pay.trim()
      || !form.employeesRequired.trim()
    ) {
      setError('Please fill in all required fields.');
      return false;
    }

    const employeesRequired = Number(form.employeesRequired);
    if (!Number.isInteger(employeesRequired) || employeesRequired < 1 || employeesRequired > 999) {
      setError('Employees required must be a number between 1 and 999.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const payload = buildPayload();
      if (editingJob) {
        await updateJob(editingJob.id, payload);
        showToast(page.employerUpdateSuccess);
      } else {
        await postJob(payload);
        showToast(page.employerPostSuccess);
      }
      resetForm();
      await loadJobs();
    } catch (err) {
      setError(err.message || 'Failed to save job.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteJobId || deletingJob) return;

    setDeletingJob(true);
    try {
      await deleteJob(deleteJobId);
      if (editingJob?.id === deleteJobId) resetForm();
      setDeleteJobId(null);
      await loadJobs();
    } catch (err) {
      setError(err.message || 'Failed to delete job.');
    } finally {
      setDeletingJob(false);
    }
  };

  const handleCloseJob = async (jobId) => {
    setClosingJobId(jobId);
    try {
      await closeJob(jobId);
      if (editingJob?.id === jobId) resetForm();
      await loadJobs();
      showToast(page.employerCloseSuccess);
    } catch (err) {
      setError(err.message || 'Failed to close job.');
    } finally {
      setClosingJobId(null);
    }
  };

  const categoryLabel = (value) => {
    const cat = categories.find((c) => c.key === value || c.en === value || c.sw === value);
    return cat ? (lang === 'en' ? cat.en : cat.sw) : value;
  };

  const jobTypeLabel = (value) => {
    const type = JOB_TYPES.find((t) => t.key === value || t.en === value || t.sw === value);
    return type ? (lang === 'en' ? type.en : type.sw) : value;
  };

  if (!ready) return null;

  return (
    <div className="employer-dashboard">
      <EmployerHeader session={session} user={user} onLogout={logout} />

      <main className="container employer-dashboard-main py-4 py-lg-5 flex-grow-1">
        <div className="employer-page-heading mb-4">
          <p className="employer-dash-eyebrow text-muted mb-1">{page.employerDashTitle}</p>
          <h1 className="employer-page-title mb-2">
            {page.employerDashWelcome}, {session.name.split(' ')[0]}
          </h1>
          <p className="text-muted mb-0">{page.employerDashSubtitle}</p>
        </div>

        <div className="row g-4">
          <div className="col-lg-5">
            <div className="employer-card h-100">
              <h2 className="employer-card-title">
                {editingJob ? page.employerEditJob : page.employerPostJob}
              </h2>
              <p className="text-muted small mb-4">
                {editingJob ? page.employerEditJobDesc : page.employerPostJobDesc}
              </p>

              {error && <div className="alert alert-danger py-2 small">{error}</div>}

              <form onSubmit={handleSubmit} noValidate autoComplete="off">
                <div className="mb-3">
                  <label className="form-label employer-label" htmlFor="job-title">{page.employerJobTitle} *</label>
                  <input
                    id="job-title"
                    name="sjk-job-title"
                    type="text"
                    className="form-control employer-input"
                    value={form.title}
                    onChange={update('title')}
                    placeholder="e.g. Shop Cashier"
                    autoComplete="off"
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label employer-label" htmlFor="job-category">{page.employerCategory} *</label>
                  <select
                    id="job-category"
                    name="sjk-job-category"
                    className="form-select employer-input"
                    value={form.category}
                    onChange={update('category')}
                    autoComplete="off"
                    required
                  >
                    <option value="" disabled>{page.employerSelectCategory}</option>
                    {categories.map((cat) => (
                      <option key={cat.key} value={lang === 'en' ? cat.en : cat.sw}>
                        {lang === 'en' ? cat.en : cat.sw}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <label className="form-label employer-label" htmlFor="job-county">{page.employerCounty} *</label>
                    <select
                      id="job-county"
                      name="sjk-job-county"
                      className="form-select employer-input"
                      value={form.county}
                      onChange={update('county')}
                      autoComplete="off"
                      required
                    >
                      <option value="" disabled>{page.employerSelectCounty}</option>
                      {COUNTIES.map((county) => (
                        <option key={county} value={county}>{county}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label employer-label" htmlFor="job-area">{page.employerArea} *</label>
                    <select
                      id="job-area"
                      name="sjk-job-area"
                      className="form-select employer-input"
                      value={form.area}
                      onChange={update('area')}
                      autoComplete="off"
                      required
                      disabled={!form.county}
                    >
                      <option value="" disabled>{page.employerSelectArea}</option>
                      {getAreasForCounty(form.county).map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <label className="form-label employer-label" htmlFor="job-type">{page.employerJobType} *</label>
                    <select
                      id="job-type"
                      name="sjk-job-type"
                      className="form-select employer-input"
                      value={form.jobType}
                      onChange={update('jobType')}
                      autoComplete="off"
                      required
                    >
                      <option value="" disabled>{page.employerSelectJobType}</option>
                      {JOB_TYPES.map((type) => (
                        <option key={type.key} value={lang === 'en' ? type.en : type.sw}>
                          {lang === 'en' ? type.en : type.sw}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="row g-2 mb-3">
                  <div className="col-md-6">
                    <label className="form-label employer-label" htmlFor="job-pay">{page.employerPay} *</label>
                    <input
                      id="job-pay"
                      name="sjk-job-pay"
                      type="text"
                      className="form-control employer-input"
                      value={form.pay}
                      onChange={update('pay')}
                      placeholder="Enter pay"
                      autoComplete="off"
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label employer-label" htmlFor="job-employees">
                      {page.employerEmployeesRequired} *
                    </label>
                    <input
                      id="job-employees"
                      name="sjk-job-employees"
                      type="number"
                      min="1"
                      max="999"
                      className="form-control employer-input"
                      value={form.employeesRequired}
                      onChange={update('employeesRequired')}
                      autoComplete="off"
                      required
                    />
                    <div className="form-text">{page.employerEmployeesRequiredHint}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label employer-label" htmlFor="job-desc">{page.employerDescription}</label>
                  <textarea
                    id="job-desc"
                    name="sjk-job-description"
                    className="form-control employer-input"
                    rows="4"
                    value={form.description}
                    onChange={update('description')}
                    placeholder="Describe duties, hours, and requirements..."
                    autoComplete="off"
                  />
                </div>

                <div className="d-grid gap-2">
                  <button
                    type="submit"
                    className="btn btn-warning fw-semibold rounded-pill py-2"
                    disabled={loading}
                  >
                    {loading ? '...' : (editingJob ? page.employerSaveChanges : page.employerPostButton)}
                  </button>
                  {editingJob && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary rounded-pill py-2"
                      onClick={resetForm}
                      disabled={loading}
                    >
                      {page.employerCancelEdit}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="employer-card h-100">
              <h2 className="employer-card-title">{page.employerMyJobs}</h2>
              <p className="text-muted small mb-4">
                {formatStatCount(myJobs.length)} {myJobs.length === 1 ? 'listing' : 'listings'}
              </p>

              {jobsLoading ? (
                <p className="text-muted text-center py-5">...</p>
              ) : myJobs.length === 0 ? (
                <div className="employer-empty-state text-center py-5">
                  <div className="employer-empty-icon mb-3">📋</div>
                  <p className="text-muted mb-0">{page.employerMyJobsEmpty}</p>
                </div>
              ) : (
                <div className="employer-jobs-list">
                  {myJobs.map((job) => {
                    const isClosed = job.status === 'closed';
                    return (
                      <article
                        key={job.id}
                        className={`employer-job-item${isClosed ? ' employer-job-item-closed' : ''}`}
                      >
                        <div className="employer-job-heading">
                          <h3 className="employer-job-title mb-0">
                            {job.title}
                            <span className="employer-job-category-inline"> ({categoryLabel(job.category)})</span>
                          </h3>
                          <span className="badge bg-warning text-dark rounded-pill">{job.pay}</span>
                        </div>
                        {job.description && (
                          <p className="employer-job-desc text-muted mb-2">{job.description}</p>
                        )}
                        <div className="d-flex flex-wrap gap-2 mb-2">
                          <span className="badge employer-job-badge">{jobTypeLabel(job.jobType)}</span>
                          <span className="badge employer-job-badge">
                            {job.employeesRequired ?? 1} · {page.employerEmployeesRequired}
                          </span>
                          <span className={`badge employer-job-badge${isClosed ? ' bg-secondary-subtle text-secondary' : ' bg-success-subtle text-success'}`}>
                            {isClosed ? page.employerJobClosed : page.employerJobActive}
                          </span>
                          {(applicationCounts[job.id] ?? job.applicationCount ?? 0) > 0 && (
                            <span className="badge employer-job-badge application-count-badge">
                              {applicationCounts[job.id] ?? job.applicationCount} {page.employerApplicationCount}
                            </span>
                          )}
                        </div>
                        <p className="employer-job-location mb-3">
                          <span className="employer-location-icon" aria-hidden="true" />
                          {job.location}
                        </p>
                        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                          <div className="d-flex flex-wrap align-items-center gap-2">
                            <span className="small text-muted">
                              {page.employerPostedOn}{' '}
                              <RelativeTime value={job.createdAt} lang={lang} />
                            </span>
                            <ShareJobButton job={job} page={page} showLabel />
                          </div>
                          <div className="d-flex flex-wrap gap-2">
                            <button
                              type="button"
                              className="btn btn-sm btn-warning rounded-pill px-3"
                              onClick={() => setApplicantsJob(job)}
                            >
                              {page.employerViewApplicants}
                              {(applicationCounts[job.id] ?? job.applicationCount ?? 0) > 0 && (
                                <span className="ms-1">
                                  ({applicationCounts[job.id] ?? job.applicationCount})
                                </span>
                              )}
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-warning rounded-pill px-3"
                              onClick={() => startEdit(job)}
                            >
                              {page.employerEditJob}
                            </button>
                            {!isClosed && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                                onClick={() => handleCloseJob(job.id)}
                                disabled={closingJobId === job.id}
                              >
                                {page.employerCloseJob}
                              </button>
                            )}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger rounded-pill px-3"
                              onClick={() => setDeleteJobId(job.id)}
                            >
                              {page.employerDeleteJob}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <JobApplicantsModal
        jobId={applicantsJob?.id ?? null}
        jobTitle={applicantsJob?.title}
        open={applicantsJob !== null}
        onClose={() => setApplicantsJob(null)}
        onCountChange={(count) => {
          if (!applicantsJob) return;
          setApplicationCounts((prev) => ({ ...prev, [applicantsJob.id]: count }));
        }}
      />

      <ConfirmDialog
        open={deleteJobId !== null}
        title={page.employerDeleteConfirmTitle}
        message={page.employerDeleteConfirmMessage}
        confirmLabel={page.employerDeleteConfirmBtn}
        cancelLabel={page.employerDeleteCancel}
        onConfirm={handleDelete}
        onCancel={() => setDeleteJobId(null)}
        loading={deletingJob}
        variant="danger"
      />

      <SiteFooter compact />
      {sessionExpired && <SessionExpiredPrompt />}
    </div>
  );
}

export default EmployerDashboardPage;
