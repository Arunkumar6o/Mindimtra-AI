import React, { useState } from 'react';
import { Search, Bell, ChevronDown, User, LogOut, Settings as SettingsIcon } from 'lucide-react';

interface TopHeaderProps {
  userName?: string;
  onLogout?: () => void;
  onOpenNotifications?: () => void;
  onSearch?: (query: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  userName = 'Priya',
  onLogout,
  onOpenNotifications,
  onSearch
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [hasUnreadNotification, setHasUnreadNotification] = useState(true);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <header className="w-full flex items-center justify-between gap-4 py-4 px-6 bg-[#f4f7f5] border-b border-[#e5ebe6]">
      
      {/* Search Input Box */}
      <div className="relative flex-1 max-w-xl">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search for resources, activities, or support..."
          className="w-full pl-11 pr-4 py-2.5 rounded-full bg-[#eaefea] border border-transparent text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#2D6A4F] focus:bg-white transition-all shadow-inner"
        />
      </div>

      {/* Right User Controls */}
      <div className="flex items-center gap-4">
        
        {/* Notification Bell */}
        <button
          onClick={() => {
            setHasUnreadNotification(false);
            if (onOpenNotifications) onOpenNotifications();
          }}
          className="relative p-2.5 rounded-full bg-white hover:bg-slate-100 border border-slate-200/80 text-slate-600 transition-colors cursor-pointer shadow-xs"
          title="Notifications"
        >
          <Bell className="w-4 h-4 text-slate-600" />
          {hasUnreadNotification && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          )}
        </button>

        {/* User Profile Pill & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-3 p-1.5 pr-3 rounded-full bg-white border border-slate-200/80 hover:border-[#2D6A4F]/40 transition-all cursor-pointer shadow-xs"
          >
            <div className="w-8 h-8 rounded-full bg-[#D8F3DC] border border-[#2D6A4F]/30 flex items-center justify-center overflow-hidden shrink-0">
              <span className="text-xs font-bold text-[#2D6A4F]">P</span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-none">
                Hello, {userName}
              </p>
              <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                Take care today
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Profile Dropdown Popup */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-fadeIn">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{userName}</p>
                <p className="text-[11px] text-slate-500">priya@mindnest.com</p>
              </div>

              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-[#2D6A4F] text-left cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>My Profile</span>
              </button>

              <button
                onClick={() => setShowProfileMenu(false)}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-600 hover:bg-slate-50 hover:text-[#2D6A4F] text-left cursor-pointer"
              >
                <SettingsIcon className="w-3.5 h-3.5" />
                <span>Preferences</span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              {onLogout && (
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 text-left cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              )}
            </div>
          )}
        </div>

      </div>

    </header>
  );
};
