export function isReliableImageUrl(url?: string | null): boolean {
  if (!url?.trim()) {
    return false;
  }

  if (url.startsWith('data:image/')) {
    return true;
  }

  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.hostname !== 'images.unsplash.com';
  } catch {
    return false;
  }
}

export function initialsFromName(name?: string | null): string {
  const initials = (name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase())
    .join('');

  return initials || 'M';
}
