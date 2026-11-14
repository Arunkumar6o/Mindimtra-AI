-- ==============================================================================
-- MindMitra PostgreSQL Database Schema Migration
-- Migration: 002_profiles.sql
-- Description: User Profiles table linked 1:1 with Supabase auth.users
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email CITEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    date_of_birth DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT chk_profiles_display_name_len 
        CHECK (char_length(trim(display_name)) >= 1 AND char_length(display_name) <= 100),
    CONSTRAINT chk_profiles_email_format 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT chk_profiles_dob_valid 
        CHECK (date_of_birth IS NULL OR (date_of_birth <= CURRENT_DATE AND date_of_birth >= '1900-01-01'))
);

-- Documentation comment
COMMENT ON TABLE public.profiles IS 'Public user profile records linked directly to Supabase Auth users via auth.users.id.';
COMMENT ON COLUMN public.profiles.id IS 'Primary key directly mirroring auth.users.id.';
COMMENT ON COLUMN public.profiles.deleted_at IS 'Timestamp populated when user requests account deactivation or soft deletion.';
