/**
 * JWT Token Utilities for Client-Side Simulation & Session Management
 * Generates realistic 3-part Base64Url JWT tokens: header.payload.signature
 */

function base64UrlEncode(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str) {
  let output = str.replace(/-/g, '+').replace(/_/g, '/');
  while (output.length % 4) {
    output += '=';
  }
  return decodeURIComponent(escape(atob(output)));
}

/**
 * Creates a structured mock JWT token
 */
export function createMockJwt(payloadData = {}, expiresInSeconds = 3600) {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: 'flin-auth-service',
    sub: payloadData.id || `usr_${Math.random().toString(36).substring(2, 9)}`,
    email: payloadData.email || 'developer@flin.io',
    displayName: payloadData.displayName || 'Alex Mercer',
    role: payloadData.role || 'Frontend Architect',
    permissions: payloadData.permissions || ['read:dashboard', 'write:tasks', 'manage:cart'],
    iat: now,
    exp: now + expiresInSeconds,
    jti: 'jwt_' + Math.random().toString(36).substring(2, 10)
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = base64UrlEncode(`mock_sig_${payload.sub}_${payload.exp}`);

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Decodes a JWT token without verifying signature (standard client-side behavior)
 */
export function decodeJwt(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const header = JSON.parse(base64UrlDecode(parts[0]));
    const payload = JSON.parse(base64UrlDecode(parts[1]));

    return { header, payload, rawSignature: parts[2] };
  } catch (err) {
    console.warn('[JWT] Failed to decode token:', err);
    return null;
  }
}

/**
 * Checks if a JWT token is expired
 */
export function isTokenExpired(token) {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.payload || !decoded.payload.exp) {
    return true;
  }
  const now = Math.floor(Date.now() / 1000);
  return decoded.payload.exp <= now;
}

/**
 * Returns remaining seconds before token expires (or 0 if expired/invalid)
 */
export function getTokenRemainingSeconds(token) {
  const decoded = decodeJwt(token);
  if (!decoded || !decoded.payload || !decoded.payload.exp) {
    return 0;
  }
  const now = Math.floor(Date.now() / 1000);
  const diff = decoded.payload.exp - now;
  return diff > 0 ? diff : 0;
}
