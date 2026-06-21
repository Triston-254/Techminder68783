import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminHeader from '../components/AdminHeader';
import AdminJobPreview from '../components/AdminJobPreview';
import AdminTabs from '../components/AdminTabs';
import AdminUserActions from '../components/AdminUserActions';
import SessionExpiredPrompt from '../components/SessionExpiredPrompt';
import SiteFooter from '../components/SiteFooter';
import UserAvatar from '../components/UserAvatar';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { useAdminSession } from '../hooks/useAdminSession';
import { adminAPI, adminJobsAPI } from '../utils/api';
import '../App.css';

const STAT_CARDS = [
  { key: 'seekers', label: 'Jobseekers', icon: '👥', tone: 'seekers' },
  { key: 'employers', label: 'Employers', icon: '🏢', tone: 'employers' },
  { key: 'jobs', label: 'Jobs', icon: '💼', tone: 'jobs' },
  { key: 'applications', label: 'Applications', icon: '📋', tone: 'applications' },
];

const EXTRA_TABS = [
  { key: 'feedback', label: 'Feedback' },
  { key: 'notifications', label: 'Send Notification' },
];

function formatDate(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function formatSubmittedDate(value) {
  if (!value) return '-';
  try {
    return new Date(value).toLocaleDateString();
  } catch {
    return value;
  }
}

function feedbackStatusClass(status) {
  if (status === 'done') return 'text-bg-success';
  if (status === 'in_progress') return 'text-bg-info';
  return 'text-bg-warning';
}

function filterBySearch(items, search, fields) {
  const query = search.trim().toLowerCase();
  if (!query) return items;
  return items.filter((item) => fields.some((field) => String(item[field] || '').toLowerCase().includes(query)));
}

function AdminDashboardPage() {
  const { lang, page } = useLanguage();
  const { showToast } = useToast();
  const { session, logout, ready, sessionExpired } = useAdminSession();

  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [stats, setStats] = useState({ seekers: 0, employers: 0, jobs: 0, applications: 0, messages: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  const [activeView, setActiveView] = useState(null);
  const [panelSearch, setPanelSearch] = useState('');

  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedJobDetail, setSelectedJobDetail] = useState(null);
  const [selectedApplicants, setSelectedApplicants] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const [loading, setLoading] = useState(true);
  const [jobDetailLoading, setJobDetailLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [closingJobs, setClosingJobs] = useState(false);
  const [closeReason, setCloseReason] = useState('');
  const [error, setError] = useState('');

  const [notifyTitle, setNotifyTitle] = useState('SmartJobKenya');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [notifyAudience, setNotifyAudience] = useState('all');
  const [notifyUserId, setNotifyUserId] = useState('');
  const [sendingNotification, setSendingNotification] = useState(false);
  const [updatingFeedbackId, setUpdatingFeedbackId] = useState(null);

  const loadStats = useCallback(async () => {
    if (!session) return;
    setStatsLoading(true);
    try {
      const result = await adminAPI.stats();
      if (result.success && result.stats) {
        setStats(result.stats);
      }
    } catch {
      // Keep showing list-based fallback counts in the UI.
    } finally {
      setStatsLoading(false);
    }
  }, [session]);

  const loadAdminData = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    setError('');
    try {
      const [usersResult, jobsResult, applicationsResult, messagesResult] = await Promise.allSettled([
        adminAPI.listUsers(),
        adminAPI.listJobs(),
        adminAPI.listApplications(),
        adminAPI.listContactMessages(),
      ]);

      if (usersResult.status === 'fulfilled' && usersResult.value.success) {
        setUsers(usersResult.value.users);
      }
      if (jobsResult.status === 'fulfilled' && jobsResult.value.success) {
        setJobs(jobsResult.value.jobs);
      }
      if (applicationsResult.status === 'fulfilled' && applicationsResult.value.success) {
        setApplications(applicationsResult.value.applications);
      }
      if (messagesResult.status === 'fulfilled' && messagesResult.value.success) {
        setContactMessages(messagesResult.value.messages);
      }
    } catch {
      setError('Failed to load admin data.');
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const seekers = useMemo(() => users.filter((user) => user.role === 'seeker'), [users]);
  const employers = useMemo(() => users.filter((user) => user.role === 'employer'), [users]);

  const displayStats = useMemo(() => ({
    seekers: stats.seekers || seekers.length,
    employers: stats.employers || employers.length,
    jobs: stats.jobs || jobs.length,
    applications: stats.applications || applications.length,
    messages: stats.messages || contactMessages.length,
  }), [stats, seekers.length, employers.length, jobs.length, applications.length, contactMessages.length]);

  const panelItems = useMemo(() => {
    if (activeView === 'seekers') {
      return filterBySearch(seekers, panelSearch, ['name', 'email', 'phone']);
    }
    if (activeView === 'employers') {
      return filterBySearch(employers, panelSearch, ['name', 'email', 'phone']);
    }
    if (activeView === 'jobs') {
      return filterBySearch(jobs, panelSearch, ['title', 'location', 'employerName', 'category']);
    }
    if (activeView === 'applications') {
      return filterBySearch(applications, panelSearch, ['seekerName', 'jobTitle', 'employerName', 'message', 'status']);
    }
    if (activeView === 'feedback') {
      return filterBySearch(contactMessages, panelSearch, ['name', 'email', 'phone', 'message', 'status']);
    }
    return [];
  }, [activeView, seekers, employers, jobs, applications, contactMessages, panelSearch]);

  const clearSelections = () => {
    setSelectedUser(null);
    setSelectedJob(null);
    setSelectedJobDetail(null);
    setSelectedApplicants([]);
    setSelectedApplication(null);
    setSelectedApplicant(null);
    setError('');
  };

  const openView = (key) => {
    setActiveView((current) => (current === key ? null : key));
    setPanelSearch('');
    clearSelections();
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setSelectedJob(null);
    setSelectedJobDetail(null);
    setSelectedApplicants([]);
    setSelectedApplication(null);
    setSelectedApplicant(null);
    setNotifyUserId(String(user.id));
    setError('');
  };

  const loadJobDetails = async (job) => {
    setSelectedJob(job);
    setSelectedUser(null);
    setSelectedApplication(null);
    setSelectedApplicant(null);
    setJobDetailLoading(true);
    setError('');
    try {
      const [jobResult, applicantsResult] = await Promise.all([
        adminAPI.getJob(job.id),
        adminAPI.getJobApplicants(job.id),
      ]);
      if (jobResult.success) setSelectedJobDetail(jobResult.job);
      if (applicantsResult.success) setSelectedApplicants(applicantsResult.applicants);
    } catch {
      setError('Failed to load job details.');
    } finally {
      setJobDetailLoading(false);
    }
  };

  const selectApplication = (application) => {
    setSelectedApplication(application);
    setSelectedUser(null);
    setSelectedJob(null);
    setSelectedJobDetail(null);
    setSelectedApplicants([]);
    setSelectedApplicant(null);
    setError('');
  };

  const updateUserStatus = async (nextStatus) => {
    if (!selectedUser?.id || saving) return;
    setSaving(true);
    setError('');
    try {
      const result = await adminAPI.manageUser({
        id: selectedUser.id,
        accountStatus: nextStatus,
      });
      if (!result.success) {
        setError(result.message || 'Failed to update user status');
        return;
      }
      setUsers((current) => current.map((u) => (u.id === result.user.id ? result.user : u)));
      setSelectedUser(result.user);
      await loadAdminData();
      await loadStats();
      showToast(result.message || 'User updated successfully');
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const closeJobAsAdmin = async () => {
    if (!selectedJob?.id) {
      setError('Select a job to close.');
      return;
    }
    if (!closeReason.trim()) {
      setError('Please enter a reason for closing this job.');
      return;
    }
    setClosingJobs(true);
    setError('');
    try {
      const result = await adminJobsAPI.closeJob({
        jobId: selectedJob.id,
        reason: closeReason.trim(),
      });
      if (!result?.success) {
        setError(result?.message || 'Failed to close job');
        return;
      }
      setCloseReason('');
      clearSelections();
      showToast('Job closed. Employer and applicants have been notified.');
      await loadAdminData();
      await loadStats();
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setClosingJobs(false);
    }
  };

  const sendNotification = async (event) => {
    event.preventDefault();
    const title = notifyTitle.trim();
    const message = notifyMessage.trim();
    if (!title || !message) {
      showToast('Enter a title and message');
      return;
    }
    setSendingNotification(true);
    setError('');
    try {
      const payload = {
        title,
        message,
        audience: notifyAudience,
      };
      if (notifyAudience === 'user') {
        payload.userId = Number(notifyUserId);
      }
      const result = await adminAPI.sendNotification(payload);
      if (!result.success) {
        setError(result.message || 'Failed to send notification');
        return;
      }
      setNotifyTitle('SmartJobKenya');
      setNotifyMessage('');
      showToast(result.message || 'Notification sent');
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setSendingNotification(false);
    }
  };

  const updateFeedbackStatus = async (message, status) => {
    if (!message?.id || updatingFeedbackId) return;
    setUpdatingFeedbackId(message.id);
    setError('');
    try {
      const result = await adminAPI.updateContactMessageStatus({ id: message.id, status });
      if (!result.success) {
        setError(result.message || 'Failed to update feedback status');
        return;
      }
      setContactMessages((current) => current.map((item) => (
        item.id === message.id ? { ...item, status } : item
      )));
      showToast(result.message || 'Feedback status updated');
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setUpdatingFeedbackId(null);
    }
  };

  const deleteFeedbackMessage = async (message) => {
    if (!message?.id || updatingFeedbackId) return;
    setUpdatingFeedbackId(message.id);
    setError('');
    try {
      const result = await adminAPI.deleteContactMessage(message.id);
      if (!result.success) {
        setError(result.message || 'Failed to delete feedback');
        return;
      }
      setContactMessages((current) => current.filter((item) => item.id !== message.id));
      await loadStats();
      showToast(result.message || 'Feedback deleted');
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setUpdatingFeedbackId(null);
    }
  };

  const handleFeedbackActionChange = (message, value) => {
    if (value === 'delete') {
      deleteFeedbackMessage(message);
      return;
    }
    updateFeedbackStatus(message, value);
  };

  const renderUserDetail = () => {
    if (!selectedUser) {
      return <div className="text-muted small py-3">Select a user to manage their account.</div>;
    }
    return (
      <div className="admin-side-detail">
        <div className="d-flex align-items-center gap-3 mb-3">
          <UserAvatar name={selectedUser.name} image={selectedUser.profilePicture} size="md" />
          <div>
            <div className="fw-bold">{selectedUser.name}</div>
            <div className="text-muted small">{selectedUser.email}</div>
            <div className="text-muted small">{selectedUser.phone || 'No phone'}</div>
          </div>
        </div>
        <p className="small mb-2">
          <strong>Role:</strong> {selectedUser.role === 'seeker' ? 'Jobseeker' : 'Employer'}
        </p>
        <p className="small mb-3">
          <strong>Status:</strong>{' '}
          <span className={`badge ${(selectedUser.accountStatus || selectedUser.account_status) === 'suspended' ? 'text-bg-danger' : 'text-bg-success'}`}>
            {selectedUser.accountStatus || selectedUser.account_status || 'active'}
          </span>
        </p>
        <AdminUserActions
          accountStatus={selectedUser.accountStatus || selectedUser.account_status}
          isSaving={saving}
          onActivate={() => updateUserStatus('active')}
          onSuspend={() => updateUserStatus('suspended')}
        />
      </div>
    );
  };

  const renderJobDetail = () => {
    if (!selectedJob) {
      return <div className="text-muted small py-3">Select a job to view full details and applications.</div>;
    }
    if (jobDetailLoading) {
      return <div className="text-muted py-3">Loading job details...</div>;
    }
    return (
      <div className="admin-side-detail">
        <AdminJobPreview job={selectedJobDetail || selectedJob} page={page} lang={lang} />

        {selectedJobDetail?.status === 'active' && (
          <div className="admin-close-job-box mt-4">
            <label className="form-label employer-label" htmlFor="admin-close-reason">Close reason</label>
            <textarea
              id="admin-close-reason"
              className="form-control employer-input"
              rows="3"
              value={closeReason}
              onChange={(e) => setCloseReason(e.target.value)}
              placeholder="Explain why this job is being closed. Employer and applicants will be notified."
            />
            <button
              type="button"
              className="btn btn-danger rounded-pill fw-semibold w-100 mt-3"
              disabled={closingJobs}
              onClick={closeJobAsAdmin}
            >
              {closingJobs ? 'Closing...' : 'Close Job & Notify Users'}
            </button>
          </div>
        )}

        <div className="mt-4">
          <h4 className="h6 fw-bold mb-3">Applications ({selectedApplicants.length})</h4>
          {selectedApplicants.length === 0 ? (
            <p className="text-muted small mb-0">No applications for this job yet.</p>
          ) : (
            <div className="admin-detail-list admin-applicants-list">
              {selectedApplicants.map((applicant) => (
                <button
                  key={applicant.id}
                  type="button"
                  className={`admin-detail-item${selectedApplicant?.id === applicant.id ? ' is-selected' : ''}`}
                  onClick={() => setSelectedApplicant(applicant)}
                >
                  <div>
                    <div className="fw-semibold">{applicant.seekerName}</div>
                    <div className="text-muted small">{formatDate(applicant.createdAt)}</div>
                  </div>
                  <span className="badge text-bg-light text-capitalize">{applicant.status}</span>
                </button>
              ))}
            </div>
          )}

          {selectedApplicant && (
            <div className="admin-application-detail mt-3">
              <div className="d-flex align-items-center gap-3 mb-3">
                <UserAvatar name={selectedApplicant.seekerName} image={selectedApplicant.seekerProfilePicture} size="sm" />
                <div>
                  <div className="fw-semibold">{selectedApplicant.seekerName}</div>
                  <div className="text-muted small">{selectedApplicant.seekerEmail}</div>
                  {selectedApplicant.seekerPhone && (
                    <div className="text-muted small">{selectedApplicant.seekerPhone}</div>
                  )}
                </div>
              </div>
              <p className="small text-muted mb-2">Applied {formatDate(selectedApplicant.createdAt)}</p>
              <div className="admin-message-body">{selectedApplicant.message}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderApplicationDetail = () => {
    if (!selectedApplication) {
      return <div className="text-muted small py-3">Select an application to view full details.</div>;
    }
    return (
      <div className="admin-side-detail">
        <h4 className="h5 fw-bold mb-1">{selectedApplication.jobTitle}</h4>
        <p className="text-muted small mb-3">{selectedApplication.employerName}</p>
        <div className="d-flex align-items-center gap-3 mb-3">
          <UserAvatar name={selectedApplication.seekerName} image={selectedApplication.seekerProfilePicture} size="md" />
          <div>
            <div className="fw-bold">{selectedApplication.seekerName}</div>
            <div className="text-muted small">{selectedApplication.seekerEmail}</div>
          </div>
        </div>
        <p className="small mb-2"><strong>Status:</strong> {selectedApplication.status}</p>
        <p className="small text-muted mb-3">Submitted {formatDate(selectedApplication.createdAt)}</p>
        <h5 className="h6 fw-bold">Application message</h5>
        <div className="admin-message-body">{selectedApplication.message}</div>
      </div>
    );
  };

  const renderList = () => {
    if (loading) return <div className="text-muted py-3">Loading...</div>;
    if (panelItems.length === 0) return <div className="text-muted py-3">No results found.</div>;

    if (activeView === 'seekers' || activeView === 'employers') {
      return panelItems.map((user) => (
        <button
          key={user.id}
          type="button"
          className={`admin-detail-item${selectedUser?.id === user.id ? ' is-selected' : ''}`}
          onClick={() => selectUser(user)}
        >
          <div>
            <div className="fw-semibold">{user.name}</div>
            <div className="text-muted small">{user.email}</div>
          </div>
          <span className={`badge ${(user.accountStatus || user.account_status) === 'suspended' ? 'text-bg-danger' : 'text-bg-success'}`}>
            {user.accountStatus || user.account_status || 'active'}
          </span>
        </button>
      ));
    }

    if (activeView === 'jobs') {
      return panelItems.map((job) => (
        <button
          key={job.id}
          type="button"
          className={`admin-detail-item${selectedJob?.id === job.id ? ' is-selected' : ''}`}
          onClick={() => loadJobDetails(job)}
        >
          <div>
            <div className="fw-semibold">{job.title}</div>
            <div className="text-muted small">{job.employerName} · {job.location}</div>
          </div>
          <span className={`badge ${job.status === 'active' ? 'text-bg-success' : 'text-bg-secondary'}`}>
            {job.status}
          </span>
        </button>
      ));
    }

    if (activeView === 'applications') {
      return panelItems.map((application) => (
        <button
          key={application.id}
          type="button"
          className={`admin-detail-item${selectedApplication?.id === application.id ? ' is-selected' : ''}`}
          onClick={() => selectApplication(application)}
        >
          <div>
            <div className="fw-semibold">{application.seekerName}</div>
            <div className="text-muted small">{application.jobTitle} · {formatDate(application.createdAt)}</div>
          </div>
          <span className="badge text-bg-light text-capitalize">{application.status}</span>
        </button>
      ));
    }

    return (
      <div className="admin-feedback-table-wrap">
        <table className="table admin-feedback-table align-middle mb-0">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Contact</th>
              <th scope="col">Message</th>
              <th scope="col">Date Submitted</th>
              <th scope="col" className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {panelItems.map((message) => (
              <tr key={message.id}>
                <td className="fw-semibold">{message.name || '-'}</td>
                <td>
                  <div className="small">{message.email || '-'}</div>
                  {message.phone && <div className="small text-muted">{message.phone}</div>}
                </td>
                <td className="admin-feedback-message-cell">{message.message}</td>
                <td className="small text-muted">{formatSubmittedDate(message.createdAt)}</td>
                <td>
                  <div className="admin-feedback-actions">
                    <select
                      className={`form-select form-select-sm admin-feedback-action-select ${feedbackStatusClass(message.status)}`}
                      value={message.status || 'pending'}
                      disabled={updatingFeedbackId === message.id}
                      onChange={(event) => handleFeedbackActionChange(message, event.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In progress</option>
                      <option value="done">Done</option>
                      <option value="delete">Delete</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (!ready) return null;

  const activeCard = STAT_CARDS.find((card) => card.key === activeView);
  const panelTitle = activeCard?.label || (activeView === 'feedback' ? 'Feedback' : '');

  return (
    <div className="employer-dashboard admin-dashboard">
      <AdminHeader session={session} onLogout={logout} />

      <main className="container employer-dashboard-main py-4 py-lg-5 flex-grow-1">
        <div className="employer-page-heading mb-4">
          <p className="employer-dash-eyebrow text-muted mb-1">Admin</p>
          <h1 className="employer-page-title mb-2">Manage jobseekers and employers</h1>
        </div>

        {error && <div className="alert alert-danger py-2 small mb-4">{error}</div>}

        <div className="admin-stat-grid mb-3">
          {STAT_CARDS.map((card) => (
            <button
              key={card.key}
              type="button"
              className={`admin-stat-card admin-stat-card-${card.tone}${activeView === card.key ? ' is-active' : ''}`}
              onClick={() => openView(card.key)}
              aria-pressed={activeView === card.key}
            >
              <div className="admin-stat-card-top">
                <span className="admin-stat-card-icon-wrap" aria-hidden="true">{card.icon}</span>
                <small className="admin-stat-card-label">{card.label}</small>
              </div>
              <span className="admin-stat-card-value">
                {statsLoading ? '—' : (displayStats[card.key] ?? 0)}
              </span>
              <span className="admin-stat-card-hint">Click to view details</span>
            </button>
          ))}
        </div>

        <AdminTabs
          tabs={[
            { key: 'feedback', label: `Feedback (${statsLoading ? '—' : displayStats.messages ?? 0})` },
            ...EXTRA_TABS.filter((tab) => tab.key !== 'feedback'),
          ]}
          activeTab={activeView === 'feedback' || activeView === 'notifications' ? activeView : ''}
          onChange={(key) => openView(key)}
        />

        {activeView && activeView !== 'notifications' && (
          <div className="employer-card admin-stat-detail-panel mt-4">
            <div className="admin-stat-detail-header d-flex flex-wrap justify-content-between align-items-start gap-3">
              <div>
                <h2 className="employer-card-title mb-1">{panelTitle} details</h2>
                <p className="text-muted small mb-0">
                  {activeView === 'seekers' || activeView === 'employers'
                    ? 'Search, select a user, then suspend or activate their account.'
                    : activeView === 'jobs'
                      ? 'View full job info, applications, and close jobs with a reason.'
                      : activeView === 'applications'
                        ? 'Review full application messages from jobseekers.'
                        : 'Messages sent from the landing page contact form.'}
                </p>
              </div>
              <form
                className="admin-panel-search"
                onSubmit={(event) => event.preventDefault()}
              >
                <input
                  className="form-control employer-input"
                  value={panelSearch}
                  onChange={(event) => setPanelSearch(event.target.value)}
                  placeholder={`Search ${panelTitle.toLowerCase()}...`}
                />
              </form>
            </div>

            {activeView === 'feedback' ? (
              <div className="admin-feedback-layout">
                {renderList()}
              </div>
            ) : (
              <div className="row g-4">
                <div className="col-lg-5">
                  <div className="admin-detail-list">{renderList()}</div>
                </div>
                <div className="col-lg-7">
                  <div className="admin-detail-panel-side">
                    {activeView === 'seekers' || activeView === 'employers'
                      ? renderUserDetail()
                      : activeView === 'jobs'
                        ? renderJobDetail()
                        : renderApplicationDetail()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeView === 'notifications' && (
          <div className="employer-card admin-notify-panel mt-4">
            <h2 className="employer-card-title mb-2">Send Notification</h2>
            <p className="text-muted small mb-4">
              Send an in-app and email notification to jobseekers, employers, or a specific user.
            </p>
            <form onSubmit={sendNotification}>
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label employer-label" htmlFor="notify-audience">Audience</label>
                  <select
                    id="notify-audience"
                    className="form-select employer-input"
                    value={notifyAudience}
                    onChange={(e) => setNotifyAudience(e.target.value)}
                  >
                    <option value="all">All users</option>
                    <option value="seekers">All jobseekers</option>
                    <option value="employers">All employers</option>
                    <option value="user">Specific user</option>
                  </select>
                </div>
                {notifyAudience === 'user' && (
                  <div className="col-md-6">
                    <label className="form-label employer-label" htmlFor="notify-user">User</label>
                    <select
                      id="notify-user"
                      className="form-select employer-input"
                      value={notifyUserId}
                      onChange={(e) => setNotifyUserId(e.target.value)}
                      required
                    >
                      <option value="">Select user</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="col-12">
                  <label className="form-label employer-label" htmlFor="notify-title">Header</label>
                  <input
                    id="notify-title"
                    className="form-control employer-input"
                    value={notifyTitle}
                    onChange={(e) => setNotifyTitle(e.target.value)}
                    placeholder="SmartJobKenya"
                    required
                  />
                </div>
                <div className="col-12">
                  <label className="form-label employer-label" htmlFor="notify-message">Message</label>
                  <textarea
                    id="notify-message"
                    className="form-control employer-input"
                    rows="5"
                    value={notifyMessage}
                    onChange={(e) => setNotifyMessage(e.target.value)}
                    placeholder="Write the notification message..."
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn btn-warning rounded-pill fw-semibold mt-3"
                disabled={sendingNotification}
              >
                {sendingNotification ? 'Sending...' : 'Send Notification'}
              </button>
            </form>
          </div>
        )}
      </main>

      <SiteFooter />
      {sessionExpired && <SessionExpiredPrompt />}
    </div>
  );
}

export default AdminDashboardPage;
