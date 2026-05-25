export class ApiAuthError extends Error {
  readonly status = 401;

  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'ApiAuthError';
  }
}

type HeaderReader = {
  get(name: string): string | null;
};

export function getBearerToken(headers: HeaderReader): string | null {
  const header = headers.get('authorization') || headers.get('Authorization');
  if (!header) {
    return null;
  }

  const [scheme, ...tokenParts] = header.trim().split(/\s+/);
  const token = tokenParts.join(' ');

  if (scheme?.toLowerCase() !== 'bearer' || !token) {
    return null;
  }

  return token;
}

export function requireBearerToken(headers: HeaderReader): string {
  const token = getBearerToken(headers);
  if (!token) {
    throw new ApiAuthError('Bearer token wajib dikirim.');
  }
  return token;
}
