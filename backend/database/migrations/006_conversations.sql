-- ==============================================================================
-- MindMitra PostgreSQL Database Schema Migration
-- Migration: 006_conversations.sql
-- Description: AI Companion conversation threads
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL DEFAULT 'New Conversation',
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    summary TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT chk_conversation_status 
        CHECK (status IN ('active', 'archived', 'deleted')),
    CONSTRAINT chk_conversation_title_len 
        CHECK (char_length(trim(title)) >= 1 AND char_length(title) <= 150)
);

COMMENT ON TABLE public.conversations IS 'User conversation threads with MindMitra AI Companion.';
