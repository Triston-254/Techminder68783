import { useSessionInactivity } from '../hooks/useSessionInactivity';

function SessionInactivityGuard() {
  useSessionInactivity();
  return null;
}

export default SessionInactivityGuard;
