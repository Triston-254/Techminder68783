import { jobsAPI } from './api';

export const COUNTIES = [
  'Baringo',
  'Bomet',
  'Bungoma',
  'Busia',
  'Elgeyo-Marakwet',
  'Embu',
  'Garissa',
  'Homa Bay',
  'Isiolo',
  'Kajiado',
  'Kakamega',
  'Kericho',
  'Kiambu',
  'Kilifi',
  'Kirinyaga',
  'Kisii',
  'Kisumu',
  'Kitui',
  'Kwale',
  'Laikipia',
  'Lamu',
  'Machakos',
  'Makueni',
  'Mandera',
  'Marsabit',
  'Meru',
  'Migori',
  'Mombasa',
  'Murang\'a',
  'Nairobi',
  'Nakuru',
  'Nandi',
  'Narok',
  'Nyamira',
  'Nyandarua',
  'Nyeri',
  'Samburu',
  'Siaya',
  'Taita-Taveta',
  'Tana River',
  'Tharaka-Nithi',
  'Trans Nzoia',
  'Turkana',
  'Uasin Gishu',
  'Vihiga',
  'Wajir',
  'West Pokot',
];

export const JOB_TYPES = [
  { key: 'daily', en: 'Daily pay', sw: 'Malipo ya kila siku' },
  { key: 'hourly', en: 'Hourly', sw: 'Kwa saa' },
  { key: 'part-time', en: 'Part-time', sw: 'Sehemu ya muda' },
  { key: 'full-time', en: 'Full-time', sw: 'Muda wote' },
  { key: 'contract', en: 'Contract', sw: 'Kandarasi' },
];

export async function getAllJobs() {
  const result = await jobsAPI.list();
  if (!result.success) {
    throw new Error(result.message || 'Failed to load jobs');
  }
  return result.jobs;
}

export async function getJobsByEmployer() {
  const result = await jobsAPI.myJobs();
  if (!result.success) {
    throw new Error(result.message || 'Failed to load your jobs');
  }
  return result.jobs;
}

export async function postJob(jobData) {
  const result = await jobsAPI.create(jobData);
  if (!result.success) {
    throw new Error(result.message || 'Failed to post job');
  }
  return result.job;
}

export async function updateJob(jobId, jobData) {
  const result = await jobsAPI.update({ id: jobId, ...jobData });
  if (!result.success) {
    throw new Error(result.message || 'Failed to update job');
  }
  return result.job;
}

export async function closeJob(jobId) {
  const result = await jobsAPI.close(jobId);
  if (!result.success) {
    throw new Error(result.message || 'Failed to close job');
  }
  return result.job;
}

export async function deleteJob(jobId) {
  const result = await jobsAPI.delete(jobId);
  if (!result.success) {
    throw new Error(result.message || 'Failed to delete job');
  }
}

export async function reactToJob(jobId, reaction) {
  const result = await jobsAPI.react({ id: jobId, reaction });
  if (!result.success) {
    throw new Error(result.message || 'Failed to react to job');
  }
  return {
    likeCount: result.likeCount,
    dislikeCount: result.dislikeCount,
    userReaction: result.userReaction,
  };
}

export async function getJobById(jobId) {
  const result = await jobsAPI.get(jobId);
  if (!result.success) {
    throw new Error(result.message || 'Failed to load job');
  }
  return result.job;
}

export async function toggleSaveJob(jobId) {
  const result = await jobsAPI.toggleSave(jobId);
  if (!result.success) {
    throw new Error(result.message || 'Failed to save job');
  }
  return {
    isSaved: result.isSaved,
    message: result.message,
  };
}

export async function getSavedJobs() {
  const result = await jobsAPI.savedJobs();
  if (!result.success) {
    throw new Error(result.message || 'Failed to load saved jobs');
  }
  return result.jobs;
}

export async function applyToJob(jobId, message) {
  const result = await jobsAPI.apply({ id: jobId, message });
  if (!result.success) {
    throw new Error(result.message || 'Failed to submit application');
  }
  return result.application;
}

export async function getMyApplications() {
  const result = await jobsAPI.myApplications();
  if (!result.success) {
    throw new Error(result.message || 'Failed to load applications');
  }
  return result.applications;
}

export async function getJobApplicants(jobId) {
  const result = await jobsAPI.jobApplicants(jobId);
  if (!result.success) {
    throw new Error(result.message || 'Failed to load applicants');
  }
  return result;
}

export async function updateApplicationStatus(applicationId, status) {
  const result = await jobsAPI.updateApplicationStatus({ applicationId, status });
  if (!result.success) {
    throw new Error(result.message || 'Failed to update application status');
  }
  return result;
}

export function countApplyWords(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).filter(Boolean).length;
}

export const MIN_APPLY_WORDS = 15;

export async function withdrawApplication(jobId) {
  const result = await jobsAPI.withdrawApplication(jobId);
  if (!result.success) {
    throw new Error(result.message || 'Failed to withdraw application');
  }
  return result;
}

export function applicationStatusLabel(status, page) {
  const labels = {
    pending: page.applicationStatusPending,
    viewed: page.applicationStatusViewed,
    contacted: page.applicationStatusContacted,
  };
  return labels[status] || status;
}

export async function getPlatformStats() {
  const result = await jobsAPI.stats();
  if (!result.success) {
    throw new Error(result.message || 'Failed to load stats');
  }
  return result.stats;
}

export function formatStatCount(value, options = {}) {
  const { plus = true, compact = false } = options;
  const num = Number(value || 0);

  let formatted;
  if (compact && num >= 1000) {
    if (num >= 1000000) {
      formatted = `${Math.floor(num / 1000000)}M`;
    } else {
      formatted = `${Math.floor(num / 1000)}K`;
    }
  } else {
    formatted = num.toLocaleString();
  }

  return plus ? `${formatted}+` : formatted;
}

export function formatJobPostedAt(value, lang = 'en') {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) return lang === 'sw' ? 'sasa hivi' : 'just now';

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (lang === 'sw') {
    if (minutes < 1) return 'sasa hivi';
    if (minutes < 60) return minutes === 1 ? 'dakika 1 iliyopita' : `dakika ${minutes} zilizopita`;
    if (hours < 24) return hours === 1 ? 'saa 1 iliyopita' : `saa ${hours} zilizopita`;
    if (days < 7) return days === 1 ? 'siku 1 iliyopita' : `siku ${days} zilizopita`;
    if (weeks < 5) return weeks === 1 ? 'wiki 1 iliyopita' : `wiki ${weeks} zilizopita`;
    if (months < 12) return months === 1 ? 'mwezi 1 uliopita' : `miezi ${months} iliyopita`;
    return years === 1 ? 'mwaka 1 uliopita' : `miaka ${years} iliyopita`;
  }

  if (minutes < 1) return 'just now';
  if (minutes < 60) return minutes === 1 ? '1 min ago' : `${minutes} mins ago`;
  if (hours < 24) return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  if (days < 7) return days === 1 ? '1 day ago' : `${days} days ago`;
  if (weeks < 5) return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  if (months < 12) return months === 1 ? '1 month ago' : `${months} months ago`;
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

export function filterJobs(jobs, { keyword = '', location = '', category = '' } = {}) {
  const query = keyword.trim().toLowerCase();
  const place = location.trim().toLowerCase();
  const categoryFilter = category.trim().toLowerCase();

  return jobs.filter((job) => {
    const matchesKeyword = !query || [
      job.title,
      job.category,
      job.description,
      job.employerName,
    ].some((field) => (field || '').toLowerCase().includes(query));

    const matchesLocation = !place || (job.location || '').toLowerCase().includes(place);
    const matchesCategory = !categoryFilter || (job.category || '').toLowerCase().includes(categoryFilter);
    return matchesKeyword && matchesLocation && matchesCategory;
  });
}
