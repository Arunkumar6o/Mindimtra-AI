-- ==============================================================================
-- MindMitra PostgreSQL Database Schema Migration
-- Migration: 020_unified_emotional_analysis.sql
-- Description: Unified emotional analysis schema, message source attribution, and history
-- ==============================================================================

-- 1. Ensure 'source' column exists in public.messages
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'messages' 
        AND column_name = 'source'
    ) THEN
        ALTER TABLE public.messages 
        ADD COLUMN source VARCHAR(30) NOT NULL DEFAULT 'gemini_companion';

        ALTER TABLE public.messages
        ADD CONSTRAINT chk_message_source 
            CHECK (source IN ('emotion_classifier', 'gemini_companion'));
    END IF;
END $$;

COMMENT ON COLUMN public.messages.source IS 'Identifies interaction origin: emotion_classifier or gemini_companion.';

-- 2. Create public.emotional_analyses table for unified multi-source analysis history
CREATE TABLE IF NOT EXISTS public.emotional_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    overall_score NUMERIC(3, 1) NOT NULL CHECK (overall_score >= 1.0 AND overall_score <= 10.0),
    concern_level VARCHAR(50) NOT NULL,
    dominant_emotions TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    dimensions JSONB NOT NULL,
    summary TEXT NOT NULL,
    key_indicators TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    trend VARCHAR(30) NOT NULL DEFAULT 'stable',
    previous_score NUMERIC(3, 1),
    messages_analyzed_count INT NOT NULL DEFAULT 0,
    classifier_messages_count INT NOT NULL DEFAULT 0,
    companion_messages_count INT NOT NULL DEFAULT 0,
    roberta_snapshot JSONB DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT chk_analysis_trend 
        CHECK (trend IN ('improving', 'stable', 'increasing_concern')),
    CONSTRAINT chk_analysis_counts 
        CHECK (messages_analyzed_count >= 0 AND classifier_messages_count >= 0 AND companion_messages_count >= 0)
);

COMMENT ON TABLE public.emotional_analyses IS 'Unified multi-dimensional emotional well-being assessments combining Emotion Classifier and Gemini AI Companion user messages.';

-- 3. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_emotional_analyses_user_created 
    ON public.emotional_analyses(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_messages_user_source 
    ON public.messages(user_id, source, role, created_at DESC);

-- 4. Row Level Security (RLS)
ALTER TABLE public.emotional_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "emotional_analyses_select_own" ON public.emotional_analyses;
CREATE POLICY "emotional_analyses_select_own" 
    ON public.emotional_analyses FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "emotional_analyses_insert_own" ON public.emotional_analyses;
CREATE POLICY "emotional_analyses_insert_own" 
    ON public.emotional_analyses FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "emotional_analyses_update_own" ON public.emotional_analyses;
CREATE POLICY "emotional_analyses_update_own" 
    ON public.emotional_analyses FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "emotional_analyses_delete_own" ON public.emotional_analyses;
CREATE POLICY "emotional_analyses_delete_own" 
    ON public.emotional_analyses FOR DELETE 
    USING (auth.uid() = user_id);
