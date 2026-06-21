import { useRoleSession } from './useRoleSession';

export function useAdminSession() {
  return useRoleSession('admin');
}
