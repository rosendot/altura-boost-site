export function timeAgo(timestamp: string): string {
  const now = new Date();
  const past = new Date(timestamp);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (seconds < 60) {
    return `${seconds}s ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function isJobNew(timestamp: string, thresholdMinutes: number = 5): boolean {
  const now = new Date();
  const past = new Date(timestamp);
  const minutes = Math.floor((now.getTime() - past.getTime()) / 1000 / 60);
  return minutes < thresholdMinutes;
}
