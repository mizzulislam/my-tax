import { createScopedServerClient } from '@/lib/adminServer';

export const RATE_LIMIT_WINDOW_SECONDS = 60;
export const RATE_LIMIT_MAX = 10;

export type RateLimitResult = {
  allowed: boolean;
  retry_after: number;
  remaining: number;
  reset_at: string;
};

export async function consumeChatRateLimit(
  supabase: ReturnType<typeof createScopedServerClient>,
  payload: {
    userId: string;
    ipAddress: string;
  }
) {
  const rateKey = `api:chat:${payload.userId}:${payload.ipAddress || 'unknown'}`;
  const { data, error } = await supabase.rpc('consume_rate_limit', {
    p_key: rateKey,
    p_user_id: payload.userId,
    p_endpoint: 'api:chat',
    p_limit: RATE_LIMIT_MAX,
    p_window_seconds: RATE_LIMIT_WINDOW_SECONDS,
  });

  if (error) {
    throw new Error(error.message || 'Rate limiter database tidak tersedia.');
  }

  const result = Array.isArray(data) ? data[0] : data;
  if (!result) {
    throw new Error('Rate limiter tidak mengembalikan hasil.');
  }

  return result as RateLimitResult;
}
