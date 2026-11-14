-- ==============================================================================
-- MindMitra PostgreSQL Database Schema Migration
-- Migration: 004_activity_categories.sql
-- Description: Activity categories (breathing, meditation, journaling, etc.)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.activity_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_name VARCHAR(50),
    color_hex VARCHAR(7) NOT NULL DEFAULT '#2D6A4F',
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT chk_activity_cat_slug_format 
        CHECK (slug ~* '^[a-z0-9_-]+$'),
    CONSTRAINT chk_activity_cat_color_hex 
        CHECK (color_hex ~* '^#[0-9A-Fa-f]{6}$')
);

COMMENT ON TABLE public.activity_categories IS 'Master reference categories for wellness exercises, meditation routines, and mindfulness tools.';
