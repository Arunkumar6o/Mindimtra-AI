-- ==============================================================================
-- MindMitra PostgreSQL Database Schema Migration
-- Migration: 009_wellness_assessments.sql
-- Description: Normalized tables for standardized wellness assessments and responses
-- ==============================================================================

-- 1. Assessment Templates (e.g. WHO-5, Daily Wellness Check)
CREATE TABLE IF NOT EXISTS public.assessment_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'general_wellbeing',
    total_questions INT NOT NULL CHECK (total_questions > 0),
    min_score INT NOT NULL DEFAULT 0,
    max_score INT NOT NULL,
    score_interpretation JSONB NOT NULL DEFAULT '[]'::JSONB,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT chk_template_score_bounds 
        CHECK (max_score >= min_score)
);

COMMENT ON TABLE public.assessment_templates IS 'Questionnaire definitions for validated and custom emotional well-being assessments.';

-- 2. Questions belonging to an Assessment Template
CREATE TABLE IF NOT EXISTS public.assessment_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.assessment_templates(id) ON DELETE CASCADE,
    question_order INT NOT NULL CHECK (question_order >= 1),
    question_text TEXT NOT NULL,
    helper_text TEXT,
    options JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_template_question_order 
        UNIQUE (template_id, question_order)
);

COMMENT ON TABLE public.assessment_questions IS 'Ordered questions and scored choice sets for assessment templates.';

-- 3. Completed User Assessment Instances
CREATE TABLE IF NOT EXISTS public.user_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES public.assessment_templates(id) ON DELETE RESTRICT,
    total_score INT NOT NULL CHECK (total_score >= 0),
    score_category VARCHAR(50) NOT NULL,
    summary TEXT,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.user_assessments IS 'Header record of an assessment taken by a user with calculated score and outcome.';

-- 4. Granular Responses to Assessment Questions
CREATE TABLE IF NOT EXISTS public.user_assessment_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_assessment_id UUID NOT NULL REFERENCES public.user_assessments(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.assessment_questions(id) ON DELETE RESTRICT,
    selected_score INT NOT NULL,
    response_text TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT uq_user_assessment_question 
        UNIQUE (user_assessment_id, question_id)
);

COMMENT ON TABLE public.user_assessment_responses IS 'Individual question answers and assigned scores for a user assessment submission.';
