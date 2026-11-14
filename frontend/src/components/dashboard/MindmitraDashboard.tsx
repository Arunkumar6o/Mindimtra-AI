import React, { useState } from 'react';
import { Sidebar, type SidebarTab } from './Sidebar';
import { TopHeader } from './TopHeader';
import { HeroBanner } from './HeroBanner';
import { QuickActionsStrip } from './QuickActionsStrip';
import { MoodTrackerChart } from './MoodTrackerChart';
import { TodayWellness } from './TodayWellness';
import { DailyAffirmation } from './DailyAffirmation';
import { QuickActionsGrid } from './QuickActionsGrid';
import { UpcomingSchedule } from './UpcomingSchedule';
import { OneMinuteBreatherCard } from './OneMinuteBreatherCard';
import { RecommendedResources } from './RecommendedResources';
import { RecentActivityTimeline } from './RecentActivityTimeline';
import { AIModulesSection } from '../AIModulesSection';
import { LanguageDrawer } from './LanguageDrawer';
import { CheckCircle2, X, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

// Import all newly developed functional sanctuary sections
import { MeditationSection } from './sections/MeditationSection';
import { MoodTrackingSection } from './sections/MoodTrackingSection';
import { SelfCareSection } from './sections/SelfCareSection';
import { JournalingSection } from './sections/JournalingSection';
import { GoalsSection } from './sections/GoalsSection';
import { AppointmentsSection } from './sections/AppointmentsSection';
import { CommunitySection } from './sections/CommunitySection';
import { ResourcesSection } from './sections/ResourcesSection';
import { SettingsSection } from './sections/SettingsSection';

interface MindmitraDashboardProps {
  user: { id?: string; email: string; name: string } | null;
  onLogout: () => void;
  onNavigateToLogin?: () => void;
}

export const MindmitraDashboard: React.FC<MindmitraDashboardProps> = ({
  user,
  onLogout
}) => {
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('dashboard');
  const [activeToast, setActiveToast] = useState<string | null>(null);

  const { t } = useLanguage();
  const userName = user ? user.name.split(' ')[0] : 'Priya';

  const triggerNotification = (message: string) => {
    setActiveToast(message);
    setTimeout(() => {
      setActiveToast(null);
    }, 3500);
  };

  return (
    <div className="flex min-h-screen bg-[#f4f7f5] text-slate-800 font-sans selection:bg-[#2D6A4F] selection:text-white">
      
      {/* Slide Section Language Drawer */}
      <LanguageDrawer
        onLanguageChanged={(lang) => {
          triggerNotification(`${t('applied_language', 'Language updated successfully to')} ${lang.nativeName} (${lang.name})`);
        }}
      />

      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        activeTab={activeSidebarTab}
        onSelectTab={(tab) => {
          setActiveSidebarTab(tab);
          if (tab !== 'dashboard') {
            triggerNotification(`Switched view to ${tab.replace('-', ' ').toUpperCase()}`);
          }
        }}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* 2. Top Header Bar */}
        <TopHeader
          userName={userName}
          onLogout={onLogout}
          onOpenNotifications={() => triggerNotification('You have 2 unread wellness reminders!')}
          onOpenSettings={() => setActiveSidebarTab('settings')}
          onSearch={(query) => {
            if (query.length > 2) triggerNotification(`Searching for "${query}"...`);
          }}
        />

        {/* Dynamic Toast Alert Notification */}
        {activeToast && (
          <div className="fixed top-5 right-5 z-50 animate-fadeIn bg-[#1B4332] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-emerald-500/40 backdrop-blur-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
            <span>{activeToast}</span>
            <button
              onClick={() => setActiveToast(null)}
              className="ml-2 text-emerald-200 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 3. Dashboard Body Grid Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1440px] w-full mx-auto">
          
          {/* Breadcrumb / Back to Dashboard when in sub-views */}
          {activeSidebarTab !== 'dashboard' && (
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
              <button
                onClick={() => setActiveSidebarTab('dashboard')}
                className="flex items-center gap-2 text-xs font-bold text-[#2D6A4F] hover:text-[#1B4332] bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Dashboard Overview</span>
              </button>

              <div className="text-xs text-slate-500 font-medium">
                Sanctuary View: <strong className="text-[#1B4332] capitalize">{activeSidebarTab.replace('-', ' ')}</strong>
              </div>
            </div>
          )}

          {/* VIEW SWITCHER */}
          {activeSidebarTab === 'dashboard' ? (
            <>
              {/* Row 1: Scenic Hero Greeting Banner */}
              <HeroBanner
                userName={userName}
                onOpenMoodCheckIn={() => setActiveSidebarTab('mood')}
              />

              {/* Row 2: Quick Actions 4-Card Strip */}
              <QuickActionsStrip
                onStartMeditation={() => setActiveSidebarTab('meditation')}
                onWriteJournal={() => setActiveSidebarTab('journaling')}
                onCheckMood={() => setActiveSidebarTab('mood')}
                onTalkCommunity={() => setActiveSidebarTab('community')}
              />

              {/* Row 3: Main Mid Section (3-Column Left Grid + Right Sidebar Panel) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                {/* Left 8 Columns (Mood Tracker + Today's Wellness + Daily Affirmation) */}
                <div className="lg:col-span-8 flex flex-col justify-between space-y-6">
                  
                  {/* Subgrid: Mood Tracker (6 cols on lg) + Today's Wellness (6 cols on lg) */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                    <div className="md:col-span-7">
                      <MoodTrackerChart />
                    </div>
                    <div className="md:col-span-5">
                      <TodayWellness />
                    </div>
                  </div>

                  {/* Daily Affirmation Full Card */}
                  <div className="flex-1">
                    <DailyAffirmation />
                  </div>

                </div>

                {/* Right 4 Columns (Quick Actions 2x2 + Upcoming + 1-Min Breather) */}
                <div className="lg:col-span-4 space-y-6">
                  
                  <QuickActionsGrid
                    onEmergencyHelp={() => setActiveSidebarTab('resources')}
                    onFindTherapist={() => setActiveSidebarTab('resources')}
                    onCrisisResources={() => setActiveSidebarTab('resources')}
                    onSelfCareTools={() => setActiveSidebarTab('self-care')}
                  />

                  <UpcomingSchedule
                    onSeeAll={() => setActiveSidebarTab('appointments')}
                    onSelectItem={(id) => triggerNotification(`Opening Event Details #${id}`)}
                  />

                  <OneMinuteBreatherCard 
                    onOpenFullMeditation={() => setActiveSidebarTab('meditation')}
                  />

                </div>

              </div>

              {/* Row 4: Recommended Resources + Recent Activity Feed */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                
                <div className="lg:col-span-7">
                  <RecommendedResources
                    onSeeAll={() => setActiveSidebarTab('resources')}
                  />
                </div>

                <div className="lg:col-span-5">
                  <RecentActivityTimeline
                    onSeeAll={() => setActiveSidebarTab('mood')}
                  />
                </div>

              </div>

              {/* Row 5: AI Sanctuary Suite (Emotion Check-in & AI Companion) */}
              <div className="pt-4">
                <AIModulesSection user={user} />
              </div>
            </>
          ) : activeSidebarTab === 'meditation' ? (
            <MeditationSection user={user} onNavigateHome={() => setActiveSidebarTab('dashboard')} />
          ) : activeSidebarTab === 'mood' ? (
            <MoodTrackingSection user={user} />
          ) : activeSidebarTab === 'self-care' ? (
            <SelfCareSection user={user} />
          ) : activeSidebarTab === 'journaling' ? (
            <JournalingSection user={user} />
          ) : activeSidebarTab === 'goals' ? (
            <GoalsSection user={user} />
          ) : activeSidebarTab === 'appointments' ? (
            <AppointmentsSection user={user} />
          ) : activeSidebarTab === 'community' ? (
            <CommunitySection />
          ) : activeSidebarTab === 'resources' || activeSidebarTab === 'help' ? (
            <ResourcesSection />
          ) : activeSidebarTab === 'settings' ? (
            <SettingsSection user={user} />
          ) : (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-4">
              <h2 className="text-2xl font-bold text-[#1B4332] uppercase tracking-wide">
                {activeSidebarTab} Module
              </h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                You are currently exploring the <strong>{activeSidebarTab}</strong> sanctuary workspace.
              </p>
              <button
                onClick={() => setActiveSidebarTab('dashboard')}
                className="px-6 py-2.5 rounded-2xl bg-[#2D6A4F] text-white font-bold text-xs shadow-md cursor-pointer inline-flex items-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Return to Dashboard Overview</span>
              </button>
            </div>
          )}

        </main>

      </div>

    </div>
  );
};

export default MindmitraDashboard;
