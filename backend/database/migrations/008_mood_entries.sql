-- ==============================================================================
-- MindMitra PostgreSQL Database Schema Migration
-- Migration: 008_mood_entries.sql
-- Description: Mood tracking and emotional wellbeing logs over time
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.mood_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    mood_score INT NOT NULL,
    mood_label VARCHAR(50) NOT NULL,
    primary_emotion VARCHAR(50) NOT NULL,
    secondary_emotions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    notes TEXT,
    encrypted_notes TEXT,
    encryption_iv TEXT,
    encryption_tag TEXT,
    encryption_version INT NOT NULL DEFAULT 1,
    is_encrypted BOOLEAN NOT NULL DEFAULT false,
    triggers TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT chk_mood_score_range 
        CHECK (mood_score >= 1 AND mood_score <= 10),
    CONSTRAINT chk_mood_label_len 
        CHECK (char_length(trim(mood_label)) >= 1 AND char_length(mood_label) <= 50),
    CONSTRAINT chk_mood_notes_encryption 
        CHECK (is_encrypted = false OR (encrypted_notes IS NOT NULL AND encryption_iv IS NOT NULL AND encryption_tag IS NOT NULL))
);

COMMENT ON TABLE public.mood_entries IS 'Daily mood scores, recorded emotions, identified triggers, and optional encrypted journal notes.';
