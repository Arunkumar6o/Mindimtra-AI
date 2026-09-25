import React from 'react';
import { Wind, Edit3, Heart, Users, ChevronRight } from 'lucide-react';

interface QuickActionsStripProps {
  onStartMeditation?: () => void;
  onWriteJournal?: () => void;
  onCheckMood?: () => void;
  onTalkCommunity?: () => void;
}

export const QuickActionsStrip: React.FC<QuickActionsStripProps> = ({
  onStartMeditation,
  onWriteJournal,
  onCheckMood,
  onTalkCommunity
}) => {
  const actions = [
    {
      id: 'meditation',
      title: 'Start a Meditation',
      icon: Wind,
      bgColor: 'bg-[#E8F5E9] hover:bg-[#D8F3DC]',
      textColor: 'text-[#2D6A4F]',
      iconBg: 'bg-[#2D6A4F]/10',
      iconColor: 'text-[#2D6A4F]',
      onClick: onStartMeditation
    },
    {
      id: 'journal',
      title: 'Write in Journal',
      icon: Edit3,
      bgColor: 'bg-[#F3E5F5] hover:bg-[#E1BEE7]/40',
      textColor: 'text-[#7B1FA2]',
      iconBg: 'bg-[#7B1FA2]/10',
      iconColor: 'text-[#7B1FA2]',
      onClick: onWriteJournal
    },
    {
      id: 'mood',
      title: 'Check Mood',
      icon: Heart,
      bgColor: 'bg-[#FFF3E0] hover:bg-[#FFE0B2]/50',
      textColor: 'text-[#E65100]',
      iconBg: 'bg-[#E65100]/10',
      iconColor: 'text-[#E65100]',
      onClick: onCheckMood
    },
    {
      id: 'community',
      title: 'Talk to Community',
      icon: Users,
      bgColor: 'bg-[#E3F2FD] hover:bg-[#BBDEFB]/50',
      textColor: 'text-[#1976D2]',
      iconBg: 'bg-[#1976D2]/10',
      iconColor: 'text-[#1976D2]',
      onClick: onTalkCommunity
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((act) => {
        const Icon = act.icon;
        return (
          <button
            key={act.id}
            onClick={act.onClick}
            className={`p-4 rounded-2xl ${act.bgColor} border border-transparent transition-all flex items-center justify-between cursor-pointer group shadow-xs hover:shadow-md transform hover:-translate-y-0.5`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${act.iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon className={`w-5 h-5 ${act.iconColor}`} />
              </div>
              <span className={`text-xs sm:text-sm font-bold ${act.textColor} text-left leading-snug`}>
                {act.title}
              </span>
            </div>

            <ChevronRight className={`w-4 h-4 ${act.textColor} opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all shrink-0`} />
          </button>
        );
      })}
    </div>
  );
};
