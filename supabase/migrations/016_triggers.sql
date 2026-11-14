-- ==============================================================================
-- MindMitra PostgreSQL Database Schema Migration
-- Migration: 016_triggers.sql
-- Description: Automated timestamp maintenance and Auth user profile lifecycle triggers
-- ==============================================================================

-- 1. Generic updated_at timestamp refresher function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.handle_updated_at() IS 'Reusable trigger function to update updated_at to current timestamp on row modifications.';

-- Apply handle_updated_at trigger to relevant tables
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_user_preferences_updated_at ON public.user_preferences;
CREATE TRIGGER trg_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_activity_categories_updated_at ON public.activity_categories;
CREATE TRIGGER trg_activity_categories_updated_at
    BEFORE UPDATE ON public.activity_categories
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_activities_updated_at ON public.activities;
CREATE TRIGGER trg_activities_updated_at
    BEFORE UPDATE ON public.activities
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_conversations_updated_at ON public.conversations;
CREATE TRIGGER trg_conversations_updated_at
    BEFORE UPDATE ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_mood_entries_updated_at ON public.mood_entries;
CREATE TRIGGER trg_mood_entries_updated_at
    BEFORE UPDATE ON public.mood_entries
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_assessment_templates_updated_at ON public.assessment_templates;
CREATE TRIGGER trg_assessment_templates_updated_at
    BEFORE UPDATE ON public.assessment_templates
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_activity_logs_updated_at ON public.activity_logs;
CREATE TRIGGER trg_activity_logs_updated_at
    BEFORE UPDATE ON public.activity_logs
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- 2. Auth user creation lifecycle trigger
-- Automatically provisions public.profiles and public.user_preferences upon signup
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
    v_display_name TEXT;
BEGIN
    -- Extract display name from metadata, fallback to email prefix
    v_display_name := COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'display_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1),
        'MindMitra Friend'
    );

    -- Insert into profiles
    INSERT INTO public.profiles (id, email, display_name)
    VALUES (NEW.id, NEW.email, v_display_name)
    ON CONFLICT (id) DO UPDATE 
    SET email = EXCLUDED.email,
        display_name = COALESCE(public.profiles.display_name, EXCLUDED.display_name);

    -- Insert default user preferences
    INSERT INTO public.user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    -- Record default Privacy Policy and Terms of Service consent if confirmed in metadata
    INSERT INTO public.privacy_consents (user_id, consent_type, consent_version, is_granted)
    VALUES 
        (NEW.id, 'terms_of_service', '1.0', true),
        (NEW.id, 'privacy_policy', '1.0', true),
        (NEW.id, 'ai_processing', '1.0', true)
    ON CONFLICT DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_new_auth_user() IS 'Trigger function executed on auth.users insert to initialize profile, default preferences, and baseline consents.';

-- Attach trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();
