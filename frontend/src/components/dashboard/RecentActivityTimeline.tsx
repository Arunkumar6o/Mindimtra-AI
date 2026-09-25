import React from 'react';
import { Sprout, Smile, BookOpen, Users } from 'lucide-react';

interface ActivityItem {
  id: string;
  action: string;
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

interface RecentActivityTimelineProps {
  onSeeAll?: () => void;
}

export const RecentActivityTimeline: React.FC<RecentActivityTimelineProps> = ({ onSeeAll }) => {
  const activities: ActivityItem[] = [
    {
      id: '1',
      action: 'Completed 5-min breathing',
      timestamp: 'Today, 8:15 AM',
      icon: Sprout,
      iconBg: 'bg-[#E8F5E9]',
      iconColor: 'text-[#2D6A4F]'
    },
    {
      id: '2',
      action: 'Mood logged: Calm',
      timestamp: 'Today, 7:50 AM',
      icon: Smile,
      iconBg: 'bg-[#FFF3E0]',
      iconColor: 'text-[#E65100]'
    },
    {
      id: '3',
      action: 'Read: Ways to Manage Stress',
      timestamp: 'Yesterday, 6:30 PM',
      icon: BookOpen,
      iconBg: 'bg-[#E3F2FD]',
      iconColor: 'text-[#1976D2]'
    },
    {
      id: '4',
      action: 'Joined Community Discussion',
      timestamp: 'Yesterday, 4:20 PM',
      icon: Users,
      iconBg: 'bg-[#F3E5F5]',
      iconColor: 'text-[#7B1FA2]'
    }
  ];

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#e5ebe6] shadow-xs space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-[#1B4332]">Recent Activity</h3>
        <button
          onClick={onSeeAll}
          className="text-xs font-semibold text-[#1976D2] hover:underline cursor-pointer"
        >
          See All
        </button>
      </div>

      {/* Activity Timeline List */}
      <div className="space-y-3.5 relative">
        
        {/* Connecting vertical timeline line */}
        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-100 pointer-events-none" />

        {activities.map((act) => {
          const Icon = act.icon;
          return (
            <div key={act.id} className="flex items-center gap-3.5 relative z-10 group">
              <div className={`w-8 h-8 rounded-full ${act.iconBg} flex items-center justify-center shrink-0 border border-white shadow-xs group-hover:scale-110 transition-transform`}>
                <Icon className={`w-4 h-4 ${act.iconColor}`} />
              </div>

              <div className="flex-1 border-b border-slate-100 pb-2.5 group-last:border-none">
                <p className="text-xs font-bold text-slate-800 group-hover:text-[#2D6A4F] transition-colors leading-snug">
                  {act.action}
                </p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  {act.timestamp}
                </p>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
