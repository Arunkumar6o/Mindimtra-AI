-- ==============================================================================
-- MindMitra PostgreSQL Database Schema Migration
-- Migration: 007_messages.sql
-- Description: Conversation messages supporting AES-256-GCM encryption & PII sanitization
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    source VARCHAR(30) NOT NULL DEFAULT 'gemini_companion',
    content TEXT,
    encrypted_content TEXT,
    encryption_iv TEXT,
    encryption_tag TEXT,
    encryption_version INT NOT NULL DEFAULT 1,
    is_encrypted BOOLEAN NOT NULL DEFAULT false,
    is_sanitized BOOLEAN NOT NULL DEFAULT false,
    sanitized_content TEXT,
    detected_emotion VARCHAR(50),
    emotion_confidence NUMERIC(5, 2),
    metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT chk_message_role 
        CHECK (role IN ('user', 'assistant', 'system')),
    CONSTRAINT chk_message_source 
        CHECK (source IN ('emotion_classifier', 'gemini_companion')),
    CONSTRAINT chk_message_has_content 
        CHECK (content IS NOT NULL OR encrypted_content IS NOT NULL),
    CONSTRAINT chk_message_encryption_fields 
        CHECK (is_encrypted = false OR (encrypted_content IS NOT NULL AND encryption_iv IS NOT NULL AND encryption_tag IS NOT NULL)),
    CONSTRAINT chk_message_emotion_confidence 
        CHECK (emotion_confidence IS NULL OR (emotion_confidence >= 0.00 AND emotion_confidence <= 100.00))
);

COMMENT ON TABLE public.messages IS 'Messages exchanged within a conversation thread. Supports server-side AES-256-GCM encryption and audit flags for PII sanitization.';
COMMENT ON COLUMN public.messages.encrypted_content IS 'Base64/Hex AES-256-GCM encrypted ciphertext created by backend security service.';
COMMENT ON COLUMN public.messages.sanitized_content IS 'PII-scrubbed version of the prompt submitted to external AI/LLM models.';
COMMENT ON COLUMN public.messages.metadata IS 'Non-sensitive execution metadata such as client UI suggested follow-up chips.';
