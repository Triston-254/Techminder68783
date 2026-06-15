import { useRoleSession } from './useRoleSession';

export function useEmployerSession() {
  return useRoleSession('employer');
}
