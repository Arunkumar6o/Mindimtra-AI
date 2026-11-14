-- ==============================================================================
-- MindMitra PostgreSQL Database Schema Migration
-- Migration: 018_seed_data.sql
-- Description: Curated initial seed data (Categories, Activities, Assessment Templates)
-- ==============================================================================

-- ==============================================================================
-- 1. Activity Categories Seed Data
-- ==============================================================================
INSERT INTO public.activity_categories (slug, name, description, icon_name, color_hex, display_order)
VALUES 
    (
        'breathing', 
        'Breathing & Pranayama', 
        'Physiological regulation techniques to calm the sympathetic nervous system and lower acute anxiety.', 
        'wind', 
        '#2D6A4F', 
        1
    ),
    (
        'meditation', 
        'Guided Meditation', 
        'Mindfulness and meditation sessions designed to foster present-moment awareness and self-compassion.', 
        'brain', 
        '#40916C', 
        2
    ),
    (
        'journaling', 
        'Reflective Journaling', 
        'Structured cognitive prompts to process intrusive thoughts, untangle worries, and practice gratitude.', 
        'book-open', 
        '#7B1FA2', 
        3
    ),
    (
        'grounding', 
        'Sensory Grounding', 
        'Evidence-based somatic anchoring exercises to counter panic attacks, dissociation, and high overwhelm.', 
        'compass', 
        '#1976D2', 
        4
    ),
    (
        'relaxation', 
        'Physical Relaxation', 
        'Somatic tension-release protocols including Progressive Muscle Relaxation and vagus nerve stimulation.', 
        'heart', 
        '#E65100', 
        5
    ),
    (
        'sleep', 
        'Rest & Sleep Hygiene', 
        'Evening decompression routines, sleep stories, and parasympathetic activation to ease insomnia.', 
        'moon', 
        '#1B4332', 
        6
    )
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon_name = EXCLUDED.icon_name,
    color_hex = EXCLUDED.color_hex,
    display_order = EXCLUDED.display_order;


-- ==============================================================================
-- 2. Curated Activities Seed Data
-- ==============================================================================
INSERT INTO public.activities (
    category_id, 
    slug, 
    title, 
    description, 
    instructions, 
    duration_minutes, 
    difficulty, 
    tags, 
    target_emotions
)
VALUES 
    (
        (SELECT id FROM public.activity_categories WHERE slug = 'breathing'),
        'box-breathing-4-4-4-4',
        'Box Breathing (Sama Vritti)',
        'A powerful tactical breathing technique used to reset heart rate variability and restore equilibrium under acute stress.',
        '[
            {"step": 1, "action": "Inhale", "duration_seconds": 4, "guidance": "Inhale slowly through your nose, filling your lower abdomen."},
            {"step": 2, "action": "Hold", "duration_seconds": 4, "guidance": "Hold your lungs comfortably full without straining."},
            {"step": 3, "action": "Exhale", "duration_seconds": 4, "guidance": "Exhale gently through your mouth, emptying your chest completely."},
            {"step": 4, "action": "Hold", "duration_seconds": 4, "guidance": "Hold empty before beginning the next inhalation cycle."}
        ]'::JSONB,
        4,
        'beginner',
        ARRAY['anxiety_relief', 'focus', 'quick_reset'],
        ARRAY['Anxiety / Stress', 'Fear / Vulnerability', 'Overwhelmed']
    ),
    (
        (SELECT id FROM public.activity_categories WHERE slug = 'breathing'),
        '4-7-8-relaxing-breath',
        '4-7-8 Deep Relaxation Breath',
        'Dr. Andrew Weil''s renowned parasympathetic activation exercise, acting as a natural tranquilizer for the nervous system.',
        '[
            {"step": 1, "action": "Inhale", "duration_seconds": 4, "guidance": "Quietly inhale through your nose."},
            {"step": 2, "action": "Hold", "duration_seconds": 7, "guidance": "Hold your breath calmly for 7 counts."},
            {"step": 3, "action": "Exhale", "duration_seconds": 8, "guidance": "Make a gentle whoosh sound exhaling completely through your mouth."}
        ]'::JSONB,
        5,
        'beginner',
        ARRAY['sleep_prep', 'calm', 'vagus_nerve'],
        ARRAY['Anxiety / Stress', 'Anger / Frustration', 'Restlessness']
    ),
    (
        (SELECT id FROM public.activity_categories WHERE slug = 'grounding'),
        '5-4-3-2-1-sensory-grounding',
        '5-4-3-2-1 Sensory Grounding Technique',
        'Cognitive-somatic grounding using your five senses to tether racing thoughts to the immediate physical environment.',
        '[
            {"step": 1, "focus": "Sight", "guidance": "Acknowledge 5 things you can see around you right now."},
            {"step": 2, "focus": "Touch", "guidance": "Notice 4 things you can physically touch (fabric, desk, feet on floor)."},
            {"step": 3, "focus": "Sound", "guidance": "Listen for 3 distinct sounds in your surroundings."},
            {"step": 4, "focus": "Smell", "guidance": "Identify 2 scents in the air or nearby."},
            {"step": 5, "focus": "Taste", "guidance": "Notice 1 thing you can taste or the natural resting state of your tongue."}
        ]'::JSONB,
        5,
        'beginner',
        ARRAY['panic_reset', 'grounding', 'sensory'],
        ARRAY['Fear / Vulnerability', 'Anxiety / Stress', 'Dissociation']
    ),
    (
        (SELECT id FROM public.activity_categories WHERE slug = 'meditation'),
        'loving-kindness-metta',
        'Loving-Kindness (Metta) Self-Compassion',
        'Warm, heart-centered meditation practice cultivating kindness toward yourself and softening harsh self-criticism.',
        '[
            {"step": 1, "focus": "Center", "guidance": "Place a hand over your heart and take two calming breaths."},
            {"step": 2, "focus": "Affirm", "guidance": "Silently repeat: May I be safe. May I be healthy. May I be at peace."},
            {"step": 3, "focus": "Expand", "guidance": "Direct that same warmth to someone you care about deeply."}
        ]'::JSONB,
        8,
        'intermediate',
        ARRAY['self_compassion', 'emotional_healing', 'kindness'],
        ARRAY['Sadness / Grief', 'Self-Doubt', 'Loneliness']
    ),
    (
        (SELECT id FROM public.activity_categories WHERE slug = 'journaling'),
        'daily-gratitude-reflection',
        'Gratitude & Micro-Wins Journal',
        'Guided cognitive reframing prompt designed to counter the brain''s innate negativity bias with everyday gratitude.',
        '[
            {"prompt": "Name 3 small moments from today that brought ease, safety, or a smile."},
            {"prompt": "Acknowledge one effort you made today, no matter how small, that you are proud of."}
        ]'::JSONB,
        6,
        'beginner',
        ARRAY['journaling', 'gratitude', 'cognitive_reframing'],
        ARRAY['Sadness / Grief', 'Calmness / Equilibrium', 'Fatigue']
    ),
    (
        (SELECT id FROM public.activity_categories WHERE slug = 'relaxation'),
        'progressive-muscle-relaxation',
        'Progressive Muscle Relaxation (PMR)',
        'Sequentially tense and release major muscle groups to dissolve somatic tension caused by chronic mental stress.',
        '[
            {"step": 1, "muscle_group": "Feet & Calves", "guidance": "Curl your toes tightly for 5 seconds, then release completely for 10 seconds."},
            {"step": 2, "muscle_group": "Hands & Arms", "guidance": "Clench your fists and forearms for 5 seconds, then release into heavy relaxation."},
            {"step": 3, "muscle_group": "Shoulders & Neck", "guidance": "Shrug shoulders toward ears for 5 seconds, then drop them softly."}
        ]'::JSONB,
        10,
        'intermediate',
        ARRAY['somatics', 'body_scan', 'muscle_tension'],
        ARRAY['Anxiety / Stress', 'Anger / Frustration', 'Physical Tension']
    )
ON CONFLICT (slug) DO UPDATE 
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    instructions = EXCLUDED.instructions,
    duration_minutes = EXCLUDED.duration_minutes,
    difficulty = EXCLUDED.difficulty,
    tags = EXCLUDED.tags,
    target_emotions = EXCLUDED.target_emotions;


-- ==============================================================================
-- 3. Assessment Templates Seed Data
-- ==============================================================================
INSERT INTO public.assessment_templates (
    slug, 
    title, 
    description, 
    category, 
    total_questions, 
    min_score, 
    max_score, 
    score_interpretation
)
VALUES 
    (
        'who-5-wellbeing',
        'WHO-5 Well-Being Index',
        'A globally validated psychiatric screening instrument designed by the World Health Organization measuring emotional well-being over the past two weeks.',
        'general_wellbeing',
        5,
        0,
        25,
        '[
            {"min": 19, "max": 25, "label": "Flourishing / High Well-being", "description": "You are experiencing positive psychological equilibrium and robust resilience."},
            {"min": 13, "max": 18, "label": "Moderate / Adequate Well-being", "description": "You are managing well, though occasional self-care practices and mindfulness can boost your energy."},
            {"min": 0, "max": 12, "label": "Low Well-being / Heightened Vulnerability", "description": "Your current wellness score indicates notable emotional exhaustion. Prioritize restorative rest and consider reaching out to compassionate support."}
        ]'::JSONB
    ),
    (
        'daily-wellness-check',
        'Daily Mind & Energy Pulse',
        'A quick 3-item daily reflection tracking cognitive balance, stress reactivity, and emotional energy.',
        'daily_pulse',
        3,
        0,
        9,
        '[
            {"min": 7, "max": 9, "label": "Energized & Balanced", "description": "Your mind is clear and your reserves are replenished."},
            {"min": 4, "max": 6, "label": "Steadily Navigating", "description": "You are handling daily demands with moderate effort."},
            {"min": 0, "max": 3, "label": "Overextended", "description": "Take pause today. Engage in a brief 1-minute breather."}
        ]'::JSONB
    )
ON CONFLICT (slug) DO UPDATE 
SET title = EXCLUDED.title,
    description = EXCLUDED.description,
    total_questions = EXCLUDED.total_questions,
    min_score = EXCLUDED.min_score,
    max_score = EXCLUDED.max_score,
    score_interpretation = EXCLUDED.score_interpretation;


-- ==============================================================================
-- 4. Assessment Questions Seed Data
-- ==============================================================================
-- Questions for WHO-5
INSERT INTO public.assessment_questions (template_id, question_order, question_text, helper_text, options)
SELECT 
    t.id,
    q.order_no,
    q.q_text,
    q.helper,
    '[
        {"label": "All of the time", "score": 5},
        {"label": "Most of the time", "score": 4},
        {"label": "More than half of the time", "score": 3},
        {"label": "Less than half of the time", "score": 2},
        {"label": "Some of the time", "score": 1},
        {"label": "At no time", "score": 0}
    ]'::JSONB
FROM public.assessment_templates t
CROSS JOIN (
    VALUES 
        (1, 'I have felt cheerful and in good spirits.', 'Over the past two weeks'),
        (2, 'I have felt calm and relaxed.', 'Over the past two weeks'),
        (3, 'I have felt active and vigorous.', 'Over the past two weeks'),
        (4, 'I woke up feeling fresh and rested.', 'Over the past two weeks'),
        (5, 'My daily life has been filled with things that interest me.', 'Over the past two weeks')
) AS q(order_no, q_text, helper)
WHERE t.slug = 'who-5-wellbeing'
ON CONFLICT (template_id, question_order) DO UPDATE 
SET question_text = EXCLUDED.question_text,
    options = EXCLUDED.options;

-- Questions for Daily Wellness Check
INSERT INTO public.assessment_questions (template_id, question_order, question_text, helper_text, options)
SELECT 
    t.id,
    q.order_no,
    q.q_text,
    q.helper,
    '[
        {"label": "High / Thriving", "score": 3},
        {"label": "Moderate / Adequate", "score": 2},
        {"label": "Low / Strained", "score": 1},
        {"label": "Depleted / Overwhelmed", "score": 0}
    ]'::JSONB
FROM public.assessment_templates t
CROSS JOIN (
    VALUES 
        (1, 'How would you rate your emotional energy and stamina today?', 'Consider your mental bandwidth'),
        (2, 'How steady does your mind feel when facing challenges today?', 'Consider stress reactivity'),
        (3, 'How connected do you feel to your sense of purpose and calm?', 'Consider inner peace')
) AS q(order_no, q_text, helper)
WHERE t.slug = 'daily-wellness-check'
ON CONFLICT (template_id, question_order) DO UPDATE 
SET question_text = EXCLUDED.question_text,
    options = EXCLUDED.options;
