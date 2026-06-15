export function getDashboardPath(role) {
  return role === 'employer' ? '/employer-dashboard' : '/job-seeker-dashboard';
}
