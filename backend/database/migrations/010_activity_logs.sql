-- ==============================================================================
-- MindMitra PostgreSQL Database Schema Migration
-- Migration: 010_activity_logs.sql
-- Description: Tracking user exercise completions, durations, and ratings
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'completed',
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    duration_seconds INT,
    user_rating INT,
    user_reflection TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT chk_activity_log_status 
        CHECK (status IN ('started', 'in_progress', 'completed', 'abandoned')),
    CONSTRAINT chk_activity_log_duration 
        CHECK (duration_seconds IS NULL OR duration_seconds >= 0),
    CONSTRAINT chk_activity_log_rating 
        CHECK (user_rating IS NULL OR (user_rating >= 1 AND user_rating <= 5)),
    CONSTRAINT chk_activity_log_completion_time 
        CHECK (completed_at IS NULL OR completed_at >= started_at)
);

COMMENT ON TABLE public.activity_logs IS 'Execution logs for wellness activities (e.g. 1-minute breather, morning meditation, mindful journaling).';
