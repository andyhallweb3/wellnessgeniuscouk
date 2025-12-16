import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BUCKET_NAME = 'image-cache';
const CACHE_MAX_AGE_DAYS = 7;

// Generate a deterministic filename from URL
async function hashUrl(url: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(url);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getExtension(contentType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
  };
  return map[contentType] || 'jpg';
}

// SSRF protection: validate URLs before fetching
function isAllowedUrl(urlString: string): { allowed: boolean; reason?: string } {
  const url = new URL(urlString);
  
  // Block non-HTTP(S) protocols
  if (!['http:', 'https:'].includes(url.protocol)) {
    return { allowed: false, reason: 'Invalid protocol' };
  }
  
  // Block cloud metadata endpoints
  const blockedHosts = [
    '169.254.169.254',        // AWS/Azure metadata
    '169.254.170.2',          // AWS ECS metadata  
    'metadata.google.internal', // GCP metadata
    'metadata',
  ];
  
  if (blockedHosts.some(blocked => url.hostname === blocked || url.hostname.endsWith('.' + blocked))) {
    return { allowed: false, reason: 'Blocked hostname' };
  }
  
  // Block private IP ranges
  const hostname = url.hostname;
  const privateIPv4Patterns = [
    /^10\./,                    // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./,              // 192.168.0.0/16
    /^127\./,                   // 127.0.0.0/8 (loopback)
    /^0\./,                     // 0.0.0.0/8
    /^169\.254\./,              // 169.254.0.0/16 (link-local)
  ];
  
  if (privateIPv4Patterns.some(pattern => pattern.test(hostname))) {
    return { allowed: false, reason: 'Private IP address not allowed' };
  }
  
  // Block localhost variants
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    return { allowed: false, reason: 'Localhost not allowed' };
  }
  
  return { allowed: true };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const imageUrl = url.searchParams.get('url');

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing url parameter' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(imageUrl);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Invalid protocol');
      }
    } catch {
      return new Response(
        JSON.stringify({ error: 'Invalid URL' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // SSRF protection: validate destination before fetching
    const validation = isAllowedUrl(imageUrl);
    if (!validation.allowed) {
      console.warn(`Blocked SSRF attempt: ${imageUrl.substring(0, 80)} - ${validation.reason}`);
      return new Response(
        JSON.stringify({ error: validation.reason || 'URL not allowed' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate hash-based filename
    const urlHash = await hashUrl(imageUrl);

    // Check if image exists in storage cache
    const { data: existingFiles } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', { search: urlHash, limit: 1 });

    if (existingFiles && existingFiles.length > 0) {
      const cachedFile = existingFiles[0];
      
      // Check if cache is still fresh (within CACHE_MAX_AGE_DAYS)
      const createdAt = new Date(cachedFile.created_at);
      const ageMs = Date.now() - createdAt.getTime();
      const maxAgeMs = CACHE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;

      if (ageMs < maxAgeMs) {
        // Return redirect to cached file
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${cachedFile.name}`;
        console.log(`Cache HIT: ${imageUrl.substring(0, 60)}... -> ${cachedFile.name}`);
        
        return new Response(null, {
          status: 302,
          headers: {
            ...corsHeaders,
            'Location': publicUrl,
            'Cache-Control': 'public, max-age=86400',
            'X-Proxy-Cache': 'HIT',
          },
        });
      } else {
        // Cache expired, delete old file
        console.log(`Cache EXPIRED: ${cachedFile.name}`);
        await supabase.storage.from(BUCKET_NAME).remove([cachedFile.name]);
      }
    }

    console.log(`Cache MISS, fetching: ${imageUrl.substring(0, 80)}...`);

    // Fetch the image with browser-like headers to avoid hotlink blocking
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Referer': parsedUrl.origin + '/',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`Failed to fetch image: ${response.status} ${response.statusText}`);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch image', status: response.status }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const contentType = response.headers.get('Content-Type') || 'image/jpeg';
    
    // Verify it's actually an image
    if (!contentType.startsWith('image/')) {
      return new Response(
        JSON.stringify({ error: 'URL does not point to an image' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const arrayBuffer = await response.arrayBuffer();

    // Limit image size (max 5MB)
    if (arrayBuffer.byteLength > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: 'Image too large' }),
        { status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Store in Supabase Storage
    const extension = getExtension(contentType);
    const fileName = `${urlHash}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, arrayBuffer, {
        contentType,
        upsert: true,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      // Still return the image even if caching failed
    } else {
      console.log(`Cached to storage: ${fileName} (${arrayBuffer.byteLength} bytes)`);
    }

    // Return the image directly
    return new Response(arrayBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
        'X-Proxy-Cache': 'MISS',
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn('Image fetch timeout');
      return new Response(
        JSON.stringify({ error: 'Request timeout' }),
        { status: 504, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.error('Image proxy error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
