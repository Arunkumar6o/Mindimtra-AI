-- ==============================================================================
-- MindMitra PostgreSQL Database Schema Migration
-- Migration: 001_extensions.sql
-- Description: Enable required PostgreSQL extensions for UUID generation and crypto
-- ==============================================================================

-- Enable UUID generation support (Standard PostgreSQL extension)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable cryptographic primitives (e.g., gen_random_uuid(), digest(), hmac())
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enable CITEXT for case-insensitive text matching (safe email/tag lookups)
CREATE EXTENSION IF NOT EXISTS "citext";
