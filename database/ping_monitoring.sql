-- ====================================================================
-- DDL & DML: Ping Monitoring Table & Cron Job (Keep-Alive Database)
-- Target Engine: Supabase (PostgreSQL)
-- Schedule: Daily at 02:00 AM (CRON 0 2 * * *)
-- ====================================================================

-- 1. Create Table PingMonitoring (Single-Row Enforced)
CREATE TABLE IF NOT EXISTS ping_monitoring (
    id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001'::UUID,
    last_ping_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    ping_count BIGINT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Ensure single row constraint via check or fixed ID constraint
ALTER TABLE ping_monitoring 
    ADD CONSTRAINT chk_single_row_ping 
    CHECK (id = '00000000-0000-0000-0000-000000000001'::UUID);

-- 2. Seed / Upsert Initial Row
INSERT INTO ping_monitoring (id, last_ping_at, status, ping_count, created_at, updated_at)
VALUES (
    '00000000-0000-0000-0000-000000000001'::UUID,
    CURRENT_TIMESTAMP,
    'ACTIVE',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT (id) DO UPDATE SET
    last_ping_at = EXCLUDED.last_ping_at,
    status = EXCLUDED.status,
    ping_count = ping_monitoring.ping_count + 1,
    updated_at = EXCLUDED.updated_at;

-- 3. Stored Procedure for Reusable Ping Execution
CREATE OR REPLACE FUNCTION trigger_database_ping()
RETURNS VOID AS $$
BEGIN
    INSERT INTO ping_monitoring (id, last_ping_at, status, ping_count, updated_at)
    VALUES (
        '00000000-0000-0000-0000-000000000001'::UUID,
        CURRENT_TIMESTAMP,
        'ACTIVE',
        1,
        CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO UPDATE SET
        last_ping_at = EXCLUDED.last_ping_at,
        status = EXCLUDED.status,
        ping_count = ping_monitoring.ping_count + 1,
        updated_at = EXCLUDED.updated_at;
END;
$$ LANGUAGE plpgsql;

-- 4. Supabase pg_cron Setup (Every Day at 02:00 AM)
-- Note: Enable pg_cron extension in Supabase Dashboard (Database -> Extensions) before running
CREATE EXTENSION IF NOT EXISTS pg_cron;

SELECT cron.schedule(
    'daily-keep-alive-ping-2am',
    '0 2 * * *', -- Cron expression for 02:00 AM
    'SELECT trigger_database_ping();'
);
