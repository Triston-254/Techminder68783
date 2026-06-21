export function buildJobShareUrl(jobId) {
  const url = new URL(window.location.origin);
  url.pathname = '/';
  url.searchParams.set('job', String(jobId));
  return url.toString();
}

export function buildJobShareText(job) {
  const parts = [job.title];
  if (job.location) parts.push(job.location);
  if (job.pay) parts.push(job.pay);
  return parts.join(' · ');
}

export async function shareJob(job, page) {
  const url = buildJobShareUrl(job.id);
  const text = buildJobShareText(job);
  const payload = `${text}\n${url}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: job.title,
        text: payload,
        url,
      });
      return 'shared';
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled';
    }
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(payload);
    return 'copied';
  }

  throw new Error(page.shareJobFailed);
}
