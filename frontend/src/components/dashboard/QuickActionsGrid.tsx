import React from 'react';
import { PhoneCall, UserCheck, ShieldCheck, Briefcase } from 'lucide-react';

interface QuickActionsGridProps {
  onEmergencyHelp?: () => void;
  onFindTherapist?: () => void;
  onCrisisResources?: () => void;
  onSelfCareTools?: () => void;
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  onEmergencyHelp,
  onFindTherapist,
  onCrisisResources,
  onSelfCareTools
}) => {
  const items = [
    {
      id: 'emergency',
      label: 'Emergency Help',
      icon: PhoneCall,
      bgColor: 'bg-[#FDEEEF] hover:bg-[#FCDADF]',
      textColor: 'text-[#E53E3E]',
      iconColor: 'text-[#E53E3E]',
      onClick: onEmergencyHelp
    },
    {
      id: 'therapist',
      label: 'Find a Therapist',
      icon: UserCheck,
      bgColor: 'bg-[#E8F5E9] hover:bg-[#D8F3DC]',
      textColor: 'text-[#2D6A4F]',
      iconColor: 'text-[#2D6A4F]',
      onClick: onFindTherapist
    },
    {
      id: 'crisis',
      label: 'Crisis Resources',
      icon: ShieldCheck,
      bgColor: 'bg-[#E3F2FD] hover:bg-[#BBDEFB]',
      textColor: 'text-[#1976D2]',
      iconColor: 'text-[#1976D2]',
      onClick: onCrisisResources
    },
    {
      id: 'tools',
      label: 'Self-Care Tools',
      icon: Briefcase,
      bgColor: 'bg-[#F3E5F5] hover:bg-[#E1BEE7]',
      textColor: 'text-[#7B1FA2]',
      iconColor: 'text-[#7B1FA2]',
      onClick: onSelfCareTools
    }
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-[#1B4332]">Quick Actions</h3>

      <div className="grid grid-cols-2 gap-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`p-4 rounded-2xl ${item.bgColor} border border-transparent flex flex-col items-center justify-center text-center transition-all cursor-pointer group hover:shadow-md transform hover:-translate-y-0.5 space-y-2 h-24`}
            >
              <div className="p-2 rounded-xl bg-white/60 group-hover:bg-white group-hover:scale-110 transition-all">
                <Icon className={`w-5 h-5 ${item.iconColor}`} />
              </div>
              <span className={`text-xs font-bold ${item.textColor} leading-tight`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
