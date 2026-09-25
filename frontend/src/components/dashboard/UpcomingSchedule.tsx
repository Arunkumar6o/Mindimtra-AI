import React from 'react';
import { Calendar, Sprout, Users, ChevronRight } from 'lucide-react';

interface UpcomingItem {
  id: string;
  title: string;
  time: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

interface UpcomingScheduleProps {
  onSeeAll?: () => void;
  onSelectItem?: (id: string) => void;
}

export const UpcomingSchedule: React.FC<UpcomingScheduleProps> = ({
  onSeeAll,
  onSelectItem
}) => {
  const events: UpcomingItem[] = [
    {
      id: '1',
      title: 'Therapy Session',
      time: 'Tomorrow, 10:00 AM',
      icon: Calendar,
      iconBg: 'bg-[#F3E5F5]',
      iconColor: 'text-[#7B1FA2]'
    },
    {
      id: '2',
      title: 'Mindfulness Workshop',
      time: 'Sat, 15 Mar, 2:00 PM',
      icon: Sprout,
      iconBg: 'bg-[#E8F5E9]',
      iconColor: 'text-[#2D6A4F]'
    },
    {
      id: '3',
      title: 'Community Circle',
      time: 'Sun, 16 Mar, 5:00 PM',
      icon: Users,
      iconBg: 'bg-[#FFF3E0]',
      iconColor: 'text-[#E65100]'
    }
  ];

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#e5ebe6] shadow-xs space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#1B4332]">Upcoming</h3>
        <button
          onClick={onSeeAll}
          className="text-xs font-semibold text-[#1976D2] hover:underline cursor-pointer"
        >
          See All
        </button>
      </div>

      {/* Events List */}
      <div className="space-y-3">
        {events.map((evt) => {
          const Icon = evt.icon;
          return (
            <div
              key={evt.id}
              onClick={() => onSelectItem && onSelectItem(evt.id)}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-[#f4f7f5] transition-colors cursor-pointer group border border-slate-100 hover:border-slate-200"
            >
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${evt.iconBg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${evt.iconColor}`} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 leading-snug group-hover:text-[#2D6A4F] transition-colors">
                    {evt.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {evt.time}
                  </p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all shrink-0" />
            </div>
          );
        })}
      </div>

    </div>
  );
};
