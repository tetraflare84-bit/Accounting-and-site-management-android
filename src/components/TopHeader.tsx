import React from 'react';
import { PWAInstallButton } from './PWAInstallButton';
import { CompanyProfile } from '../types';
import { Leaf, Camera } from 'lucide-react';

interface TopHeaderProps {
  profile: CompanyProfile;
  activeTab: string;
  onNavigateTab: (tab: string) => void;
  onQuickScanReceipt: () => void;
  onQuickNewEstimate?: () => void;
  onQuickNewInvoice?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  profile,
  activeTab,
  onNavigateTab,
  onQuickScanReceipt,
  onQuickNewEstimate,
  onQuickNewInvoice,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-emerald-950/10 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Zone 1: Wordmark / Brand element (Single line) */}
        <div
          onClick={() => onNavigateTab('dashboard')}
          className="flex cursor-pointer items-center gap-2.5 whitespace-nowrap shrink-0"
        >
          {profile.logoUri ? (
            <img
              src={profile.logoUri}
              alt={profile.name}
              className="h-8 w-8 rounded-full border border-emerald-600/30 object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-800 text-white">
              <Leaf className="h-4 w-4" />
            </div>
          )}
          <div className="flex items-baseline gap-1.5">
            <span className="font-extrabold tracking-tight text-emerald-950 text-base sm:text-lg">
              PlantPro
            </span>
            <span className="hidden sm:inline text-xs text-slate-500 font-medium">
              · {profile.name}
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-4 text-xs font-semibold text-slate-600">
          <button
            onClick={() => onNavigateTab('dashboard')}
            className={`whitespace-nowrap shrink-0 transition hover:text-emerald-900 ${
              activeTab === 'dashboard' ? 'text-emerald-800 font-bold border-b-2 border-emerald-800 pb-0.5' : ''
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigateTab('expenses')}
            className={`whitespace-nowrap shrink-0 transition hover:text-emerald-900 ${
              activeTab === 'expenses' ? 'text-emerald-800 font-bold border-b-2 border-emerald-800 pb-0.5' : ''
            }`}
          >
            Expenses & OCR
          </button>
          <button
            onClick={() => onNavigateTab('invoices')}
            className={`whitespace-nowrap shrink-0 transition hover:text-emerald-900 ${
              activeTab === 'invoices' ? 'text-emerald-800 font-bold border-b-2 border-emerald-800 pb-0.5' : ''
            }`}
          >
            Invoices & Quotes
          </button>
          <button
            onClick={() => onNavigateTab('sites')}
            className={`whitespace-nowrap shrink-0 transition hover:text-emerald-900 ${
              activeTab === 'sites' ? 'text-emerald-800 font-bold border-b-2 border-emerald-800 pb-0.5' : ''
            }`}
          >
            Sites & Photos
          </button>
          <button
            onClick={() => onNavigateTab('clock')}
            className={`whitespace-nowrap shrink-0 transition hover:text-emerald-900 ${
              activeTab === 'clock' ? 'text-emerald-800 font-bold border-b-2 border-emerald-800 pb-0.5' : ''
            }`}
          >
            Time Clock
          </button>
          <button
            onClick={() => onNavigateTab('reports')}
            className={`whitespace-nowrap shrink-0 transition hover:text-emerald-900 ${
              activeTab === 'reports' ? 'text-emerald-800 font-bold border-b-2 border-emerald-800 pb-0.5' : ''
            }`}
          >
            Reports
          </button>
          <button
            onClick={() => onNavigateTab('guide')}
            className={`whitespace-nowrap shrink-0 transition hover:text-emerald-900 ${
              activeTab === 'guide' ? 'text-emerald-800 font-bold border-b-2 border-emerald-800 pb-0.5' : ''
            }`}
          >
            User Guide
          </button>
          <button
            onClick={() => onNavigateTab('settings')}
            className={`whitespace-nowrap shrink-0 transition hover:text-emerald-900 ${
              activeTab === 'settings' ? 'text-emerald-800 font-bold border-b-2 border-emerald-800 pb-0.5' : ''
            }`}
          >
            Settings
          </button>
        </nav>

        {/* Zone 3: Prominent Quick Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {onQuickNewEstimate && (
            <button
              onClick={onQuickNewEstimate}
              className="hidden sm:flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-bold text-amber-900 hover:bg-amber-100 transition active:scale-95 whitespace-nowrap"
              title="Create new Job Quote or Estimate"
            >
              <span className="text-amber-700 font-bold">+</span>
              <span>Quote</span>
            </button>
          )}
          {onQuickNewInvoice && (
            <button
              onClick={onQuickNewInvoice}
              className="hidden sm:flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition active:scale-95 whitespace-nowrap"
              title="Create new billable Invoice"
            >
              <span className="text-emerald-700 font-bold">+</span>
              <span>Invoice</span>
            </button>
          )}
          <button
            onClick={onQuickScanReceipt}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800 transition active:scale-95 whitespace-nowrap shrink-0"
            title="Scan Receipt with AI Camera"
          >
            <Camera className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Scan Receipt</span>
          </button>
          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};
