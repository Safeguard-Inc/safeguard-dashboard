/**
 * securityHeaders.ts
 *
 * Canonical HTTP security header policy for Safeguard Dashboard (Issue #62).
 * Configures Content-Security-Policy (CSP), X-Frame-Options, Referrer-Policy,
 * X-Content-Type-Options, and Permissions-Policy for Next.js / Vercel deployments.
 */

export interface SecurityHeaderEntry {
  key: string;
  value: string;
}

export interface RouteSecurityHeaderRule {
  source: string;
  headers: SecurityHeaderEntry[];
}

export const CSP_DIRECTIVES: Record<string, string[]> = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'blob:', 'https:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': [
    "'self'",
    'https://soroban-testnet.stellar.org',
    'https://horizon-testnet.stellar.org',
    'https://horizon.stellar.org',
    'https://*.stellar.org',
    'http://localhost:4000',
  ],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'object-src': ["'none'"],
};

/**
 * Serializes a CSP directive map into a single HTTP header value string.
 */
export function buildContentSecurityPolicy(
  directives: Record<string, string[]> = CSP_DIRECTIVES
): string {
  return Object.entries(directives)
    .filter(([, sources]) => sources.length > 0)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
}

export const SECURITY_HEADERS: SecurityHeaderEntry[] = [
  {
    key: 'Content-Security-Policy',
    value: buildContentSecurityPolicy(),
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
];

/**
 * Returns the Next.js route header configuration applying security headers globally.
 */
export function getNextSecurityHeaderRules(): RouteSecurityHeaderRule[] {
  return [
    {
      source: '/(.*)',
      headers: SECURITY_HEADERS,
    },
  ];
}
