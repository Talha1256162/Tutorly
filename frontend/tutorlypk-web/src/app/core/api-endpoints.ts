const localApiOrigin = 'http://localhost:5101';

export function apiUrl(path: string): string {
  return `${resolveApiOrigin()}${path}`;
}

function resolveApiOrigin(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  const isAngularDevServer =
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') &&
    window.location.port === '4200';

  return isAngularDevServer ? localApiOrigin : '';
}
