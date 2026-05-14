/**
 * Whether the signed-in user has any cloud workspace (upgraded personal or
 * team membership). Cloud overrides this; community always returns false.
 */
export const useHasWorkspace = (): boolean => false;
