-- ==============================================================================
-- MindMitra PostgreSQL Database Schema Migration
-- Migration: 011_recommendations.sql
-- Description: AI and rule-driven personalized wellness recommendations
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES public.activities(id) ON DELETE SET NULL,
    recommendation_type VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    reason TEXT NOT NULL,
    context_source VARCHAR(30) NOT NULL DEFAULT 'rule_engine',
    source_reference_id UUID,
    is_viewed BOOLEAN NOT NULL DEFAULT false,
    is_accepted BOOLEAN NOT NULL DEFAULT false,
    is_dismissed BOOLEAN NOT NULL DEFAULT false,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT chk_rec_type 
        CHECK (recommendation_type IN ('activity', 'breathing_exercise', 'grounding_technique', 'crisis_resource', 'journal_prompt', 'sleep_routine')),
    CONSTRAINT chk_rec_context_source 
        CHECK (context_source IN ('mood_trigger', 'assessment_result', 'chat_emotion', 'routine', 'rule_engine'))
);

COMMENT ON TABLE public.recommendations IS 'Context-aware personalized recommendations generated from emotion analysis, mood drops, or routine habit triggers.';
