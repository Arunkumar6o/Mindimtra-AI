-- ==============================================================================
-- MindMitra PostgreSQL Database Schema Migration
-- Migration: 015_indexes.sql
-- Description: Targeted performance and foreign key indexes
-- ==============================================================================

-- 1. Profiles
-- Fast lookup of active, non-deactivated profiles during authentication / sessions
CREATE INDEX IF NOT EXISTS idx_profiles_active 
    ON public.profiles(id) 
    WHERE deleted_at IS NULL;

-- 2. Activities & Categories
-- UI query: Fetch active categories sorted by display order for the dashboard navigation
CREATE INDEX IF NOT EXISTS idx_activity_categories_active_order 
    ON public.activity_categories(is_active, display_order);

-- Query: Fetch active activities for a selected category
CREATE INDEX IF NOT EXISTS idx_activities_category_active 
    ON public.activities(category_id, is_active);

-- GIN index for tag-based filtering (e.g. user preferred activity types)
CREATE INDEX IF NOT EXISTS idx_activities_tags 
    ON public.activities USING GIN(tags);

-- GIN index for emotion-based activity recommendation matching
CREATE INDEX IF NOT EXISTS idx_activities_target_emotions 
    ON public.activities USING GIN(target_emotions);

-- 3. Conversations & Messages
-- UI query: Load user's conversations list ordered by most recent activity
CREATE INDEX IF NOT EXISTS idx_conversations_user_updated 
    ON public.conversations(user_id, updated_at DESC) 
    WHERE deleted_at IS NULL;

-- Query: Load chronological messages for an active conversation thread
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
    ON public.messages(conversation_id, created_at ASC);

-- Query: Quick user-level message audit and RLS checks
CREATE INDEX IF NOT EXISTS idx_messages_user_created 
    ON public.messages(user_id, created_at DESC);

-- 4. Mood Tracking
-- UI query: Retrieve user's mood entries for weekly trend charts and analytics
CREATE INDEX IF NOT EXISTS idx_mood_entries_user_recorded 
    ON public.mood_entries(user_id, recorded_at DESC);

-- 5. Wellness Assessments
-- Query: Fetch questionnaire questions in order
CREATE INDEX IF NOT EXISTS idx_assessment_questions_template_order 
    ON public.assessment_questions(template_id, question_order ASC);

-- UI query: Retrieve user's previous assessment results
CREATE INDEX IF NOT EXISTS idx_user_assessments_user_completed 
    ON public.user_assessments(user_id, completed_at DESC);

-- Query: Retrieve user responses for a specific assessment instance
CREATE INDEX IF NOT EXISTS idx_user_assessment_responses_instance 
    ON public.user_assessment_responses(user_assessment_id);

-- 6. Activity Logs
-- UI query: Render recent activity timeline on dashboard
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_started 
    ON public.activity_logs(user_id, started_at DESC);

-- Query: Aggregate completion metrics for a given activity
CREATE INDEX IF NOT EXISTS idx_activity_logs_activity 
    ON public.activity_logs(activity_id);

-- 7. Recommendations
-- UI query: Display active, non-dismissed recommendations for user
CREATE INDEX IF NOT EXISTS idx_recommendations_user_active 
    ON public.recommendations(user_id, created_at DESC) 
    WHERE is_dismissed = false;

-- 8. Feedback
-- Query: Filter feedback by target entity (e.g. AI message or specific activity)
CREATE INDEX IF NOT EXISTS idx_feedback_target 
    ON public.feedback(target_type, target_id);

-- 9. AI Interactions Telemetry
-- Query: Filter telemetry by conversation for latency and token monitoring
CREATE INDEX IF NOT EXISTS idx_ai_interactions_conversation 
    ON public.ai_interactions(conversation_id);

CREATE INDEX IF NOT EXISTS idx_ai_interactions_user_created 
    ON public.ai_interactions(user_id, created_at DESC);

-- 10. Privacy Consents
-- Query: Audit user consent status for a specific legal/AI processing term
CREATE INDEX IF NOT EXISTS idx_privacy_consents_user_type 
    ON public.privacy_consents(user_id, consent_type, granted_at DESC);
