export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'idx_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
}