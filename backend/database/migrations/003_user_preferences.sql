-- ==============================================================================
-- MindMitra PostgreSQL Database Schema Migration
-- Migration: 003_user_preferences.sql
-- Description: User preferences and personal configuration settings
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    preferred_language VARCHAR(10) NOT NULL DEFAULT 'en',
    communication_style VARCHAR(30) NOT NULL DEFAULT 'empathetic',
    daily_reminder_enabled BOOLEAN NOT NULL DEFAULT true,
    daily_reminder_time TIME NOT NULL DEFAULT '09:00:00',
    email_notifications BOOLEAN NOT NULL DEFAULT false,
    push_notifications BOOLEAN NOT NULL DEFAULT true,
    ai_voice_enabled BOOLEAN NOT NULL DEFAULT false,
    preferred_activity_types TEXT[] NOT NULL DEFAULT ARRAY['breathing', 'mindfulness']::TEXT[],
    theme VARCHAR(20) NOT NULL DEFAULT 'light',
    data_sharing_consent BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT chk_pref_language 
        CHECK (preferred_language IN ('en', 'hi', 'ta', 'te', 'kn', 'ml', 'mr', 'bn', 'gu', 'pa')),
    CONSTRAINT chk_pref_communication_style 
        CHECK (communication_style IN ('empathetic', 'direct', 'gentle', 'reflective', 'humorous')),
    CONSTRAINT chk_pref_theme 
        CHECK (theme IN ('light', 'dark', 'system'))
);

COMMENT ON TABLE public.user_preferences IS 'User application configuration settings, regional language preference, and notification timings.';
