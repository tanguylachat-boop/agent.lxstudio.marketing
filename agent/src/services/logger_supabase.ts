import axios from 'axios';

export interface LogEntry {
  timestamp: string;
  hook: string;
  variant: 'A' | 'B';
  platform: string;
  postUrl?: string;
  postId?: string;
  success: boolean;
  error?: string;
  hashtags: string[];
  cta: string;
}

export async function logToSupabase(entry: LogEntry): Promise<void> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase credentials not set, skipping log');
    return;
  }

  try {
    await axios.post(
      `${supabaseUrl}/rest/v1/content_logs`,
      {
        timestamp: entry.timestamp,
        hook: entry.hook,
        variant: entry.variant,
        platform: entry.platform,
        post_url: entry.postUrl,
        post_id: entry.postId,
        success: entry.success,
        error: entry.error,
        hashtags: entry.hashtags,
        cta: entry.cta
      },
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        timeout: 10000
      }
    );

    console.log('✅ Logged to Supabase');
  } catch (error: any) {
    console.error('❌ Supabase logging failed:', error.message);
  }
}

export async function getTopHooks(limit: number = 10): Promise<string[]> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase credentials not set, returning empty hooks');
    return [];
  }

  try {
    const response = await axios.get(
      `${supabaseUrl}/rest/v1/rpc/get_top_hooks`,
      {
        params: { hook_limit: limit },
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        timeout: 10000
      }
    );

    const hooks = response.data.map((row: any) => row.hook);
    console.log(`📊 Top ${limit} hooks from Supabase:`, hooks);
    return hooks;
  } catch (error: any) {
    console.error('❌ Failed to fetch top hooks from Supabase:', error.message);
    return [];
  }
}
