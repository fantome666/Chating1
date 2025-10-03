export function formatDistanceToNow(date: string): string {
  const now = new Date();
  const then = new Date(date);
  const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (seconds < 60) {
    return 'à l\'instant';
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `il y a ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `il y a ${hours}h`;
  }

  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `il y a ${days}j`;
  }

  return then.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short'
  });
}
