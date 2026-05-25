export function normalizeHeaderValue(value: string) {
  return value.replace(/\s{2,}/g, ' ').trim();
}

export function buildContentSecurityPolicy(nonce: string, isDevelopment: boolean) {
  return normalizeHeaderValue(`
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ''};
    style-src 'self' ${isDevelopment ? "'unsafe-inline'" : `'nonce-${nonce}'`};
    style-src-attr 'unsafe-inline';
    img-src 'self' data: blob: https:;
    font-src 'self' data:;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://generativelanguage.googleapis.com;
    frame-src 'self' blob:;
    worker-src 'self' blob:;
    media-src 'self' blob:;
    manifest-src 'self';
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    ${isDevelopment ? '' : 'upgrade-insecure-requests;'}
  `);
}

export const securityHeaders = [
  ['X-Content-Type-Options', 'nosniff'],
  ['X-Frame-Options', 'DENY'],
  ['Referrer-Policy', 'strict-origin-when-cross-origin'],
  ['Cross-Origin-Opener-Policy', 'same-origin'],
  ['Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload'],
  ['Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()'],
] as const;
