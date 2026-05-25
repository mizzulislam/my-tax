const test = require('node:test');
const assert = require('node:assert/strict');
const { buildContentSecurityPolicy } = require('../.test-build/lib/securityHeaders.js');

test('production CSP uses nonce and removes unsafe script allowances', () => {
  const csp = buildContentSecurityPolicy('abc123', false);

  assert.match(csp, /script-src 'self' 'nonce-abc123' 'strict-dynamic'/);
  assert.match(csp, /style-src 'self' 'nonce-abc123'/);
  assert.match(csp, /style-src-attr 'unsafe-inline'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /upgrade-insecure-requests/);
  assert.doesNotMatch(csp, /unsafe-eval/);
  assert.doesNotMatch(csp, /script-src[^;]*unsafe-inline/);
});

test('development CSP keeps eval and inline style allowances for Next dev runtime', () => {
  const csp = buildContentSecurityPolicy('devnonce', true);

  assert.match(csp, /unsafe-eval/);
  assert.match(csp, /style-src 'self' 'unsafe-inline'/);
  assert.doesNotMatch(csp, /upgrade-insecure-requests/);
});
