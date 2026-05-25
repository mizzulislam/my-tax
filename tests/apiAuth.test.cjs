const test = require('node:test');
const assert = require('node:assert/strict');
const { ApiAuthError, getBearerToken, requireBearerToken } = require('../.test-build/lib/apiAuth.js');

function headers(value) {
  return {
    get(name) {
      if (name.toLowerCase() === 'authorization') {
        return value;
      }
      return null;
    },
  };
}

test('getBearerToken returns token from valid Bearer header', () => {
  assert.equal(getBearerToken(headers('Bearer abc.def.ghi')), 'abc.def.ghi');
});

test('getBearerToken rejects missing or malformed authorization headers', () => {
  assert.equal(getBearerToken(headers(null)), null);
  assert.equal(getBearerToken(headers('Basic abc')), null);
  assert.equal(getBearerToken(headers('Bearer')), null);
});

test('requireBearerToken throws a 401 ApiAuthError when Bearer token is absent', () => {
  assert.throws(
    () => requireBearerToken(headers('Basic abc')),
    (error) => error instanceof ApiAuthError && error.status === 401
  );
});
