import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface MoodEntryRecord {
  id: string;
  user_id: string;
  mood_score: number; // 1 to 10
  mood_label: string;
  primary_emotion: string;
  secondary_emotions: string[];
  triggers: string[];
  notes?: string;
  recorded_at: string;
}

export interface ActivityLogRecord {
  id: string;
  user_id: string;
  activity_slug: string;
  activity_title: string;
  duration_seconds: number;
  user_rating?: number;
  user_reflection?: string;
  completed_at: string;
  status: 'completed' | 'in_progress';
}

export interface JournalEntryRecord {
  id: string;
  user_id: string;
  title: string;
  content: string;
  prompt_used?: string;
  detected_emotion?: string;
  tags: string[];
  created_at: string;
}

export interface UserPreferencesRecord {
  preferred_language: string;
  communication_style: 'empathetic' | 'gentle' | 'direct' | 'reflective';
  daily_reminder_enabled: boolean;
  daily_reminder_time: string;
  push_notifications: boolean;
  email_notifications: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface WellnessGoalRecord {
  id: string;
  title: string;
  category: 'mindfulness' | 'body' | 'reflection' | 'rest';
  target_per_week: number;
  completed_days: string[]; // YYYY-MM-DD
  streak: number;
}

export interface AppointmentRecord {
  id: string;
  title: string;
  provider_name: string;
  provider_role: string;
  appointment_date: string;
  appointment_time: string;
  type: 'therapy' | 'meditation_circle' | 'coaching' | 'checkin';
  status: 'confirmed' | 'rescheduled' | 'completed';
  notes?: string;
  meeting_link?: string;
}

export interface CommunityPostRecord {
  id: string;
  author_alias: string;
  title: string;
  content: string;
  tag: string;
  timestamp: string;
  reactions: {
    warmth: number;
    support: number;
    gratitude: number;
  };
  user_reacted?: string[];
}

// -------------------------------------------------------------
// Helper to resolve user ID safely
// -------------------------------------------------------------
function resolveUserId(userId?: string): string {
  if (userId && userId.trim()) return userId;
  try {
    const saved = localStorage.getItem('mindmitra_user');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.id) return parsed.id;
    }
  } catch (e) {}
  return '00000000-0000-0000-0000-000000000001';
}

// =============================================================
// 1. MOOD ENTRIES (public.mood_entries)
// =============================================================

export async function saveMoodEntryToDb(
  userId: string,
  entry: {
    moodScore: number;
    moodLabel: string;
    primaryEmotion: string;
    secondaryEmotions?: string[];
    triggers?: string[];
    notes?: string;
  }
): Promise<MoodEntryRecord> {
  const uid = resolveUserId(userId);
  const newRecord: MoodEntryRecord = {
    id: `mood_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id: uid,
    mood_score: Math.max(1, Math.min(10, Math.round(entry.moodScore))),
    mood_label: entry.moodLabel,
    primary_emotion: entry.primaryEmotion,
    secondary_emotions: entry.secondaryEmotions || [],
    triggers: entry.triggers || [],
    notes: entry.notes || '',
    recorded_at: new Date().toISOString()
  };

  // 1. Save to local storage for instant availability
  const storageKey = `mindmitra_mood_entries_${uid}`;
  try {
    const existing: MoodEntryRecord[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    existing.unshift(newRecord);
    localStorage.setItem(storageKey, JSON.stringify(existing.slice(0, 100)));
  } catch (e) {
    console.warn('Local storage mood save note:', e);
  }

  // 2. Sync with Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('mood_entries').insert([
        {
          user_id: uid,
          mood_score: newRecord.mood_score,
          mood_label: newRecord.mood_label,
          primary_emotion: newRecord.primary_emotion,
          secondary_emotions: newRecord.secondary_emotions,
          triggers: newRecord.triggers,
          notes: newRecord.notes,
          recorded_at: newRecord.recorded_at
        }
      ]);
    } catch (dbErr) {
      console.warn('Supabase mood_entries insert notice:', dbErr);
    }
  }

  return newRecord;
}

export async function getMoodEntriesFromDb(userId: string): Promise<MoodEntryRecord[]> {
  const uid = resolveUserId(userId);
  const storageKey = `mindmitra_mood_entries_${uid}`;
  let records: MoodEntryRecord[] = [];

  // Read local records first
  try {
    records = JSON.parse(localStorage.getItem(storageKey) || '[]');
  } catch (e) {}

  // If Supabase configured, attempt to fetch latest and merge
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', uid)
        .order('recorded_at', { ascending: false })
        .limit(30);

      if (!error && data && data.length > 0) {
        records = data as MoodEntryRecord[];
        localStorage.setItem(storageKey, JSON.stringify(records));
      }
    } catch (e) {
      console.warn('Supabase mood_entries query notice:', e);
    }
  }

  // If no records at all, return thoughtful sample initial history
  if (records.length === 0) {
    const now = new Date();
    records = [
      {
        id: 'seed_mood_1',
        user_id: uid,
        mood_score: 8,
        mood_label: 'Calm & Content',
        primary_emotion: 'Calmness / Equilibrium',
        secondary_emotions: ['Joy', 'Peaceful'],
        triggers: ['Nature Walk', 'Music'],
        notes: 'Had a tranquil morning with mindful deep breathing and tea.',
        recorded_at: new Date(now.getTime() - 24 * 3600 * 1000).toISOString()
      },
      {
        id: 'seed_mood_2',
        user_id: uid,
        mood_score: 6,
        mood_label: 'Mildly Restless',
        primary_emotion: 'Anxiety / Stress',
        secondary_emotions: ['Tired', 'Rushed'],
        triggers: ['Workload', 'Deadlines'],
        notes: 'Work was quite busy today, but took a 5-minute breather.',
        recorded_at: new Date(now.getTime() - 48 * 3600 * 1000).toISOString()
      },
      {
        id: 'seed_mood_3',
        user_id: uid,
        mood_score: 9,
        mood_label: 'Joyful & Grateful',
        primary_emotion: 'Joy / Serenity',
        secondary_emotions: ['Gratitude', 'Energetic'],
        triggers: ['Friends', 'Exercise'],
        notes: 'Great conversation with loved ones and finished my daily reflection.',
        recorded_at: new Date(now.getTime() - 72 * 3600 * 1000).toISOString()
      }
    ];
    try {
      localStorage.setItem(storageKey, JSON.stringify(records));
    } catch (e) {}
  }

  return records;
}

// =============================================================
// 2. ACTIVITY LOGS (public.activity_logs)
// =============================================================

export async function saveActivityLogToDb(
  userId: string,
  log: {
    activitySlug: string;
    activityTitle: string;
    durationSeconds: number;
    userRating?: number;
    userReflection?: string;
  }
): Promise<ActivityLogRecord> {
  const uid = resolveUserId(userId);
  const newRecord: ActivityLogRecord = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id: uid,
    activity_slug: log.activitySlug,
    activity_title: log.activityTitle,
    duration_seconds: log.durationSeconds,
    user_rating: log.userRating || 5,
    user_reflection: log.userReflection || '',
    completed_at: new Date().toISOString(),
    status: 'completed'
  };

  const storageKey = `mindmitra_activity_logs_${uid}`;
  try {
    const existing: ActivityLogRecord[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    existing.unshift(newRecord);
    localStorage.setItem(storageKey, JSON.stringify(existing.slice(0, 100)));
  } catch (e) {}

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('activity_logs').insert([
        {
          user_id: uid,
          activity_id: log.activitySlug,
          duration_seconds: log.durationSeconds,
          user_rating: log.userRating || 5,
          user_reflection: log.userReflection || '',
          status: 'completed',
          completed_at: newRecord.completed_at
        }
      ]);
    } catch (e) {
      console.warn('Supabase activity_logs insert notice:', e);
    }
  }

  return newRecord;
}

export async function getActivityLogsFromDb(userId: string): Promise<ActivityLogRecord[]> {
  const uid = resolveUserId(userId);
  const storageKey = `mindmitra_activity_logs_${uid}`;
  let records: ActivityLogRecord[] = [];

  try {
    records = JSON.parse(localStorage.getItem(storageKey) || '[]');
  } catch (e) {}

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', uid)
        .order('completed_at', { ascending: false })
        .limit(30);

      if (!error && data && data.length > 0) {
        records = data.map((d: any) => ({
          id: d.id,
          user_id: d.user_id,
          activity_slug: d.activity_id || 'meditation',
          activity_title: d.activity_title || 'Mindful Session',
          duration_seconds: d.duration_seconds || 300,
          user_rating: d.user_rating || 5,
          user_reflection: d.user_reflection || '',
          completed_at: d.completed_at || d.created_at || new Date().toISOString(),
          status: d.status || 'completed'
        }));
        localStorage.setItem(storageKey, JSON.stringify(records));
      }
    } catch (e) {}
  }

  if (records.length === 0) {
    const now = new Date();
    records = [
      {
        id: 'act_seed_1',
        user_id: uid,
        activity_slug: '4-7-8-relaxing-breath',
        activity_title: '4-7-8 Deep Relaxation Breath',
        duration_seconds: 300,
        user_rating: 5,
        user_reflection: 'Felt my heart rate gently slow down and shoulders soften.',
        completed_at: new Date(now.getTime() - 3600 * 1000 * 4).toISOString(),
        status: 'completed'
      },
      {
        id: 'act_seed_2',
        user_id: uid,
        activity_slug: 'box-breathing-4-4-4-4',
        activity_title: 'Box Breathing (Sama Vritti)',
        duration_seconds: 240,
        user_rating: 4,
        user_reflection: 'Regained clarity before starting my project tasks.',
        completed_at: new Date(now.getTime() - 3600 * 1000 * 28).toISOString(),
        status: 'completed'
      }
    ];
    try {
      localStorage.setItem(storageKey, JSON.stringify(records));
    } catch (e) {}
  }

  return records;
}

// =============================================================
// 3. JOURNAL ENTRIES
// =============================================================

export async function saveJournalEntryToDb(
  userId: string,
  entry: {
    title: string;
    content: string;
    promptUsed?: string;
    detectedEmotion?: string;
    tags?: string[];
  }
): Promise<JournalEntryRecord> {
  const uid = resolveUserId(userId);
  const newRecord: JournalEntryRecord = {
    id: `jnl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    user_id: uid,
    title: entry.title.trim() || 'Evening Reflection',
    content: entry.content.trim(),
    prompt_used: entry.promptUsed,
    detected_emotion: entry.detectedEmotion || 'Calmness / Equilibrium',
    tags: entry.tags || ['Reflection'],
    created_at: new Date().toISOString()
  };

  const storageKey = `mindmitra_journal_entries_${uid}`;
  try {
    const existing: JournalEntryRecord[] = JSON.parse(localStorage.getItem(storageKey) || '[]');
    existing.unshift(newRecord);
    localStorage.setItem(storageKey, JSON.stringify(existing.slice(0, 100)));
  } catch (e) {}

  // Also record as a mood reflection in Supabase mood_entries if applicable
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('mood_entries').insert([
        {
          user_id: uid,
          mood_score: 7,
          mood_label: newRecord.detected_emotion || 'Reflective',
          primary_emotion: newRecord.detected_emotion || 'Calmness / Equilibrium',
          notes: `${newRecord.title}\n\n${newRecord.content}`,
          recorded_at: newRecord.created_at
        }
      ]);
    } catch (e) {}
  }

  return newRecord;
}

export async function getJournalEntriesFromDb(userId: string): Promise<JournalEntryRecord[]> {
  const uid = resolveUserId(userId);
  const storageKey = `mindmitra_journal_entries_${uid}`;
  let records: JournalEntryRecord[] = [];

  try {
    records = JSON.parse(localStorage.getItem(storageKey) || '[]');
  } catch (e) {}

  if (records.length === 0) {
    const now = new Date();
    records = [
      {
        id: 'seed_jnl_1',
        user_id: uid,
        title: 'Finding Stillness Amidst the Noise',
        content: 'Today was intense with back-to-back tasks, but taking 3 minutes to breathe by the window brought immediate clarity. Remembering that not everything is urgent has given me space to recharge.',
        prompt_used: 'What is one worry you can gently release for today?',
        detected_emotion: 'Calmness / Equilibrium',
        tags: ['Patience', 'Breathing'],
        created_at: new Date(now.getTime() - 3600 * 1000 * 18).toISOString()
      },
      {
        id: 'seed_jnl_2',
        user_id: uid,
        title: 'Gratitude for Small Connections',
        content: 'Felt very grateful for the thoughtful call from a close friend today. It reminded me how much simple kindness can lift our spirits.',
        prompt_used: 'Who or what brought comfort to your heart recently?',
        detected_emotion: 'Joy / Serenity',
        tags: ['Gratitude', 'Friendship'],
        created_at: new Date(now.getTime() - 3600 * 1000 * 42).toISOString()
      }
    ];
    try {
      localStorage.setItem(storageKey, JSON.stringify(records));
    } catch (e) {}
  }

  return records;
}

// =============================================================
// 4. WELLNESS GOALS & HABITS
// =============================================================

const DEFAULT_GOALS: WellnessGoalRecord[] = [
  {
    id: 'goal_meditation',
    title: 'Daily Mindful Breathing (5 Mins)',
    category: 'mindfulness',
    target_per_week: 5,
    completed_days: [],
    streak: 3
  },
  {
    id: 'goal_gratitude',
    title: 'Morning Positive Affirmation',
    category: 'reflection',
    target_per_week: 7,
    completed_days: [],
    streak: 5
  },
  {
    id: 'goal_hydration',
    title: 'Hydration & Posture Reset Breaks',
    category: 'body',
    target_per_week: 6,
    completed_days: [],
    streak: 2
  },
  {
    id: 'goal_winddown',
    title: 'Screen-Free Wind-down Before Sleep',
    category: 'rest',
    target_per_week: 4,
    completed_days: [],
    streak: 1
  }
];

export async function getWellnessGoals(userId: string): Promise<WellnessGoalRecord[]> {
  const uid = resolveUserId(userId);
  const storageKey = `mindmitra_goals_${uid}`;
  let goals: WellnessGoalRecord[] = [];

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) goals = JSON.parse(raw);
  } catch (e) {}

  if (!goals || goals.length === 0) {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    goals = DEFAULT_GOALS.map(g => ({
      ...g,
      completed_days: g.streak > 2 ? [yesterday, today] : [yesterday]
    }));
    try {
      localStorage.setItem(storageKey, JSON.stringify(goals));
    } catch (e) {}
  }

  return goals;
}

export async function toggleGoalCompletion(
  userId: string,
  goalId: string,
  dateStr?: string
): Promise<WellnessGoalRecord[]> {
  const uid = resolveUserId(userId);
  const storageKey = `mindmitra_goals_${uid}`;
  const targetDate = dateStr || new Date().toISOString().split('T')[0];

  const goals = await getWellnessGoals(uid);
  const updated = goals.map(g => {
    if (g.id !== goalId) return g;
    const isDone = g.completed_days.includes(targetDate);
    const newCompleted = isDone
      ? g.completed_days.filter(d => d !== targetDate)
      : [...g.completed_days, targetDate];

    const newStreak = isDone ? Math.max(0, g.streak - 1) : g.streak + 1;
    return {
      ...g,
      completed_days: newCompleted,
      streak: newStreak
    };
  });

  try {
    localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch (e) {}

  return updated;
}

export async function addCustomWellnessGoal(
  userId: string,
  title: string,
  category: 'mindfulness' | 'body' | 'reflection' | 'rest',
  targetPerWeek: number
): Promise<WellnessGoalRecord[]> {
  const uid = resolveUserId(userId);
  const storageKey = `mindmitra_goals_${uid}`;
  const goals = await getWellnessGoals(uid);

  const newGoal: WellnessGoalRecord = {
    id: `goal_${Date.now()}`,
    title: title.trim(),
    category,
    target_per_week: targetPerWeek,
    completed_days: [],
    streak: 0
  };

  const updated = [...goals, newGoal];
  try {
    localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch (e) {}

  return updated;
}

// =============================================================
// 5. APPOINTMENTS & SANCTUARY CALENDAR
// =============================================================

const INITIAL_APPOINTMENTS: AppointmentRecord[] = [
  {
    id: 'apt_1',
    title: 'Mindful Stress Reduction Session',
    provider_name: 'Dr. Sarah Jenkins',
    provider_role: 'Licensed Clinical Psychologist',
    appointment_date: 'Tomorrow',
    appointment_time: '10:30 AM',
    type: 'therapy',
    status: 'confirmed',
    notes: 'Bi-weekly cognitive check-in and grounding review.',
    meeting_link: 'https://meet.mindmitra.ai/sanctuary-101'
  },
  {
    id: 'apt_2',
    title: 'Weekly Calm Collective Circle',
    provider_name: 'MindMitra Community Facilitator',
    provider_role: 'Certified Breathwork Coach',
    appointment_date: 'Thursday',
    appointment_time: '06:00 PM',
    type: 'meditation_circle',
    status: 'confirmed',
    notes: 'Group gentle breathwork and calming reflections.',
    meeting_link: 'https://meet.mindmitra.ai/circle-evening'
  }
];

export async function getAppointments(userId: string): Promise<AppointmentRecord[]> {
  const uid = resolveUserId(userId);
  const storageKey = `mindmitra_appointments_${uid}`;
  let appointments: AppointmentRecord[] = [];

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) appointments = JSON.parse(raw);
  } catch (e) {}

  if (!appointments || appointments.length === 0) {
    appointments = INITIAL_APPOINTMENTS;
    try {
      localStorage.setItem(storageKey, JSON.stringify(appointments));
    } catch (e) {}
  }

  return appointments;
}

export async function bookNewAppointment(
  userId: string,
  appointment: {
    title: string;
    providerName: string;
    providerRole: string;
    date: string;
    time: string;
    type: 'therapy' | 'meditation_circle' | 'coaching' | 'checkin';
    notes?: string;
  }
): Promise<AppointmentRecord[]> {
  const uid = resolveUserId(userId);
  const storageKey = `mindmitra_appointments_${uid}`;
  const existing = await getAppointments(uid);

  const newApt: AppointmentRecord = {
    id: `apt_${Date.now()}`,
    title: appointment.title.trim(),
    provider_name: appointment.providerName.trim(),
    provider_role: appointment.providerRole.trim(),
    appointment_date: appointment.date,
    appointment_time: appointment.time,
    type: appointment.type,
    status: 'confirmed',
    notes: appointment.notes || '',
    meeting_link: 'https://meet.mindmitra.ai/session-join'
  };

  const updated = [newApt, ...existing];
  try {
    localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch (e) {}

  return updated;
}

export async function cancelAppointment(userId: string, appointmentId: string): Promise<AppointmentRecord[]> {
  const uid = resolveUserId(userId);
  const storageKey = `mindmitra_appointments_${uid}`;
  const existing = await getAppointments(uid);
  const updated = existing.filter(a => a.id !== appointmentId);
  try {
    localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch (e) {}
  return updated;
}

// =============================================================
// 6. COMMUNITY SANCTUARY POSTS
// =============================================================

const INITIAL_COMMUNITY_POSTS: CommunityPostRecord[] = [
  {
    id: 'post_1',
    author_alias: 'CalmRivers',
    title: 'Recognizing burnout before it overwhelms you',
    content: 'For months I kept pushing past exhaustion thinking tomorrow would be better. Yesterday I finally stepped away from my laptop, practiced Box Breathing for 5 minutes, and slept early. It made a world of difference.',
    tag: 'Burnout Relief',
    timestamp: '2 hours ago',
    reactions: { warmth: 18, support: 14, gratitude: 9 }
  },
  {
    id: 'post_2',
    author_alias: 'MorningBloom',
    title: 'A gentle reminder to celebrate micro-wins',
    content: 'Even getting out of bed, drinking a glass of water, and taking three conscious breaths is a meaningful victory on tough days. You do not have to conquer everything all at once.',
    tag: 'Daily Encouragement',
    timestamp: '5 hours ago',
    reactions: { warmth: 34, support: 22, gratitude: 16 }
  },
  {
    id: 'post_3',
    author_alias: 'QuietSeeker',
    title: 'The 4-7-8 breathing technique really works for night anxiety',
    content: 'Whenever racing thoughts hit around midnight, doing 4 cycles of 4-7-8 breath calms my chest tightness within minutes. Sharing in case someone else is having a restless evening.',
    tag: 'Sleep & Night Calm',
    timestamp: 'Yesterday',
    reactions: { warmth: 27, support: 19, gratitude: 24 }
  }
];

export async function getCommunityPosts(): Promise<CommunityPostRecord[]> {
  const storageKey = 'mindmitra_community_posts';
  let posts: CommunityPostRecord[] = [];

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) posts = JSON.parse(raw);
  } catch (e) {}

  if (!posts || posts.length === 0) {
    posts = INITIAL_COMMUNITY_POSTS;
    try {
      localStorage.setItem(storageKey, JSON.stringify(posts));
    } catch (e) {}
  }

  return posts;
}

export async function addCommunityPost(post: {
  authorAlias?: string;
  title: string;
  content: string;
  tag: string;
}): Promise<CommunityPostRecord[]> {
  const storageKey = 'mindmitra_community_posts';
  const existing = await getCommunityPosts();

  const newPost: CommunityPostRecord = {
    id: `post_${Date.now()}`,
    author_alias: post.authorAlias?.trim() || 'MindfulCompanion',
    title: post.title.trim(),
    content: post.content.trim(),
    tag: post.tag || 'Reflections',
    timestamp: 'Just now',
    reactions: { warmth: 1, support: 1, gratitude: 0 }
  };

  const updated = [newPost, ...existing];
  try {
    localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch (e) {}

  return updated;
}

export async function reactToCommunityPost(
  postId: string,
  reaction: 'warmth' | 'support' | 'gratitude'
): Promise<CommunityPostRecord[]> {
  const storageKey = 'mindmitra_community_posts';
  const existing = await getCommunityPosts();

  const updated = existing.map(p => {
    if (p.id !== postId) return p;
    return {
      ...p,
      reactions: {
        ...p.reactions,
        [reaction]: p.reactions[reaction] + 1
      }
    };
  });

  try {
    localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch (e) {}

  return updated;
}

// =============================================================
// 7. USER PREFERENCES (public.user_preferences)
// =============================================================

export async function getUserPreferences(userId: string): Promise<UserPreferencesRecord> {
  const uid = resolveUserId(userId);
  const storageKey = `mindmitra_preferences_${uid}`;

  const defaultPrefs: UserPreferencesRecord = {
    preferred_language: 'en',
    communication_style: 'empathetic',
    daily_reminder_enabled: true,
    daily_reminder_time: '09:00',
    push_notifications: true,
    email_notifications: false,
    theme: 'light'
  };

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) return { ...defaultPrefs, ...JSON.parse(raw) };
  } catch (e) {}

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', uid)
        .single();

      if (!error && data) {
        const mapped: UserPreferencesRecord = {
          preferred_language: data.preferred_language || 'en',
          communication_style: data.communication_style || 'empathetic',
          daily_reminder_enabled: data.daily_reminder_enabled ?? true,
          daily_reminder_time: data.daily_reminder_time || '09:00',
          push_notifications: data.push_notifications ?? true,
          email_notifications: data.email_notifications ?? false,
          theme: data.theme || 'light'
        };
        localStorage.setItem(storageKey, JSON.stringify(mapped));
        return mapped;
      }
    } catch (e) {}
  }

  return defaultPrefs;
}

export async function saveUserPreferencesToDb(
  userId: string,
  prefs: Partial<UserPreferencesRecord>
): Promise<UserPreferencesRecord> {
  const uid = resolveUserId(userId);
  const storageKey = `mindmitra_preferences_${uid}`;
  const current = await getUserPreferences(uid);
  const updated = { ...current, ...prefs };

  try {
    localStorage.setItem(storageKey, JSON.stringify(updated));
  } catch (e) {}

  if (isSupabaseConfigured()) {
    try {
      await supabase.from('user_preferences').upsert([
        {
          user_id: uid,
          preferred_language: updated.preferred_language,
          communication_style: updated.communication_style,
          daily_reminder_enabled: updated.daily_reminder_enabled,
          daily_reminder_time: updated.daily_reminder_time,
          push_notifications: updated.push_notifications,
          email_notifications: updated.email_notifications,
          theme: updated.theme
        }
      ]);
    } catch (e) {
      console.warn('Supabase user_preferences upsert note:', e);
    }
  }

  return updated;
}
