import React from 'react';
import { 
  LayoutDashboard, 
  Smile, 
  Heart, 
  Wind, 
  BookOpen, 
  Compass, 
  Users, 
  Calendar, 
  Target, 
  Settings, 
  HelpCircle,
  Sprout
} from 'lucide-react';

export type SidebarTab = 
  | 'dashboard' 
  | 'mood' 
  | 'self-care' 
  | 'meditation' 
  | 'journaling' 
  | 'resources' 
  | 'community' 
  | 'appointments' 
  | 'goals' 
  | 'settings' 
  | 'help';

interface SidebarProps {
  activeTab: SidebarTab;
  onSelectTab: (tab: SidebarTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onSelectTab }) => {
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'mood', label: 'Mood Tracking', icon: Smile },
    { id: 'self-care', label: 'Self-Care', icon: Heart },
    { id: 'meditation', label: 'Meditation & Breathing', icon: Wind },
    { id: 'journaling', label: 'Journaling', icon: BookOpen },
    { id: 'resources', label: 'Resources', icon: Compass },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'goals', label: 'Goals', icon: Target },
  ];

  const bottomNavItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 bg-[#f8faf8] border-r border-[#e5ebe6] flex flex-col justify-between p-5 min-h-screen text-slate-700 shrink-0">
      
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-2xl bg-[#2D6A4F] flex items-center justify-center text-white shadow-md shadow-emerald-900/10">
            <Sprout className="w-6 h-6 text-emerald-100" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1B4332] tracking-tight leading-none font-serif">
              MindMitra.AI
            </h1>
            <p className="text-[10px] text-[#40916C] font-medium mt-1 leading-tight">
              A Calmer You, A Brighter Tomorrow
            </p>
          </div>
        </div>

        {/* Main Navigation List */}
        <nav className="space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as SidebarTab)}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#E2F0D9] text-[#2D6A4F] shadow-xs'
                    : 'text-slate-600 hover:text-[#2D6A4F] hover:bg-[#edf4ee]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#2D6A4F]' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-5 pt-4 border-t border-[#e5ebe6]">
        {/* Bottom Nav Items */}
        <nav className="space-y-1">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as SidebarTab)}
                className={`w-full flex items-center gap-3.5 px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#E2F0D9] text-[#2D6A4F] shadow-xs'
                    : 'text-slate-600 hover:text-[#2D6A4F] hover:bg-[#edf4ee]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#2D6A4F]' : 'text-slate-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Small Encouragement Card */}
        <div className="p-3.5 rounded-2xl bg-[#eaf4eb] border border-[#d8e8dc] flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#2D6A4F]/10 flex items-center justify-center shrink-0">
            <Sprout className="w-4 h-4 text-[#2D6A4F]" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#1B4332] leading-snug">You're doing great!</p>
            <p className="text-[10px] text-slate-600 leading-tight">Small steps make big changes.</p>
          </div>
        </div>
      </div>

    </aside>
  );
};
