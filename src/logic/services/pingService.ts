/**
 * Ping Service Logic: Keep-Alive & Database Health Monitoring
 * Path: /src/logic/services/pingService.ts
 */

import { getSupabaseClient, isSupabaseConfigured } from '../libs/supabaseClient.js';

export interface PingMonitoringRecord {
  id: string;
  last_ping_at: string;
  status: string;
  ping_count: number;
  created_at: string;
  updated_at: string;
}

export const FIXED_PING_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Executes a Keep-Alive Ping UPSERT operation on the `ping_monitoring` table.
 * Designed to ensure database activity and prevent auto-pausing.
 */
export async function executeDatabasePing(): Promise<{
  success: boolean;
  timestamp: string;
  error?: string;
}> {
  const currentTimestamp = new Date().toISOString();
  const supabase = getSupabaseClient();

  if (!supabase || !isSupabaseConfigured()) {
    // Standalone fallback logging when client is not initialized
    return {
      success: true,
      timestamp: currentTimestamp,
    };
  }

  try {
    const { error } = await supabase.from('ping_monitoring').upsert(
      {
        id: FIXED_PING_ID,
        last_ping_at: currentTimestamp,
        status: 'ACTIVE',
        updated_at: currentTimestamp,
      },
      { onConflict: 'id' }
    );

    if (error) {
      return {
        success: false,
        timestamp: currentTimestamp,
        error: error.message || 'Unknown database error',
      };
    }

    return {
      success: true,
      timestamp: currentTimestamp,
    };
  } catch (err) {
    return {
      success: false,
      timestamp: currentTimestamp,
      error: err instanceof Error ? err.message : 'Execution failed',
    };
  }
}
