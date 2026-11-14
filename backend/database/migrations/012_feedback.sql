-- ==============================================================================
-- MindMitra PostgreSQL Database Schema Migration
-- Migration: 012_feedback.sql
-- Description: Centralized user feedback mechanism for AI responses, activities, and app
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_type VARCHAR(30) NOT NULL,
    target_id UUID,
    rating INT NOT NULL,
    feedback_category VARCHAR(50),
    feedback_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT chk_feedback_target_type 
        CHECK (target_type IN ('message', 'activity', 'recommendation', 'assessment', 'general_app')),
    CONSTRAINT chk_feedback_rating 
        CHECK (rating >= 1 AND rating <= 5),
    CONSTRAINT chk_feedback_text_len 
        CHECK (feedback_text IS NULL OR char_length(feedback_text) <= 2000)
);

COMMENT ON TABLE public.feedback IS 'Centralized feedback records covering AI conversational responses, activities, assessments, and overall UX.';
