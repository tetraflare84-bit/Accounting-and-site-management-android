import React from 'react';
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Clock,
  Camera,
  FileText,
  MapPin,
  ArrowUpRight,
  ShieldCheck,
  Calendar,
  AlertCircle,
  FolderOpen,
  Calculator,
} from 'lucide-react';
import {
  Expense,
  Invoice,
  Estimate,
  ClientSite,
  TimeLog,
  CompanyProfile,
} from '../types';

interface DashboardViewProps {
  profile: CompanyProfile;
  expenses: Expense[];
  invoices: Invoice[];
  estimates: Estimate[];
  clients: ClientSite[];
  timeLogs: TimeLog[];
  onNavigateTab: (tab: string) => void;
  onOpenNewExpense: (withCamera?: boolean) => void;
  onOpenNewInvoice: () => void;
  onOpenNewEstimate: () => void;
  onSelectClient: (clientId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  expenses,
  invoices,
  estimates,
  clients,
  timeLogs,
  onNavigateTab,
  onOpenNewExpense,
  onOpenNewInvoice,
  onOpenNewEstimate,
  onSelectClient,
}) => {
  // Financial computations
  const totalCollectedRevenue = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.total, 0);

  const pendingReceivables = invoices
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .reduce((sum, i) => sum + i.total, 0);

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalCollectedRevenue - totalExpenses;
  const marginPct =
    totalCollectedRevenue > 0
      ? ((netProfit / totalCollectedRevenue) * 100).toFixed(1)
      : '0.0';

  const totalLoggedHours = (
    timeLogs.reduce((sum, t) => sum + t.durationMinutes, 0) / 60
  ).toFixed(1);

  // Group expenses by category
  const categoryTotals: { [key: string]: number } = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const sortedCategories = Object.entries(categoryTotals).sort(
    (a, b) => b[1] - a[1]
  );

  return (
    <div className="space-y-6">
      {/* Top Welcome / Brand Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {profile.logoUri ? (
              <img
                src={profile.logoUri}
                alt={profile.name}
                className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 border-emerald-400/40 object-cover shadow-lg"
              />
            ) : (
              <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-emerald-700 text-2xl font-bold">
                {profile.name.charAt(0)}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-emerald-300">
                <span>{profile.experienceYears} Years Experience</span>
                <span>·</span>
                <span>Eco-Friendly Yard Care</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {profile.name}
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 font-medium">
                Field Operations & Small Business Bookkeeping Hub
              </p>
            </div>
          </div>

          {/* Quick Primary Actions in thumb zone */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => onOpenNewExpense(true)}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-emerald-950 shadow-md transition hover:bg-emerald-50 active:scale-95"
            >
              <Camera className="h-4 w-4 text-emerald-700" />
              <span>Scan Receipt (AI)</span>
            </button>
            <button
              onClick={onOpenNewEstimate}
              className="flex items-center gap-2 rounded-xl border border-amber-300/50 bg-amber-500/25 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md backdrop-blur-sm transition hover:bg-amber-500/40 active:scale-95"
            >
              <Calculator className="h-4 w-4 text-amber-300" />
              <span>New Estimate / Quote</span>
            </button>
            <button
              onClick={onOpenNewInvoice}
              className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-700/60 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-emerald-700 active:scale-95"
            >
              <FileText className="h-4 w-4" />
              <span>New Invoice</span>
            </button>
          </div>
        </div>

        {/* Subtle background decoration */}
        <div className="absolute -right-8 -bottom-10 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl" />
      </div>

      {/* 4-Card KPI Stat Strip with Tabular Numerals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Revenue Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Collected Revenue</span>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            ${totalCollectedRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            <span className="font-semibold text-amber-600 tabular-nums">
              +${pendingReceivables.toFixed(2)}
            </span>{' '}
            pending
          </p>
        </div>

        {/* Total Expenses Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Operating Expenses</span>
            <Receipt className="h-4 w-4 text-rose-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {expenses.length} receipts & bills logged
          </p>
        </div>

        {/* Net Profit Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Net Profit (P&L)</span>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <p
            className={`mt-2 text-xl sm:text-2xl font-bold tracking-tight tabular-nums ${
              netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            ${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            Operating Margin:{' '}
            <span className="font-semibold text-emerald-700 tabular-nums">
              {marginPct}%
            </span>
          </p>
        </div>

        {/* Hours Logged Card */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Labor Logged</span>
            <Clock className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-slate-900 tabular-nums">
            {totalLoggedHours} <span className="text-sm font-normal text-slate-500">hrs</span>
          </p>
          <p className="mt-1 text-[11px] text-slate-500">
            {timeLogs.filter((t) => !t.billed).length} unbilled job sessions
          </p>
        </div>
      </div>

      {/* Main Grid: Operational Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols on lg): Active Clients & Projects + Recent Receipts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Job Sites & Directory Folders */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Client Job Sites & Project Vault
                </h3>
                <p className="text-xs text-slate-500">
                  Site directories, plant designs, GPS tags & photo markup
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('sites')}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                View All Sites
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {clients.map((client) => (
                <div
                  key={client.id}
                  onClick={() => onSelectClient(client.id)}
                  className="group cursor-pointer rounded-xl border border-slate-200 p-4 transition hover:border-emerald-500 hover:bg-emerald-50/30"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                        <FolderOpen className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800">
                          {client.name}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <MapPin className="h-3 w-3 text-slate-400" />
                          <span className="truncate max-w-[180px]">{client.address}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600">
                    {client.folders.slice(0, 4).map((f) => (
                      <span
                        key={f}
                        className="rounded bg-slate-100 px-2 py-0.5 text-slate-600 font-medium"
                      >
                        {f}
                      </span>
                    ))}
                    {client.folders.length > 4 && (
                      <span className="text-slate-400">+{client.folders.length - 4}</span>
                    )}
                  </div>

                  {client.gpsCoordinates && (
                    <div className="mt-2 text-[10px] font-mono text-emerald-700">
                      GPS: {client.gpsCoordinates.lat.toFixed(4)},{' '}
                      {client.gpsCoordinates.lng.toFixed(4)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Expenses & Receipt OCR Stream */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Recent Daily Expenses & OCR Logs
                </h3>
                <p className="text-xs text-slate-500">
                  Receipt photos automatically categorized by Gemini Vision
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('expenses')}
                className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Open Ledger
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {expenses.slice(0, 4).map((exp) => (
                <div key={exp.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {exp.receiptImageUri ? (
                      <img
                        src={exp.receiptImageUri}
                        alt="Receipt"
                        className="h-10 w-10 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <Receipt className="h-5 w-5" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{exp.merchant}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{exp.category}</span>
                        <span>·</span>
                        <span>{exp.date}</span>
                        {exp.clientName && (
                          <>
                            <span>·</span>
                            <span className="text-emerald-700 font-medium">
                              {exp.clientName}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                      ${exp.amount.toFixed(2)}
                    </p>
                    <p className="text-[11px] text-slate-400">{exp.paymentMethod}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Expense Category Distribution & Invoices Status */}
        <div className="space-y-6">
          {/* Budget Categories Distribution */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-base font-bold text-slate-900">
              Expenses by Budget Category
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Real-time cost breakdown for tax & profit analysis
            </p>

            <div className="space-y-3">
              {sortedCategories.map(([category, amount]) => {
                const pct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                return (
                  <div key={category}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700">{category}</span>
                      <span className="font-mono font-semibold text-slate-900 tabular-nums">
                        ${amount.toFixed(2)} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Total Outlay</span>
              <span className="text-sm font-bold font-mono text-slate-900 tabular-nums">
                ${totalExpenses.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Job Quotes & Estimates Pipeline */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/30 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Calculator className="h-4 w-4 text-amber-700" />
                <h3 className="text-base font-bold text-slate-900">Job Quotes & Estimates</h3>
              </div>
              <button
                onClick={() => onNavigateTab('invoices')}
                className="text-xs font-semibold text-amber-800 hover:text-amber-900"
              >
                View Quotes ({estimates.length})
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Awaiting client approval before converting to active invoices
            </p>

            <div className="space-y-2">
              {estimates.slice(0, 2).map((est) => (
                <div
                  key={est.id}
                  className="rounded-lg border border-amber-200/60 bg-white p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-mono font-bold text-amber-900">
                      {est.estimateNumber}
                    </p>
                    <p className="text-xs font-medium text-slate-800">{est.clientName}</p>
                    <p className="text-[10px] text-slate-400">Valid: {est.validUntil}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-slate-900 tabular-nums">
                      ${est.total.toFixed(2)}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        est.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : est.status === 'pending'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {est.status === 'pending' ? 'Pending' : est.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Invoice Tracker */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900">Recent Invoices</h3>
              <button
                onClick={() => onNavigateTab('invoices')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                All Invoices
              </button>
            </div>

            <div className="space-y-2.5">
              {invoices.slice(0, 3).map((inv) => (
                <div
                  key={inv.id}
                  className="rounded-lg border border-slate-100 bg-slate-50/50 p-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-mono font-bold text-slate-900">
                      {inv.invoiceNumber}
                    </p>
                    <p className="text-xs font-medium text-slate-600">{inv.clientName}</p>
                    <p className="text-[10px] text-slate-400">{inv.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-emerald-900 tabular-nums">
                      ${inv.total.toFixed(2)}
                    </p>
                    <span
                      className={`inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        inv.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'sent'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Offline Sync & Backup Status Indicator */}
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs text-slate-700">
            <div className="flex items-center gap-2 font-semibold text-emerald-900">
              <ShieldCheck className="h-4 w-4 text-emerald-700" />
              <span>Offline-First Device Sync Active</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-600 leading-relaxed">
              All receipts, client photos, markups, and time records are stored locally on your device. Auto-backup to{' '}
              <strong className="text-emerald-950 font-semibold">{profile.backupSettings.provider}</strong> is configured.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
