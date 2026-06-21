export function getDashboardPath(role) {
  if (role === 'admin') return '/admin-dashboard';
  return role === 'employer' ? '/employer-dashboard' : '/job-seeker-dashboard';
}
