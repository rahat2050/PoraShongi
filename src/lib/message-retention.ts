export const MESSAGE_RETENTION_HOURS = 48;
export const MESSAGE_RETENTION_MS = MESSAGE_RETENTION_HOURS * 60 * 60 * 1000;

export function isMessageWithinRetention(
  createdAt: string,
  now = Date.now(),
): boolean {
  const createdTime = new Date(createdAt).getTime();
  return Number.isFinite(createdTime) && createdTime >= now - MESSAGE_RETENTION_MS;
}
