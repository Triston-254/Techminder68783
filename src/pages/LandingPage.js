import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../App.css';
import AppNavbar from '../components/AppNavbar';
import JobDetailsModal from '../components/JobDetailsModal';
import PromoSlider from '../components/PromoSlider';
import { useLanguage } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import {
  categories,
  splitWords,
  stats as statConfig,
  testimonials,
  translatorDictionary,
} from '../data/landingData';
import { formatJobLocation, getAreasForCounty } from '../data/kenyaLocations';
import { COUNTIES, filterJobs, formatStatCount, getAllJobs, getPlatformStats } from '../utils/jobs';
import { subscriptionsAPI } from '../utils/api';

function JobAlertSuccessBox({ page, status, onDone }) {
  const copy = (() => {
    if (status === 'already_subscribed') {
      return { title: page.jobAlertsAlreadyTitle, message: page.jobAlertsAlreadyMessage };
    }
    if (status === 'resubscribed') {
      return { title: page.jobAlertsResubscribeTitle, message: page.jobAlertsResubscribeMessage };
    }
    return { title: page.jobAlertsSuccessTitle, message: page.jobAlertsSuccessMessage };
  })();

  return (
    <div className="seeker-apply-success-box job-alert-success-box" role="status">
      <div className="seeker-apply-success-check-lg" aria-hidden="true">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path className="seeker-apply-success-check-path" d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h3 className="seeker-apply-success-box-title">{copy.title}</h3>
      <div className="seeker-apply-success-line-track" aria-hidden="true">
        <span className="seeker-apply-success-line" />
      </div>
      <p className="seeker-apply-success-box-message mb-3">{copy.message}</p>
      <button type="button" className="btn btn-warning fw-semibold rounded-pill px-4 py-2" onClick={onDone}>
        {page.jobAlertsSuccessDone}
      </button>
    </div>
  );
}

function LandingPage() {
  const { lang, setLang, page } = useLanguage();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [translateDirection, setTranslateDirection] = useState('en2sw');
  const [sourceText, setSourceText] = useState('Type English text here to translate into Kiswahili.');
  const [translatedText, setTranslatedText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCounty, setSearchCounty] = useState('');
  const [searchArea, setSearchArea] = useState('');
  const [activeSearch, setActiveSearch] = useState({ keyword: '', location: '', category: '' });
  const [activeCategoryKey, setActiveCategoryKey] = useState('');
  const [alertEmail, setAlertEmail] = useState('');
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertSubscribeSuccess, setAlertSubscribeSuccess] = useState(false);
  const [alertSuccessStatus, setAlertSuccessStatus] = useState('subscribed');
  const [liveJobs, setLiveJobs] = useState([]);
  const [liveStats, setLiveStats] = useState({ jobs: 0, employers: 0, seekers: 0, counties: 47 });
  const [jobsLoading, setJobsLoading] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [openApplyOnSelect, setOpenApplyOnSelect] = useState(false);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setJobsLoading(true);
      try {
        const [jobs, stats] = await Promise.all([getAllJobs(), getPlatformStats()]);
        if (!active) return;
        setLiveJobs(jobs);
        setLiveStats(stats);
      } catch {
        if (!active) return;
        setLiveJobs([]);
      } finally {
        if (active) setJobsLoading(false);
      }
    };

    loadData();
    return () => {
      active = false;
    };
  }, []);

  const filteredJobs = useMemo(
    () => filterJobs(liveJobs, activeSearch),
    [liveJobs, activeSearch],
  );

  const categoryJobs = useMemo(() => {
    if (!activeCategoryKey) return [];
    const cat = categories.find((c) => c.key === activeCategoryKey);
    if (!cat) return [];
    const enLabel = cat.en.toLowerCase();
    const swLabel = cat.sw.toLowerCase();
    return liveJobs.filter((job) => {
      const jobCat = (job.category || '').toLowerCase();
      return jobCat === enLabel || jobCat === swLabel || jobCat.includes(cat.key);
    });
  }, [liveJobs, activeCategoryKey]);

  const activeCategoryLabel = useMemo(() => {
    if (!activeCategoryKey) return '';
    const cat = categories.find((c) => c.key === activeCategoryKey);
    return cat ? (lang === 'en' ? cat.en : cat.sw) : '';
  }, [activeCategoryKey, lang]);

  const featuredCards = useMemo(() => filteredJobs.slice(0, 3).map((job) => ({
    id: job.id,
    title: job.title,
    badge: job.jobType,
    employer: job.employerName,
    location: job.location,
    pay: job.pay,
    category: job.category,
  })), [filteredJobs]);

  const session = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('sjk_session') || 'null');
    } catch {
      return null;
    }
  }, [selectedJobId]);

  const categoryLabel = (value) => {
    const cat = categories.find((c) => c.key === value || c.en === value || c.sw === value);
    return cat ? (lang === 'en' ? cat.en : cat.sw) : value;
  };

  const provenHighlights = useMemo(() => ([
    { value: formatStatCount(liveStats.seekers ?? 0, { compact: true, plus: true }), label: page.provenResultsStat1 },
    { value: '48 hrs', label: page.provenResultsStat2 },
    { value: '94%', label: page.provenResultsStat3 },
  ]), [liveStats.seekers, page]);

  const statItems = useMemo(() => statConfig.map((stat) => ({
    ...stat,
    value: formatStatCount(liveStats[stat.key] ?? 0, {
      compact: stat.key !== 'counties',
      plus: stat.key !== 'counties',
    }),
  })), [liveStats]);

  const statLabels = useMemo(() => ({
    jobs: page.statJobs,
    employers: page.statEmployers,
    counties: page.statCounties,
    seekers: page.statSeekers,
  }), [page]);

  const translateText = () => {
    const dictionary = translatorDictionary[translateDirection];
    const result = splitWords(sourceText)
      .map((word) => {
        const lower = word.toLowerCase();
        if (dictionary[lower]) {
          const translated = dictionary[lower];
          return word[0] === word[0].toUpperCase()
            ? translated.charAt(0).toUpperCase() + translated.slice(1)
            : translated;
        }
        return word;
      })
      .join('');
    setTranslatedText(result);
  };

  const selectLanguage = (code) => setLang(code);

  const handleSearch = (event) => {
    event.preventDefault();
    const locationFilter = searchArea
      ? formatJobLocation(searchCounty, searchArea)
      : searchCounty.trim();
    setActiveCategoryKey('');
    setActiveSearch({
      keyword: searchQuery.trim(),
      location: locationFilter,
      category: '',
    });
    document.getElementById('jobs')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCategorySearch = (category) => {
    const label = lang === 'en' ? category.en : category.sw;
    setActiveCategoryKey(category.key);
    setActiveSearch({ keyword: '', location: '', category: label });
    document.getElementById('category-jobs')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleJobAlertSubscribe = async (event) => {
    event.preventDefault();
    const email = alertEmail.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast(page.jobAlertsInvalid);
      return;
    }

    setAlertLoading(true);
    try {
      const result = await subscriptionsAPI.subscribe(email);
      if (result.success) {
        setAlertSuccessStatus(result.status || 'subscribed');
        setAlertEmail('');
        setAlertSubscribeSuccess(true);
      } else {
        showToast(result.message || page.jobAlertsInvalid);
      }
    } catch {
      showToast(page.jobAlertsInvalid);
    } finally {
      setAlertLoading(false);
    }
  };

  const openJobDetails = (jobId) => {
    setOpenApplyOnSelect(false);
    setSelectedJobId(jobId);
  };

  const handleApply = (jobId) => {
    if (!session || session.role !== 'seeker') {
      navigate('/login', {
        state: {
          returnTo: '/job-seeker-dashboard',
          jobId,
          openApply: true,
        },
      });
      return;
    }
    navigate('/job-seeker-dashboard', { state: { jobId, openApply: true } });
  };

  const handleRequireLogin = (jobId) => {
    handleApply(jobId);
  };

  return (
    <div className="App">
      <AppNavbar />
      <PromoSlider />

      <header className="hero-section" id="home">
        <div className="hero-overlay" />
        <div className="hero-blob hero-blob-1" aria-hidden="true" />
        <div className="hero-blob hero-blob-2" aria-hidden="true" />
        <div className="container position-relative">
          <div className="row align-items-center gy-4">
            <div className="col-lg-6">
              <span className="badge hero-badge rounded-pill mb-3">{page.heroBadge}</span>
              <h1 className="hero-title">{page.heroTitle}</h1>
              <p className="lead hero-subtitle">{page.heroSubtitle}</p>

              <form className="card shadow-lg border-0 mt-4 search-card" onSubmit={handleSearch}>
                <div className="search-card-header px-4 pt-4 pb-0">
                  <span className="search-card-label">{page.quickJobSearch}</span>
                </div>
                <div className="card-body p-4 pt-3">
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="search-field-label" htmlFor="landing-job-search">{page.searchPlaceholder}</label>
                      <input
                        id="landing-job-search"
                        type="search"
                        className="form-control form-control-lg search-input"
                        placeholder={page.searchPlaceholder}
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                      />
                    </div>
                    <div className="col-md-3">
                      <label className="search-field-label" htmlFor="landing-county-search">{page.employerCounty}</label>
                      <select
                        id="landing-county-search"
                        name="sjk-landing-county"
                        className="form-select form-control-lg search-input"
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
                    <div className="col-md-3">
                      <label className="search-field-label" htmlFor="landing-area-search">{page.employerArea}</label>
                      <select
                        id="landing-area-search"
                        name="sjk-landing-area"
                        className="form-select form-control-lg search-input"
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
                    <div className="col-md-2 d-grid align-items-end">
                      <button type="submit" className="btn btn-warning btn-lg fw-semibold search-submit-btn">{page.heroButton}</button>
                    </div>
                  </div>
                </div>
              </form>

              <div className="hero-trust-row mt-4 d-flex flex-wrap gap-2">
                <span className="trust-chip">✓ Free to join</span>
                <span className="trust-chip">✓ Verified employers</span>
                <span className="trust-chip">✓ 47 counties</span>
              </div>
            </div>

            <div className="col-lg-6 text-center">
              <div className="hero-box p-4 rounded-4 shadow-lg bg-white hero-float">
                <div className="hero-box-glow" aria-hidden="true" />
                <div className="badge hero-popular-badge mb-3 rounded-pill px-3 py-2">🔥 Popular today</div>
                <h2 className="h4 fw-bold">{page.categoriesTitle}</h2>
                <p className="text-muted">{page.categoriesSubtitle}</p>
                <div className="row gy-3 mt-3">
                  {categories.map((category) => (
                    <div className="col-6" key={category.key}>
                      <div className="category-pill p-3 rounded-4 text-start shadow-sm">
                        <span className="me-2">{category.icon}</span>
                        {lang === 'en' ? category.en : category.sw}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="stats-bar py-4">
        <div className="container">
          <div className="row g-3 text-center stats-grid">
            {statItems.map((stat) => (
              <div className="col-6 col-lg-3" key={stat.key}>
                <div className="stat-item p-3 rounded-4">
                  <div className="stat-icon mb-1">{stat.icon}</div>
                  <div className="stat-value fw-bold">{stat.value}</div>
                  <div className="stat-label text-muted small">{statLabels[stat.key]}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main>
        <section className="landing-section container py-5" id="how-it-works">
          <div className="section-header text-center mx-auto mb-5">
            <p className="section-eyebrow text-uppercase fw-semibold mb-2">{page.howTitle}</p>
            <h2 className="section-title display-6 fw-bold mb-3">{page.howSubtitle}</h2>
            <div className="section-title-line mx-auto" />
          </div>
          <div className="row g-4">
            {[
              { step: '01', title: page.step1Title, desc: page.step1Desc, icon: '👤' },
              { step: '02', title: page.step2Title, desc: page.step2Desc, icon: '🔍' },
              { step: '03', title: page.step3Title, desc: page.step3Desc, icon: '🎉' },
            ].map((item) => (
              <div className="col-md-4" key={item.step}>
                <div className="card h-100 border-0 shadow-sm step-card text-center p-4">
                  <div className="step-number mx-auto mb-3">{item.step}</div>
                  <div className="step-icon mb-3">{item.icon}</div>
                  <h5 className="fw-bold">{item.title}</h5>
                  <p className="text-muted mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-section section-muted py-5" id="jobs">
          <div className="container">
          <div className="section-header text-center mx-auto mb-5">
            <p className="section-eyebrow text-uppercase fw-semibold mb-2">{page.categoriesTitle}</p>
            <h2 className="section-title display-6 fw-bold mb-0">{page.categoriesSubtitle}</h2>
            <div className="section-title-line mx-auto mt-3" />
          </div>

          <div className="row g-4">
            {categories.map((category) => (
              <div className="col-sm-6 col-lg-3" key={category.key}>
                <div className={`card h-100 border-0 shadow-sm category-card${activeCategoryKey === category.key ? ' category-card-active' : ''}`}>
                  <div className="card-body text-center p-4">
                    <div className="category-icon mb-3">{category.icon}</div>
                    <h5 className="fw-bold">{lang === 'en' ? category.en : category.sw}</h5>
                    <p className="text-muted small mb-3">Fast listings for on-demand work in this niche.</p>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-warning rounded-pill px-4"
                      onClick={() => handleCategorySearch(category)}
                    >
                      {page.heroButton}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {activeCategoryKey && (
            <div className="mt-5" id="category-jobs">
              <div className="section-header text-center mx-auto mb-4">
                <h3 className="section-title fw-bold mb-2">{page.categoryJobsTitle}</h3>
                <p className="text-muted mb-0">{activeCategoryLabel}</p>
              </div>
              {jobsLoading ? (
                <p className="text-center text-muted py-4">...</p>
              ) : categoryJobs.length === 0 ? (
                <p className="text-center text-muted py-4">{page.categoryJobsEmpty}</p>
              ) : (
                <div className="row g-4">
                  {categoryJobs.map((job) => (
                    <div className="col-md-4" key={job.id}>
                      <div className="card h-100 border-0 shadow-sm featured-card">
                        <div className="card-body p-4">
                          <span className="badge bg-dark mb-3 rounded-pill">{job.jobType}</span>
                          <button
                            type="button"
                            className="landing-job-title-link"
                            onClick={() => openJobDetails(job.id)}
                          >
                            <h5 className="fw-bold mb-2 landing-job-title">{job.title}</h5>
                          </button>
                          <p className="text-muted small mb-1">{job.location}</p>
                          <p className="text-muted mb-3">
                            {job.employerName ? `${page.seekerPostedBy} ${job.employerName}` : job.pay}
                          </p>
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-warning rounded-pill"
                            onClick={() => handleApply(job.id)}
                          >
                            {page.applyNow}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          </div>
        </section>

        <section className="landing-section container py-5" id="featured">
          <div className="row align-items-center mb-4 section-row-header">
            <div className="col-md-8">
              <p className="section-eyebrow text-uppercase fw-semibold mb-2">{page.featuredTitle}</p>
              <h2 className="section-title fw-bold">{page.featuredTitle}</h2>
              <p className="text-muted">{page.featuredSubtitle}</p>
            </div>
            <div className="col-md-4 text-md-end">
              <Link to="/login" className="btn btn-warning rounded-pill px-4 fw-semibold">{page.exploreFeatured}</Link>
            </div>
          </div>

          <div className="row g-4">
            {jobsLoading ? (
              <div className="col-12 text-center text-muted py-4">...</div>
            ) : featuredCards.length === 0 ? (
              <div className="col-12 text-center text-muted py-4">{page.landingNoJobs}</div>
            ) : featuredCards.map((job) => (
              <div className="col-md-4" key={job.id}>
                <div className="card h-100 border-0 shadow-sm featured-card">
                  <div className="card-body p-4">
                    <span className="badge bg-dark mb-3 rounded-pill">{job.badge}</span>
                    <button
                      type="button"
                      className="landing-job-title-link"
                      onClick={() => openJobDetails(job.id)}
                    >
                      <h5 className="fw-bold mb-2 landing-job-title">{job.title}</h5>
                    </button>
                    <p className="text-muted small mb-1">{job.location}</p>
                    <p className="text-muted">{job.employer ? `${page.seekerPostedBy} ${job.employer}` : page.featuredSubtitle}</p>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-warning rounded-pill mt-2"
                      onClick={() => handleApply(job.id)}
                    >
                      {page.applyNow}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="landing-section section-alt py-5" id="proven-results">
          <div className="container">
            <div className="section-header text-center mx-auto mb-5">
              <p className="section-eyebrow text-uppercase fw-semibold mb-2">{page.provenResultsTitle}</p>
              <h2 className="section-title display-6 fw-bold mb-3">{page.provenResultsTitle}</h2>
              <p className="text-muted mb-0">{page.provenResultsSubtitle}</p>
              <div className="section-title-line mx-auto mt-3" />
            </div>

            <div className="row g-3 mb-5 proven-results-stats">
              {provenHighlights.map((item) => (
                <div className="col-md-4" key={item.label}>
                  <div className="card border-0 shadow-sm h-100 text-center p-4 proven-stat-card">
                    <div className="proven-stat-value fw-bold">{item.value}</div>
                    <div className="text-muted small">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="row g-4">
              {testimonials.map((item) => (
                <div className="col-md-4" key={item.name}>
                  <div className="card h-100 border-0 shadow-sm testimonial-card p-4">
                    <div className="testimonial-stars mb-3" aria-hidden="true">★★★★★</div>
                    <p className="text-muted mb-4">
                      {lang === 'en' ? item.quoteEn : item.quoteSw}
                    </p>
                    <div className="d-flex align-items-center gap-3 mt-auto">
                      <div className="testimonial-avatar" aria-hidden="true">{item.name.charAt(0)}</div>
                      <div>
                        <h3 className="h6 fw-bold mb-0">{item.name}</h3>
                        <p className="text-muted small mb-0">
                          {lang === 'en' ? item.roleEn : item.roleSw} · {item.country}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="employer-section landing-section py-5" id="employers">
          <div className="employer-pattern" aria-hidden="true" />
          <div className="container position-relative">
            <div className="row gy-4 align-items-center">
              <div className="col-lg-6">
                <p className="section-eyebrow text-uppercase fw-semibold mb-2 text-white opacity-75">{page.navEmployers}</p>
                <h2 className="section-title fw-bold text-white">{page.employerTitle}</h2>
                <p className="mb-4 opacity-90">{page.employerSubtitle}</p>
                <ul className="list-unstyled lh-lg employer-list">
                  <li>✓ {page.employerBullet1}</li>
                  <li>✓ {page.employerBullet2}</li>
                  <li>✓ {page.employerBullet3}</li>
                </ul>
              </div>
              <div className="col-lg-6">
                <div className="card bg-white text-dark border-0 shadow-lg rounded-4">
                  <div className="card-body p-4 p-lg-5">
                    <h3 className="h4 fw-bold mb-3">{page.ctaTitle}</h3>
                    <div className="d-grid gap-2">
                      <button className="btn btn-warning btn-lg fw-semibold rounded-pill">{page.ctaButtonJobSeeker}</button>
                      <Link to="/login" className="btn btn-outline-warning btn-lg fw-semibold rounded-pill">{page.ctaButtonEmployer}</Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials section removed as requested — replaced by Proven Results */}

        <section className="landing-section job-alerts-section py-5" id="job-alerts">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="card border-0 shadow-lg job-alerts-card rounded-4 overflow-hidden">
                  <div className="card-body p-4 p-lg-5 text-center">
                    {alertSubscribeSuccess ? (
                      <JobAlertSuccessBox
                        page={page}
                        status={alertSuccessStatus}
                        onDone={() => {
                          setAlertSubscribeSuccess(false);
                          setAlertSuccessStatus('subscribed');
                        }}
                      />
                    ) : (
                      <>
                        <p className="section-eyebrow text-uppercase fw-semibold mb-2">{page.jobAlertsTitle}</p>
                        <h2 className="section-title fw-bold mb-3">{page.jobAlertsTitle}</h2>
                        <p className="text-muted mb-4">{page.jobAlertsSubtitle}</p>
                        <form className="job-alerts-form" onSubmit={handleJobAlertSubscribe} noValidate autoComplete="off">
                          <div className="row g-2 justify-content-center">
                            <div className="col-md-8">
                              <label className="visually-hidden" htmlFor="job-alert-email">{page.jobAlertsPlaceholder}</label>
                              <input
                                id="job-alert-email"
                                name="sjk-job-alert-email"
                                type="text"
                                inputMode="email"
                                className="form-control form-control-lg search-input"
                                placeholder={page.jobAlertsPlaceholder}
                                value={alertEmail}
                                onChange={(event) => setAlertEmail(event.target.value)}
                                onFocus={(event) => event.target.removeAttribute('readonly')}
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="none"
                                spellCheck={false}
                                data-lpignore="true"
                                data-1p-ignore="true"
                                readOnly
                                required
                              />
                            </div>
                            <div className="col-md-4 d-grid">
                              <button
                                type="submit"
                                className="btn btn-warning btn-lg fw-semibold rounded-pill"
                                disabled={alertLoading}
                              >
                                {alertLoading ? '...' : page.jobAlertsButton}
                              </button>
                            </div>
                          </div>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-section container py-5" id="help">
            <div className="section-header text-center mx-auto mb-5">
              <p className="section-eyebrow text-uppercase fw-semibold mb-2">{page.faqTitle}</p>
              <h2 className="section-title display-6 fw-bold mb-0">{page.faqSubtitle}</h2>
              <div className="section-title-line mx-auto mt-3" />
            </div>
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="accordion faq-accordion" id="faqAccordion">
                  {[
                    { id: 'faq1', q: page.faq1Q, a: page.faq1A },
                    { id: 'faq2', q: page.faq2Q, a: page.faq2A },
                    { id: 'faq3', q: page.faq3Q, a: page.faq3A },
                    { id: 'faq4', q: page.faq4Q, a: page.faq4A },
                    { id: 'faq5', q: page.faq5Q, a: page.faq5A },
                  ].map((faq, idx) => (
                    <div className="accordion-item border-0 shadow-sm mb-3 rounded-3 overflow-hidden" key={faq.id}>
                      <h3 className="accordion-header">
                        <button
                          className={`accordion-button fw-semibold${idx !== 0 ? ' collapsed' : ''}`}
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#${faq.id}`}
                          aria-expanded={idx === 0}
                          aria-controls={faq.id}
                        >
                          {faq.q}
                        </button>
                      </h3>
                      <div id={faq.id} className={`accordion-collapse collapse${idx === 0 ? ' show' : ''}`} data-bs-parent="#faqAccordion">
                        <div className="accordion-body text-muted">{faq.a}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-top py-5">
          <div className="container">
            <div className="row g-4">
              <div className="col-lg-4">
                <h5 className="fw-bold text-white mb-3">
                  <span className="brand-icon me-2">SJ</span>
                  {page.brand}
                </h5>
                <p className="footer-tagline mb-4">{page.footerTagline}</p>
                <div className="social-links d-flex gap-2">
                  <a href="https://www.facebook.com/SmartJobKenya" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Facebook" data-label="Facebook">
                    <span className="social-icon">f</span>
                  </a>
                  <a href="https://x.com/SmartJobKenya" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="X" data-label="X">
                    <span className="social-icon">X</span>
                  </a>
                  <a href="https://www.instagram.com/SmartJobKenya" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Instagram" data-label="Instagram">
                    <span className="social-icon instagram-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <rect x="4" y="4" width="16" height="16" rx="5" ry="5" stroke="currentColor" strokeWidth="2" fill="none" />
                        <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="2" fill="none" />
                        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                      </svg>
                    </span>
                  </a>
                  <a href="https://www.linkedin.com/company/smartjobkenya" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="LinkedIn" data-label="LinkedIn">
                    <span className="social-icon">in</span>
                  </a>
                </div>
              </div>

              <div className="col-6 col-md-4 col-lg-2">
                <h6 className="footer-heading text-white fw-semibold mb-3">{page.footerJobs}</h6>
                <ul className="list-unstyled footer-links">
                  <li><a href="#jobs">{page.footerJobs}</a></li>
                  <li><a href="#jobs">{page.footerCategories}</a></li>
                  <li><a href="#how-it-works">{page.navHow}</a></li>
                </ul>
              </div>

              <div className="col-6 col-md-4 col-lg-2">
                <h6 className="footer-heading text-white fw-semibold mb-3">{page.footerCompanies}</h6>
                <ul className="list-unstyled footer-links">
                  <li><a href="#employers">{page.footerCompanies}</a></li>
                  <li><a href="#">{page.footerAbout}</a></li>
                  <li><a href="#">{page.footerContact}</a></li>
                </ul>
              </div>

              <div className="col-6 col-md-4 col-lg-2">
                <h6 className="footer-heading text-white fw-semibold mb-3">{page.navHelp}</h6>
                <ul className="list-unstyled footer-links">
                  <li><a href="#help">{page.footerHelp}</a></li>
                  <li><a href="#">{page.footerPrivacy}</a></li>
                  <li><a href="#">{page.footerTerms}</a></li>
                  <li><a href="#">{page.footerCookies}</a></li>
                </ul>
              </div>

              <div className="col-lg-2">
                <h6 className="footer-heading text-white fw-semibold mb-3">{page.langEnglish} / {page.langSwahili}</h6>
                <div className="d-flex flex-column gap-2">
                  <button type="button" className={`btn btn-sm ${lang === 'en' ? 'btn-warning' : 'btn-outline-light'} rounded-pill`} onClick={() => selectLanguage('en')}>
                    {page.langEnglish}
                  </button>
                  <button type="button" className={`btn btn-sm ${lang === 'sw' ? 'btn-warning' : 'btn-outline-light'} rounded-pill`} onClick={() => selectLanguage('sw')}>
                    {page.langSwahili}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom py-3">
          <div className="container">
            <div className="row align-items-center gy-2">
              <div className="col-12 text-center text-md-start">
                <p className="mb-0 small footer-copyright">
                  © {currentYear} {page.brand}. {page.footerRights}
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <JobDetailsModal
        jobId={selectedJobId}
        open={selectedJobId !== null}
        onClose={() => {
          setSelectedJobId(null);
          setOpenApplyOnSelect(false);
        }}
        categoryLabel={categoryLabel}
        session={session?.role === 'seeker' ? session : null}
        autoOpenApply={openApplyOnSelect}
        onRequireLogin={handleRequireLogin}
      />
    </div>
  );
}

export default LandingPage;
