-- ==============================================================================
-- MindMitra PostgreSQL Database Schema Migration
-- Migration: 013_ai_interactions.sql
-- Description: Telemetry and metadata for AI model calls (Gemini, RoBERTa/DistilBERT)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.ai_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    model_provider VARCHAR(50) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    request_timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
    response_timestamp TIMESTAMPTZ,
    latency_ms INT,
    prompt_tokens INT,
    completion_tokens INT,
    total_tokens INT,
    is_sanitized BOOLEAN NOT NULL DEFAULT true,
    pii_detected BOOLEAN NOT NULL DEFAULT false,
    pii_entities_sanitized TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    status VARCHAR(20) NOT NULL DEFAULT 'success',
    error_code VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT chk_ai_interaction_status 
        CHECK (status IN ('success', 'rate_limited', 'error', 'safety_blocked')),
    CONSTRAINT chk_ai_interaction_latency 
        CHECK (latency_ms IS NULL OR latency_ms >= 0),
    CONSTRAINT chk_ai_interaction_tokens 
        CHECK (total_tokens IS NULL OR total_tokens >= 0)
);

COMMENT ON TABLE public.ai_interactions IS 'Audit and telemetry records for external AI invocations. Tracks latency, tokens, and PII scrubbing flags without storing sensitive API keys or redundant raw payloads.';
