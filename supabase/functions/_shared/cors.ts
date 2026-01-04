// Shared CORS configuration for all edge functions
// Restricts origins to known application domains for defense-in-depth

const ALLOWED_ORIGINS = [
  'https://wellnessgenius.co.uk',
  'https://www.wellnessgenius.co.uk',
  'https://wellnessgenius.lovable.app',
  // Development origins
  'http://localhost:5173',
  'http://localhost:8080',
  'http://localhost:3000',
];

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;

  // Exact allowlist (prod + local dev)
  if (ALLOWED_ORIGINS.includes(origin)) return true;

  // Allow Lovable hosted domains (preview + production)
  // - *.lovable.app (custom project domains)
  // - *.lovableproject.com (editor preview domains)
  if (origin.endsWith('.lovable.app')) return true;
  if (origin.endsWith('.lovableproject.com')) return true;

  return false;
}

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const allowed = isAllowedOrigin(origin);

  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

// Helper to create CORS headers from origin string directly
export function getCorsHeadersFromOrigin(origin: string | null): Record<string, string> {
  const originStr = origin || '';
  const allowed = isAllowedOrigin(originStr);

  return {
    'Access-Control-Allow-Origin': allowed ? originStr : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
}

// Static fallback for backwards compatibility - uses first allowed origin as default
export const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

