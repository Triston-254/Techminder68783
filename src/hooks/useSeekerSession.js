import { useRoleSession } from './useRoleSession';

export function useSeekerSession() {
  return useRoleSession('seeker');
}
