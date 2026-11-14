-- ==============================================================================
-- MindMitra PostgreSQL Database Schema Migration
-- Migration: 005_activities.sql
-- Description: Curated wellness activities, guided breathing, and meditation
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.activity_categories(id) ON DELETE RESTRICT,
    slug VARCHAR(100) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    instructions JSONB NOT NULL DEFAULT '[]'::JSONB,
    duration_minutes INT NOT NULL,
    difficulty VARCHAR(20) NOT NULL DEFAULT 'beginner',
    tags TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    target_emotions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    audio_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT chk_activity_slug_format 
        CHECK (slug ~* '^[a-z0-9_-]+$'),
    CONSTRAINT chk_activity_duration 
        CHECK (duration_minutes > 0 AND duration_minutes <= 180),
    CONSTRAINT chk_activity_difficulty 
        CHECK (difficulty IN ('beginner', 'intermediate', 'advanced'))
);

COMMENT ON TABLE public.activities IS 'Curated mental wellbeing exercises, breathing tools, guided reflections, and mindfulness activities.';
