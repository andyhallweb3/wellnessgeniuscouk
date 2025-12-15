import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const BUCKET_NAME = 'image-cache';
const CACHE_MAX_AGE_DAYS = 7;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting image cache cleanup...');

    // List all files in the bucket
    const { data: files, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', { limit: 1000 });

    if (listError) {
      console.error('Error listing files:', listError);
      return new Response(
        JSON.stringify({ error: 'Failed to list cached files', details: listError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!files || files.length === 0) {
      console.log('No files in cache bucket');
      return new Response(
        JSON.stringify({ success: true, deleted: 0, message: 'Cache is empty' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const now = Date.now();
    const maxAgeMs = CACHE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
    const expiredFiles: string[] = [];

    for (const file of files) {
      if (!file.created_at) continue;
      
      const createdAt = new Date(file.created_at).getTime();
      const ageMs = now - createdAt;

      if (ageMs > maxAgeMs) {
        expiredFiles.push(file.name);
      }
    }

    if (expiredFiles.length === 0) {
      console.log(`No expired files found (checked ${files.length} files)`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          deleted: 0, 
          checked: files.length,
          message: 'No expired files' 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${expiredFiles.length} expired files to delete`);

    // Delete expired files in batches
    const batchSize = 100;
    let totalDeleted = 0;

    for (let i = 0; i < expiredFiles.length; i += batchSize) {
      const batch = expiredFiles.slice(i, i + batchSize);
      const { error: deleteError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove(batch);

      if (deleteError) {
        console.error(`Error deleting batch ${i / batchSize + 1}:`, deleteError);
      } else {
        totalDeleted += batch.length;
        console.log(`Deleted batch ${i / batchSize + 1}: ${batch.length} files`);
      }
    }

    console.log(`Cleanup complete: deleted ${totalDeleted} of ${expiredFiles.length} expired files`);

    return new Response(
      JSON.stringify({
        success: true,
        deleted: totalDeleted,
        checked: files.length,
        expired: expiredFiles.length,
        message: `Cleaned up ${totalDeleted} expired cached images`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Cleanup error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
