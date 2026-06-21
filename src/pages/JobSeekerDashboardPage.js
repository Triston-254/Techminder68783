import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import SeekerHeader from '../components/SeekerHeader';
import SiteFooter from '../components/SiteFooter';
import JobDetailsModal from '../components/JobDetailsModal';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import SessionExpiredPrompt from '../components/SessionExpiredPrompt';
import { useSeekerSession } from '../hooks/useSeekerSession';
import RelativeTime from '../components/RelativeTime';
import SeekerJobRow from '../components/SeekerJobRow';
import { categories } from '../data/landingData';
import { formatJobLocation, getAreasForCounty } from '../data/kenyaLocations';
import {
  COUNTIES,
  JOB_TYPES,
  applicationStatusLabel,
  filterJobs,
  formatStatCount,
  getAllJobs,
  getMyApplications,
  getSavedJobs,
  reactToJob,
  toggleSaveJob,
  withdrawApplication,
} from '../utils/jobs';
import '../App.css';

function JobSeekerDashboardPage() {
  const { lang, page } = useLanguage();
  const { showToast } = useToast();
  const { session, logout, ready, sessionExpired } = useSeekerSession();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('browse');
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedLoading, setSavedLoading] = useState(false);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCounty, setSearchCounty] = useState('');
  const [searchArea, setSearchArea] = useState('');
  const [activeSearch, setActiveSearch] = useState({ keyword: '', location: '' });
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [openApplyOnLoad, setOpenApplyOnLoad] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState(null);
  const [withdrawTarget, setWithdrawTarget] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadJobs = useCallback(async () => {
    setLoading(true);
    try {
      const nextJobs = await getAllJobs();
      setJobs(nextJobs);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    if (!ready || !location.state?.jobId) return;
    setSelectedJobId(location.state.jobId);
    setOpenApplyOnLoad(Boolean(location.state.openApply));
    setActiveTab('browse');
  }, [ready, location.state]);

  useEffect(() => {
    if (!ready || activeTab !== 'saved') return undefined;

    let active = true;

    const loadSavedJobs = async () => {
      setSavedLoading(true);
      try {
        const nextSavedJobs = await getSavedJobs();
        if (active) setSavedJobs(nextSavedJobs);
      } catch {
        if (active) setSavedJobs([]);
      } finally {
        if (active) setSavedLoading(false);
      }
    };

    loadSavedJobs();
    return () => {
      active = false;
    };
  }, [activeTab, ready]);

  const loadApplications = async () => {
    setApplicationsLoading(true);
    try {
      const nextApplications = await getMyApplications();
      setApplications(nextApplications);
    } catch {
      setApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  };

  useEffect(() => {
    if (!ready || activeTab !== 'applications') return undefined;
    loadApplications();
    return undefined;
  }, [activeTab, ready]);

  const filteredJobs = useMemo(
    () => filterJobs(jobs, activeSearch),
    [jobs, activeSearch],
  );

  const jobTypeLabel = (value) => {
    const type = JOB_TYPES.find((t) => t.key === value || t.en === value || t.sw === value);
    return type ? (lang === 'en' ? type.en : type.sw) : value;
  };

  const categoryLabel = (value) => {
    const cat = categories.find((c) => c.key === value || c.en === value || c.sw === value);
    return cat ? (lang === 'en' ? cat.en : cat.sw) : value;
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const locationFilter = searchArea
      ? formatJobLocation(searchCounty, searchArea)
      : searchCounty.trim();
    setActiveSearch({
      keyword: searchQuery.trim(),
      location: locationFilter,
    });
  };

  const handleRefresh = async () => {
    setSearchQuery('');
    setSearchCounty('');
    setSearchArea('');
    setActiveSearch({ keyword: '', location: '' });
    setRefreshing(true);
    try {
      await loadJobs();
      showToast(page.seekerJobsRefreshed);
    } finally {
      setRefreshing(false);
    }
  };

  const updateJobInLists = (updatedJob) => {
    setJobs((prev) => prev.map((job) => (
      job.id === updatedJob.id ? { ...job, ...updatedJob } : job
    )));

    setSavedJobs((prev) => {
      if (!updatedJob.isSaved) {
        return prev.filter((job) => job.id !== updatedJob.id);
      }
      const exists = prev.some((job) => job.id === updatedJob.id);
      if (exists) {
        return prev.map((job) => (job.id === updatedJob.id ? { ...job, ...updatedJob } : job));
      }
      return [{ ...updatedJob, isSaved: true }, ...prev];
    });
  };

  const handleReact = async (jobId, reaction) => {
    try {
      const result = await reactToJob(jobId, reaction);
      updateJobInLists({
        id: jobId,
        likeCount: result.likeCount,
        dislikeCount: result.dislikeCount,
        userReaction: result.userReaction,
      });
    } catch (err) {
      showToast(err.message || 'Failed to react to job');
    }
  };

  const handleRemoveSaved = async (jobId) => {
    try {
      const result = await toggleSaveJob(jobId);
      updateJobInLists({ id: jobId, isSaved: result.isSaved });
      showToast(page.seekerJobUnsaved);
    } catch (err) {
      showToast(err.message || 'Failed to remove saved job');
    }
  };

  const handleWithdrawApplication = async () => {
    if (!withdrawTarget || withdrawingId) return;

    setWithdrawingId(withdrawTarget.id);
    try {
      await withdrawApplication(withdrawTarget.jobId);
      setApplications((prev) => prev.filter((item) => item.id !== withdrawTarget.id));
      setJobs((prev) => prev.map((job) => (
        job.id === withdrawTarget.jobId
          ? { ...job, hasApplied: false, applicationStatus: null }
          : job
      )));
      setWithdrawTarget(null);
    } catch (err) {
      showToast(err.message || 'Failed to withdraw application');
    } finally {
      setWithdrawingId(null);
    }
  };

  const handleApplicationSuccessDone = () => {
    setSelectedJobId(null);
    setActiveTab('applications');
    loadApplications();
  };

  const tabMeta = {
    browse: {
      title: page.seekerTabBrowseJobs,
      desc: page.seekerBrowseDesc,
      count: filteredJobs.length,
    },
    saved: {
      title: page.seekerTabSavedJobs,
      desc: page.seekerSavedJobsDesc,
      count: savedJobs.length,
    },
    applications: {
      title: page.seekerTabApplications,
      desc: page.seekerApplicationsDesc,
      count: applications.length,
    },
  };

  const currentTab = tabMeta[activeTab];
  const isBrowseTab = activeTab === 'browse';
  const isSavedTab = activeTab === 'saved';
  const isApplicationsTab = activeTab === 'applications';
  const hasActiveSearch = Boolean(activeSearch.keyword || activeSearch.location);
  const listLoading = isBrowseTab ? loading : (isSavedTab ? savedLoading : applicationsLoading);
  const displayedJobs = isBrowseTab ? filteredJobs : savedJobs;

  if (!ready) return null;

  return (
    <div className="employer-dashboard">
      <SeekerHeader session={session} user={session} onLogout={logout} />

      <main className="container employer-dashboard-main py-4 py-lg-5 flex-grow-1">
        <div className="employer-page-heading mb-4">
          <p className="employer-dash-eyebrow text-muted mb-1">{page.seekerDashTitle}</p>
          <h1 className="employer-page-title mb-2">
            {page.seekerDashWelcome}, {session.name.split(' ')[0]}
          </h1>
          <p className="text-muted mb-0">{page.seekerDashSubtitle}</p>
        </div>

        <div className="employer-card mb-4">
          <div className="seeker-dashboard-tabs" role="tablist" aria-label={page.seekerDashTitle}>
            <button
              type="button"
              role="tab"
              aria-selected={isBrowseTab}
              className={`seeker-dashboard-tab${isBrowseTab ? ' seeker-dashboard-tab-active' : ''}`}
              onClick={() => setActiveTab('browse')}
            >
              {page.seekerTabBrowseJobs}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isSavedTab}
              className={`seeker-dashboard-tab${isSavedTab ? ' seeker-dashboard-tab-active' : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              {page.seekerTabSavedJobs}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={isApplicationsTab}
              className={`seeker-dashboard-tab${isApplicationsTab ? ' seeker-dashboard-tab-active' : ''}`}
              onClick={() => setActiveTab('applications')}
            >
              {page.seekerTabApplications}
            </button>
          </div>

          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
            <div>
              <h2 className="employer-card-title mb-1">{currentTab.title}</h2>
              <p className="text-muted small mb-0">{currentTab.desc}</p>
            </div>
            <span className="badge bg-warning text-dark rounded-pill px-3 py-2">
              {formatStatCount(currentTab.count)} {isApplicationsTab ? page.seekerApplications : page.statJobs}
            </span>
          </div>

          {isBrowseTab && (
            <form className="seeker-search-form mb-4" onSubmit={handleSearch}>
              <div className="row g-2 g-md-3 align-items-end">
                <div className="col-md-4">
                  <label className="form-label employer-label mb-1" htmlFor="seeker-job-search">
                    {page.searchPlaceholder}
                  </label>
                  <input
                    id="seeker-job-search"
                    name="sjk-seeker-job-search"
                    type="search"
                    className="form-control employer-input"
                    placeholder={page.searchPlaceholder}
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    autoComplete="off"
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label employer-label mb-1" htmlFor="seeker-county-search">
                    {page.employerCounty}
                  </label>
                  <select
                    id="seeker-county-search"
                    name="sjk-seeker-county"
                    className="form-select employer-input"
                    value={searchCounty}
                    onChange={(event) => {
                      setSearchCounty(event.target.value);
                      setSearchArea('');
                    }}
                    autoComplete="off"
                  >
                    <option value="">{page.employerSelectCounty}</option>
                    {COUNTIES.map((county) => (
                      <option key={county} value={county}>{county}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label className="form-label employer-label mb-1" htmlFor="seeker-area-search">
                    {page.employerArea}
                  </label>
                  <select
                    id="seeker-area-search"
                    name="sjk-seeker-area"
                    className="form-select employer-input"
                    value={searchArea}
                    onChange={(event) => setSearchArea(event.target.value)}
                    autoComplete="off"
                    disabled={!searchCounty}
                  >
                    <option value="">{page.areaPlaceholder}</option>
                    {getAreasForCounty(searchCounty).map((area) => (
                      <option key={area} value={area}>{area}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <span className="form-label employer-label mb-1 d-none d-md-block" aria-hidden="true">&nbsp;</span>
                  <div className="seeker-search-actions d-flex gap-2">
                    <button
                      type="submit"
                      className="btn btn-warning fw-semibold rounded-pill flex-grow-1 py-2"
                      disabled={loading || refreshing}
                    >
                      {page.heroButton}
                    </button>
                    <button
                      type="button"
                      className="btn btn-outline-secondary fw-semibold rounded-pill py-2 seeker-refresh-btn"
                      onClick={handleRefresh}
                      disabled={loading || refreshing}
                      aria-label={page.seekerRefreshJobs}
                      title={page.seekerRefreshJobs}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
                        <path d="M21 3v6h-6" />
                      </svg>
                      <span className="seeker-refresh-label">{page.seekerRefreshJobs}</span>
                    </button>
                  </div>
                </div>
              </div>
              {hasActiveSearch && (
                <p className="seeker-search-active-note text-muted small mb-0 mt-3">
                  {page.seekerSearchFiltered}{' '}
                  <button type="button" className="seeker-clear-search-link" onClick={handleRefresh}>
                    {page.seekerClearSearch}
                  </button>
                </p>
              )}
            </form>
          )}

          {listLoading ? (
            <p className="text-muted text-center py-5">...</p>
          ) : isApplicationsTab ? (
            applications.length === 0 ? (
              <div className="employer-empty-state text-center py-5">
                <div className="employer-empty-icon mb-3">📝</div>
                <p className="text-muted mb-0">{page.seekerNoApplications}</p>
              </div>
            ) : (
              <div className="seeker-applications-list">
                {applications.map((application) => (
                  <article key={application.id} className="seeker-application-card">
                    <div className="seeker-application-card-header">
                      <div>
                        <h3 className="seeker-application-title">{application.jobTitle}</h3>
                        <p className="text-muted small mb-0">
                          {categoryLabel(application.jobCategory)} · {application.jobLocation}
                        </p>
                      </div>
                      <span className="badge bg-warning text-dark rounded-pill">{application.jobPay}</span>
                    </div>

                    <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                      <span className={`badge application-status-badge application-status-${application.status}`}>
                        {applicationStatusLabel(application.status, page)}
                      </span>
                      {application.jobStatus === 'closed' && (
                        <span className="badge bg-secondary-subtle text-secondary">{page.employerJobClosed}</span>
                      )}
                    </div>

                    <p className="seeker-application-message text-muted">{application.message}</p>

                    <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                      <span className="small text-muted">
                        {page.seekerAppliedOn}{' '}
                        <RelativeTime value={application.createdAt} lang={lang} />
                      </span>
                      <div className="d-flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-warning rounded-pill px-3"
                          onClick={() => setSelectedJobId(application.jobId)}
                          disabled={application.jobStatus === 'closed'}
                        >
                          {page.seekerJobDetails}
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger rounded-pill px-3"
                          onClick={() => setWithdrawTarget(application)}
                        >
                          {page.seekerWithdrawApplication}
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )
          ) : isBrowseTab && jobs.length === 0 ? (
            <div className="employer-empty-state text-center py-5">
              <div className="employer-empty-icon mb-3">📋</div>
              <p className="text-muted mb-0">{page.seekerNoJobs}</p>
            </div>
          ) : isBrowseTab && filteredJobs.length === 0 ? (
            <div className="employer-empty-state text-center py-5">
              <div className="employer-empty-icon mb-3">🔍</div>
              <p className="text-muted mb-3">{page.seekerSearchNoResults}</p>
              <button
                type="button"
                className="btn btn-outline-warning rounded-pill px-4 fw-semibold"
                onClick={handleRefresh}
                disabled={loading || refreshing}
              >
                {page.seekerClearSearch}
              </button>
            </div>
          ) : isSavedTab && savedJobs.length === 0 ? (
            <div className="employer-empty-state text-center py-5">
              <div className="employer-empty-icon mb-3">🔖</div>
              <p className="text-muted mb-0">{page.seekerNoSavedJobs}</p>
            </div>
          ) : (
            <div className="seeker-jobs-feed">
              {displayedJobs.map((job, index) => (
                <SeekerJobRow
                  key={job.id}
                  job={job}
                  lang={lang}
                  page={page}
                  jobTypeLabel={jobTypeLabel}
                  categoryLabel={categoryLabel}
                  onReact={handleReact}
                  onOpenDetails={setSelectedJobId}
                  onRemoveSaved={!isBrowseTab ? handleRemoveSaved : undefined}
                  isLast={index === displayedJobs.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <JobDetailsModal
        jobId={selectedJobId}
        open={selectedJobId !== null}
        onClose={() => {
          setSelectedJobId(null);
          setOpenApplyOnLoad(false);
        }}
        onJobUpdate={updateJobInLists}
        onApplicationSubmitted={loadApplications}
        onApplicationSuccessDone={handleApplicationSuccessDone}
        categoryLabel={categoryLabel}
        session={session}
        autoOpenApply={openApplyOnLoad}
      />

      <ConfirmDialog
        open={withdrawTarget !== null}
        title={page.seekerWithdrawTitle}
        message={page.seekerWithdrawConfirm}
        confirmLabel={withdrawingId ? page.seekerWithdrawing : page.seekerWithdrawConfirmBtn}
        cancelLabel={page.seekerWithdrawCancel}
        onConfirm={handleWithdrawApplication}
        onCancel={() => setWithdrawTarget(null)}
        loading={withdrawingId !== null}
        variant="danger"
      />

      <SiteFooter compact />
      {sessionExpired && <SessionExpiredPrompt />}
    </div>
  );
}

export default JobSeekerDashboardPage;
