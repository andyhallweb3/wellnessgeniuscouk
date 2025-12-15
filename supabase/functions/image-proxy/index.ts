import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple in-memory cache for the function instance lifetime
const imageCache = new Map<string, { data: ArrayBuffer; contentType: string; timestamp: number }>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    // Check in-memory cache
    const cached = imageCache.get(imageUrl);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      console.log(`Cache hit for: ${imageUrl.substring(0, 80)}...`);
      return new Response(cached.data, {
        headers: {
          ...corsHeaders,
          'Content-Type': cached.contentType,
          'Cache-Control': 'public, max-age=86400', // 24 hours client cache
          'X-Proxy-Cache': 'HIT',
        },
      });
    }

    console.log(`Fetching image: ${imageUrl.substring(0, 80)}...`);

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

    // Store in cache (only if reasonable size, < 1MB)
    if (arrayBuffer.byteLength < 1024 * 1024) {
      imageCache.set(imageUrl, {
        data: arrayBuffer,
        contentType,
        timestamp: Date.now(),
      });
      
      // Evict old entries if cache gets too large
      if (imageCache.size > 100) {
        const oldest = [...imageCache.entries()]
          .sort((a, b) => a[1].timestamp - b[1].timestamp)
          .slice(0, 20);
        oldest.forEach(([key]) => imageCache.delete(key));
      }
    }

    console.log(`Successfully proxied image: ${arrayBuffer.byteLength} bytes`);

    return new Response(arrayBuffer, {
      headers: {
        ...corsHeaders,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // 24 hours
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
