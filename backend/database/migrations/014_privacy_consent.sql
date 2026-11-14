-- ==============================================================================
-- MindMitra PostgreSQL Database Schema Migration
-- Migration: 014_privacy_consent.sql
-- Description: Explicit privacy consent tracking and compliance audit trail
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.privacy_consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    consent_type VARCHAR(50) NOT NULL,
    consent_version VARCHAR(20) NOT NULL,
    is_granted BOOLEAN NOT NULL DEFAULT true,
    ip_address_hash VARCHAR(64),
    user_agent TEXT,
    granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT chk_consent_type 
        CHECK (consent_type IN ('terms_of_service', 'privacy_policy', 'ai_processing', 'emotion_analytics', 'emergency_contact_disclosure')),
    CONSTRAINT chk_consent_revocation_time 
        CHECK (revoked_at IS NULL OR revoked_at >= granted_at)
);

COMMENT ON TABLE public.privacy_consents IS 'Compliance audit log tracking user consent grants and revocations for terms, AI processing, and privacy policies.';
COMMENT ON COLUMN public.privacy_consents.ip_address_hash IS 'Pseudonymized SHA-256 hash of the client IP address for compliance verification without storing raw PII.';
