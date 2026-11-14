-- ==============================================================================
-- MindMitra PostgreSQL Database Schema Migration
-- Migration: 017_rls.sql
-- Description: Comprehensive Row Level Security (RLS) policies for all tables
-- ==============================================================================

-- ==============================================================================
-- 1. Profiles Table RLS
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" 
    ON public.profiles FOR INSERT 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_delete_own" 
    ON public.profiles FOR DELETE 
    USING (auth.uid() = id);


-- ==============================================================================
-- 2. User Preferences Table RLS
-- ==============================================================================
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_preferences_select_own" 
    ON public.user_preferences FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "user_preferences_insert_own" 
    ON public.user_preferences FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_preferences_update_own" 
    ON public.user_preferences FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_preferences_delete_own" 
    ON public.user_preferences FOR DELETE 
    USING (auth.uid() = user_id);


-- ==============================================================================
-- 3. Activity Categories Table RLS (Public Reference Data)
-- ==============================================================================
ALTER TABLE public.activity_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_categories_select_public" 
    ON public.activity_categories FOR SELECT 
    USING (is_active = true);


-- ==============================================================================
-- 4. Activities Table RLS (Public Curated Activities)
-- ==============================================================================
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activities_select_public" 
    ON public.activities FOR SELECT 
    USING (is_active = true);


-- ==============================================================================
-- 5. Conversations Table RLS
-- ==============================================================================
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "conversations_select_own" 
    ON public.conversations FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "conversations_insert_own" 
    ON public.conversations FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "conversations_update_own" 
    ON public.conversations FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "conversations_delete_own" 
    ON public.conversations FOR DELETE 
    USING (auth.uid() = user_id);


-- ==============================================================================
-- 6. Messages Table RLS
-- ==============================================================================
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "messages_select_own" 
    ON public.messages FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "messages_insert_own" 
    ON public.messages FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "messages_update_own" 
    ON public.messages FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "messages_delete_own" 
    ON public.messages FOR DELETE 
    USING (auth.uid() = user_id);


-- ==============================================================================
-- 7. Mood Entries Table RLS
-- ==============================================================================
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mood_entries_select_own" 
    ON public.mood_entries FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "mood_entries_insert_own" 
    ON public.mood_entries FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "mood_entries_update_own" 
    ON public.mood_entries FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "mood_entries_delete_own" 
    ON public.mood_entries FOR DELETE 
    USING (auth.uid() = user_id);


-- ==============================================================================
-- 8. Assessment Templates & Questions RLS (Public Questionnaires)
-- ==============================================================================
ALTER TABLE public.assessment_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assessment_templates_select_active" 
    ON public.assessment_templates FOR SELECT 
    USING (is_active = true);

ALTER TABLE public.assessment_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "assessment_questions_select_active" 
    ON public.assessment_questions FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.assessment_templates t 
            WHERE t.id = template_id AND t.is_active = true
        )
    );


-- ==============================================================================
-- 9. User Assessments & Responses RLS
-- ==============================================================================
ALTER TABLE public.user_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_assessments_select_own" 
    ON public.user_assessments FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "user_assessments_insert_own" 
    ON public.user_assessments FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_assessments_update_own" 
    ON public.user_assessments FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_assessments_delete_own" 
    ON public.user_assessments FOR DELETE 
    USING (auth.uid() = user_id);

ALTER TABLE public.user_assessment_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_assessment_responses_select_own" 
    ON public.user_assessment_responses FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_assessments ua 
            WHERE ua.id = user_assessment_id AND ua.user_id = auth.uid()
        )
    );

CREATE POLICY "user_assessment_responses_insert_own" 
    ON public.user_assessment_responses FOR INSERT 
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_assessments ua 
            WHERE ua.id = user_assessment_id AND ua.user_id = auth.uid()
        )
    );

CREATE POLICY "user_assessment_responses_update_own" 
    ON public.user_assessment_responses FOR UPDATE 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_assessments ua 
            WHERE ua.id = user_assessment_id AND ua.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_assessments ua 
            WHERE ua.id = user_assessment_id AND ua.user_id = auth.uid()
        )
    );

CREATE POLICY "user_assessment_responses_delete_own" 
    ON public.user_assessment_responses FOR DELETE 
    USING (
        EXISTS (
            SELECT 1 FROM public.user_assessments ua 
            WHERE ua.id = user_assessment_id AND ua.user_id = auth.uid()
        )
    );


-- ==============================================================================
-- 10. Activity Logs Table RLS
-- ==============================================================================
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "activity_logs_select_own" 
    ON public.activity_logs FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "activity_logs_insert_own" 
    ON public.activity_logs FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "activity_logs_update_own" 
    ON public.activity_logs FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "activity_logs_delete_own" 
    ON public.activity_logs FOR DELETE 
    USING (auth.uid() = user_id);


-- ==============================================================================
-- 11. Recommendations Table RLS
-- ==============================================================================
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recommendations_select_own" 
    ON public.recommendations FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "recommendations_insert_own" 
    ON public.recommendations FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "recommendations_update_own" 
    ON public.recommendations FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "recommendations_delete_own" 
    ON public.recommendations FOR DELETE 
    USING (auth.uid() = user_id);


-- ==============================================================================
-- 12. Feedback Table RLS
-- ==============================================================================
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback_select_own" 
    ON public.feedback FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "feedback_insert_own" 
    ON public.feedback FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "feedback_update_own" 
    ON public.feedback FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "feedback_delete_own" 
    ON public.feedback FOR DELETE 
    USING (auth.uid() = user_id);


-- ==============================================================================
-- 13. AI Interactions Table RLS (Read Own Telemetry, Service Role Writes)
-- ==============================================================================
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ai_interactions_select_own" 
    ON public.ai_interactions FOR SELECT 
    USING (auth.uid() = user_id);

-- Note: Ingestion is executed with the backend service-role key, bypassing client INSERT


-- ==============================================================================
-- 14. Privacy Consents Table RLS (Read/Write Own Consents, Immutable Audit)
-- ==============================================================================
ALTER TABLE public.privacy_consents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "privacy_consents_select_own" 
    ON public.privacy_consents FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "privacy_consents_insert_own" 
    ON public.privacy_consents FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "privacy_consents_update_own" 
    ON public.privacy_consents FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Explicitly NO DELETE policy on privacy_consents to preserve legal audit compliance
