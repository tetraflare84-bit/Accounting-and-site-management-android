import React, { useState } from 'react';
import {
  TrendingUp,
  FileSpreadsheet,
  Printer,
  Calendar,
  DollarSign,
  Download,
  PieChart,
  BarChart3,
  CheckCircle,
} from 'lucide-react';
import { Expense, Invoice, ClientSite, TimeLog, CompanyProfile } from '../types';
import { GoogleSheetsExporter, downloadFile } from '../services/googleSheetsExporter';

interface ReportsViewProps {
  profile: CompanyProfile;
  expenses: Expense[];
  invoices: Invoice[];
  clients: ClientSite[];
  timeLogs: TimeLog[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  profile,
  expenses,
  invoices,
  clients,
  timeLogs,
}) => {
  const [timeframe, setTimeframe] = useState<'all' | 'monthly' | 'ytd'>('all');

  // Revenue computations
  const totalBilled = invoices.reduce((sum, i) => sum + i.total, 0);
  const totalCollected = invoices
    .filter((i) => i.status === 'paid')
    .reduce((sum, i) => sum + i.total, 0);
  const totalPending = invoices
    .filter((i) => i.status === 'sent' || i.status === 'overdue')
    .reduce((sum, i) => sum + i.total, 0);

  // Expense computations
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalTaxesPaid = expenses.reduce((sum, e) => sum + e.tax, 0);
  const netProfit = totalCollected - totalExpenses;
  const profitMargin = totalCollected > 0 ? (netProfit / totalCollected) * 100 : 0;

  // Category grouping
  const categoryTotals: { [key: string]: number } = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  // Client revenue ranking
  const clientRevenue: { [clientId: string]: { name: string; billed: number; paid: number } } = {};
  clients.forEach((c) => {
    clientRevenue[c.id] = { name: c.name, billed: 0, paid: 0 };
  });
  invoices.forEach((inv) => {
    if (!clientRevenue[inv.clientId]) {
      clientRevenue[inv.clientId] = { name: inv.clientName, billed: 0, paid: 0 };
    }
    clientRevenue[inv.clientId].billed += inv.total;
    if (inv.status === 'paid') {
      clientRevenue[inv.clientId].paid += inv.total;
    }
  });

  const sortedClients = Object.values(clientRevenue).sort((a, b) => b.paid - a.paid);

  // Export full Google Sheets bundle
  const handleExportAllToGoogleSheets = () => {
    // 1. Profit Loss Summary
    const plCsv = GoogleSheetsExporter.generateProfitLossCsv(
      profile,
      invoices,
      expenses,
      timeLogs
    );
    downloadFile(plCsv, 'PlantPro_ProfitLoss_GoogleSheets.csv');

    // 2. Expenses
    const expCsv = GoogleSheetsExporter.generateExpensesCsv(expenses);
    downloadFile(expCsv, 'PlantPro_Expenses_Master_GoogleSheets.csv');

    // 3. Invoices
    const invCsv = GoogleSheetsExporter.generateInvoicesCsv(invoices);
    downloadFile(invCsv, 'PlantPro_Invoices_Master_GoogleSheets.csv');

    alert('Downloaded 3 Google Sheets formatted CSV files: Profit/Loss, Expenses & Invoices!');
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Financial Reports & Profit Analytics
          </h2>
          <p className="text-xs text-slate-500">
            P&L statement, cost structure analysis & multi-tab Google Sheets sync
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportAllToGoogleSheets}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800 transition active:scale-95"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export to Google Sheets</span>
          </button>
          <button
            onClick={handlePrintReport}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Executive P&L Scorecard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Collected Revenue</p>
          <p className="mt-1 font-mono text-xl sm:text-2xl font-bold text-slate-900 tabular-nums">
            ${totalCollected.toFixed(2)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Total Billed: ${totalBilled.toFixed(2)}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Total Operating Expenses</p>
          <p className="mt-1 font-mono text-xl sm:text-2xl font-bold text-rose-600 tabular-nums">
            ${totalExpenses.toFixed(2)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Taxes (HST): ${totalTaxesPaid.toFixed(2)}</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Net Operating Income</p>
          <p
            className={`mt-1 font-mono text-xl sm:text-2xl font-bold tabular-nums ${
              netProfit >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            ${netProfit.toFixed(2)}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Cash-basis ledger</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs font-medium text-slate-500">Operating Profit Margin</p>
          <p className="mt-1 font-mono text-xl sm:text-2xl font-bold text-emerald-800 tabular-nums">
            {profitMargin.toFixed(1)}%
          </p>
          <p className="mt-1 text-[11px] text-slate-400">Net Income / Revenue</p>
        </div>
      </div>

      {/* Formal P&L Statement Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="border-b border-slate-200 pb-4 mb-4">
          <h3 className="text-base font-bold text-slate-900">
            Profit & Loss Statement (P&L)
          </h3>
          <p className="text-xs text-slate-500">
            Company: {profile.name} · Owner: {profile.ownerName}
          </p>
        </div>

        <div className="space-y-4 text-xs">
          {/* Revenue Section */}
          <div>
            <div className="flex justify-between py-1.5 font-bold text-slate-900 border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <span>Operating Revenue</span>
              <span>Amount ($)</span>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="flex justify-between py-2 text-slate-700 pl-4">
                <span>Client Job Fees & Invoicing (Paid)</span>
                <span className="font-mono tabular-nums">${totalCollected.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 text-slate-400 pl-4 italic">
                <span>Accounts Receivable (Sent & Pending)</span>
                <span className="font-mono tabular-nums">${totalPending.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 font-semibold text-slate-900 bg-slate-50 px-2 rounded">
                <span>Gross Realized Revenue</span>
                <span className="font-mono tabular-nums">${totalCollected.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div>
            <div className="flex justify-between py-1.5 font-bold text-slate-900 border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <span>Cost of Goods & Job Site Expenses</span>
              <span>Amount ($)</span>
            </div>
            <div className="divide-y divide-slate-100">
              {Object.entries(categoryTotals).map(([cat, amt]) => {
                const pct = totalExpenses > 0 ? (amt / totalExpenses) * 100 : 0;
                return (
                  <div key={cat} className="flex justify-between py-2 text-slate-700 pl-4">
                    <span>
                      {cat} <span className="text-slate-400 text-[10px]">({pct.toFixed(0)}%)</span>
                    </span>
                    <span className="font-mono tabular-nums">${amt.toFixed(2)}</span>
                  </div>
                );
              })}
              <div className="flex justify-between py-2 font-semibold text-rose-700 bg-rose-50/50 px-2 rounded">
                <span>Total Operating Outlays</span>
                <span className="font-mono tabular-nums">(${totalExpenses.toFixed(2)})</span>
              </div>
            </div>
          </div>

          {/* Bottom Net Margin Summary */}
          <div className="pt-2">
            <div className="flex justify-between py-3 font-bold text-sm bg-emerald-900 text-white px-4 rounded-xl shadow-xs">
              <span>Net Profit (Bottom Line)</span>
              <span className="font-mono tabular-nums text-emerald-200">
                ${netProfit.toFixed(2)} ({profitMargin.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Client Revenue Contribution Table */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Client Revenue & Profit Ranking
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Breakdown of total revenue generated per client site
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-2.5">Client / Job Site</th>
                <th className="px-4 py-2.5 text-right">Total Invoiced</th>
                <th className="px-4 py-2.5 text-right">Collected Revenue</th>
                <th className="px-4 py-2.5 text-right">Pending Receivables</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedClients.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50/70">
                  <td className="px-4 py-2.5 font-bold text-slate-900">{c.name}</td>
                  <td className="px-4 py-2.5 text-right font-mono text-slate-700 tabular-nums">
                    ${c.billed.toFixed(2)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-bold text-emerald-800 tabular-nums">
                    ${c.paid.toFixed(2)}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-amber-700 tabular-nums">
                    ${(c.billed - c.paid).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
