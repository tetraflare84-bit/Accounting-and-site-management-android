import React, { useState } from 'react';
import {
  LayoutDashboard,
  Receipt,
  FileText,
  FolderOpen,
  Clock,
  BarChart3,
  BookOpen,
  Settings,
  MoreHorizontal,
  X,
} from 'lucide-react';

interface BottomTabBarProps {
  activeTab: string;
  onNavigateTab: (tab: string) => void;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  activeTab,
  onNavigateTab,
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'invoices', label: 'Quotes & Inv', icon: FileText },
    { id: 'sites', label: 'Sites', icon: FolderOpen },
    { id: 'clock', label: 'Clock', icon: Clock },
  ];

  const handleTabClick = (tabId: string) => {
    onNavigateTab(tabId);
    setIsMoreMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Bottom Navigation Bar (hidden on desktop md:) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md pb-safe">
        <div className="grid grid-cols-6 items-center h-16 px-1">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex flex-col items-center justify-center h-full min-h-[44px] transition ${
                  isActive ? 'text-emerald-800' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                <span
                  className={`text-[10px] tracking-tight mt-0.5 ${
                    isActive ? 'font-bold text-emerald-900' : 'font-medium'
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* More Menu Trigger */}
          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] transition ${
              ['reports', 'guide', 'settings'].includes(activeTab) || isMoreMenuOpen
                ? 'text-emerald-800'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-[10px] font-medium tracking-tight mt-0.5">More</span>
          </button>
        </div>
      </div>

      {/* Slide-up Action Drawer for Secondary Views */}
      {isMoreMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-black/50 backdrop-blur-xs flex flex-col justify-end">
          <div className="w-full rounded-t-3xl bg-white p-5 shadow-2xl space-y-3 pb-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Operations & Tools
              </span>
              <button
                onClick={() => setIsMoreMenuOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => handleTabClick('reports')}
                className={`w-full flex items-center gap-3 rounded-xl p-3 text-left transition ${
                  activeTab === 'reports' ? 'bg-emerald-50 text-emerald-900' : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Financial Reports</p>
                  <p className="text-xs text-slate-500">P&L statements and client margin rankings</p>
                </div>
              </button>

              <button
                onClick={() => handleTabClick('guide')}
                className={`w-full flex items-center gap-3 rounded-xl p-3 text-left transition ${
                  activeTab === 'guide' ? 'bg-emerald-50 text-emerald-900' : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Employee User Guide</p>
                  <p className="text-xs text-slate-500">Field operating manual & onboarding handbook</p>
                </div>
              </button>

              <button
                onClick={() => handleTabClick('settings')}
                className={`w-full flex items-center gap-3 rounded-xl p-3 text-left transition ${
                  activeTab === 'settings' ? 'bg-emerald-50 text-emerald-900' : 'hover:bg-slate-50 text-slate-800'
                }`}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                  <Settings className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Settings & Cloud Backup</p>
                  <p className="text-xs text-slate-500">Custom categories, Google Drive & vault export</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
