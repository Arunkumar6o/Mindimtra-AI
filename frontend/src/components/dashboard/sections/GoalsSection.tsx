import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Flame, 
  CheckCircle2, 
  Plus, 
  Award
} from 'lucide-react';
import { 
  getWellnessGoals, 
  toggleGoalCompletion, 
  addCustomWellnessGoal, 
  type WellnessGoalRecord 
} from '../../../services/sanctuaryDbService';

interface GoalsSectionProps {
  user?: { id?: string; email?: string; name?: string } | null;
}

export const GoalsSection: React.FC<GoalsSectionProps> = ({ user }) => {
  const userId = user?.id || '00000000-0000-0000-0000-000000000001';

  const [goals, setGoals] = useState<WellnessGoalRecord[]>([]);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<'mindfulness' | 'body' | 'reflection' | 'rest'>('mindfulness');
  const [targetPerWeek, setTargetPerWeek] = useState<number>(5);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const todayStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    getWellnessGoals(userId).then(g => setGoals(g));
  }, [userId]);

  const handleToggle = async (goalId: string) => {
    const updated = await toggleGoalCompletion(userId, goalId, todayStr);
    setGoals(updated);
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const updated = await addCustomWellnessGoal(userId, newTitle, newCategory, targetPerWeek);
    setGoals(updated);
    setNewTitle('');
    setShowAddForm(false);
  };

  const completedTodayCount = goals.filter(g => g.completed_days.includes(todayStr)).length;
  const progressPercent = goals.length > 0 ? Math.round((completedTodayCount / goals.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#eaf4eb] via-[#f7f5fa] to-[#faeee7] p-6 rounded-3xl border border-[#d8e8dc] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#2D6A4F]/20 text-[#2D6A4F] text-xs font-bold">
            <Target className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>Emotional Well-being Habit Tracker</span>
          </div>
          <h2 className="text-2xl font-black text-[#1B4332] tracking-tight">
            Small Daily Steps, Big Changes
          </h2>
          <p className="text-xs text-slate-600 max-w-xl">
            Cultivate consistency with micro-habits. Daily check-ins, mindful breathing, and restful pauses build emotional resilience.
          </p>
        </div>

        {/* Today's Habit Progress Card */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 text-center shadow-xs shrink-0 min-w-[150px]">
          <div className="text-2xl font-black text-[#2D6A4F] tracking-tight">
            {completedTodayCount} / {goals.length}
          </div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide block">
            Completed Today ({progressPercent}%)
          </span>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-[#2D6A4F] h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
        </div>
      </div>

      {/* Main Habits List */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5ebe6] shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-[#1B4332] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#2D6A4F]" />
              <span>Today's Sanctuary Goals & Streaks</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Tap the checkmark to record your completion for today.
            </p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 rounded-xl bg-[#E8F5E9] hover:bg-[#D8F3DC] text-[#2D6A4F] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Custom Goal</span>
          </button>
        </div>

        {/* Add Goal Collapsible Form */}
        {showAddForm && (
          <form onSubmit={handleAddGoal} className="p-4 rounded-2xl bg-[#fafcfb] border border-slate-200 space-y-4 animate-fadeIn">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Create a New Mindful Habit</h4>
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <div className="sm:col-span-5">
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. 10-minute nature walk without phone"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2D6A4F]"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-[#2D6A4F]"
                >
                  <option value="mindfulness">Mindfulness</option>
                  <option value="reflection">Reflection</option>
                  <option value="body">Body</option>
                  <option value="rest">Rest</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <select
                  value={targetPerWeek}
                  onChange={e => setTargetPerWeek(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-[#2D6A4F]"
                >
                  <option value={3}>3 days/wk</option>
                  <option value={5}>5 days/wk</option>
                  <option value={7}>Every day</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-[#2D6A4F] hover:bg-[#1B4332] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Save Goal
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Goals Grid */}
        <div className="space-y-3">
          {goals.map(goal => {
            const isCompletedToday = goal.completed_days.includes(todayStr);
            return (
              <div
                key={goal.id}
                onClick={() => handleToggle(goal.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  isCompletedToday
                    ? 'bg-[#E8F5E9]/60 border-[#2D6A4F]/40 shadow-xs'
                    : 'bg-[#fafcfb] hover:bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <button
                    type="button"
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      isCompletedToday
                        ? 'bg-[#2D6A4F] text-white shadow-xs'
                        : 'border border-slate-300 bg-white text-transparent hover:border-[#2D6A4F]'
                    }`}
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>

                  <div>
                    <h4 className={`text-xs sm:text-sm font-bold ${isCompletedToday ? 'text-[#1B4332] line-through opacity-85' : 'text-slate-800'}`}>
                      {goal.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 capitalize">
                      Category: {goal.category} • Target: {goal.target_per_week} days/week
                    </span>
                  </div>
                </div>

                {/* Streak Badge */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 shadow-xs shrink-0">
                  <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                  <span className="text-xs font-black text-slate-800">{goal.streak}</span>
                  <span className="text-[10px] text-slate-400 font-semibold hidden sm:inline">day streak</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
};

export default GoalsSection;
