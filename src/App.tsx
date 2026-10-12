/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  CompanyProfile,
  Expense,
  Invoice,
  Estimate,
  ClientSite,
  TimeLog,
  SitePhoto,
} from './types';
import { StorageService } from './services/storage';
import { TopHeader } from './components/TopHeader';
import { BottomTabBar } from './components/BottomTabBar';
import { DashboardView } from './components/DashboardView';
import { ExpensesView } from './components/ExpensesView';
import { InvoicesView } from './components/InvoicesView';
import { SitesAndPhotosView } from './components/SitesAndPhotosView';
import { TimeClockView } from './components/TimeClockView';
import { ReportsView } from './components/ReportsView';
import { UserGuideView } from './components/UserGuideView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [profile, setProfile] = useState<CompanyProfile>(() => StorageService.getProfile());
  const [expenses, setExpenses] = useState<Expense[]>(() => StorageService.getExpenses());
  const [invoices, setInvoices] = useState<Invoice[]>(() => StorageService.getInvoices());
  const [estimates, setEstimates] = useState<Estimate[]>(() => StorageService.getEstimates());
  const [clients, setClients] = useState<ClientSite[]>(() => StorageService.getClients());
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>(() => StorageService.getTimeLogs());
  const [sitePhotos, setSitePhotos] = useState<SitePhoto[]>(() => StorageService.getSitePhotos());

  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(undefined);
  const [quickCameraTrigger, setQuickCameraTrigger] = useState<boolean>(false);
  const [openModalDirectly, setOpenModalDirectly] = useState<'invoice' | 'estimate' | null>(null);

  // Sync to storage on updates
  useEffect(() => {
    StorageService.saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    StorageService.saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    StorageService.saveInvoices(invoices);
  }, [invoices]);

  useEffect(() => {
    StorageService.saveEstimates(estimates);
  }, [estimates]);

  useEffect(() => {
    StorageService.saveClients(clients);
  }, [clients]);

  useEffect(() => {
    StorageService.saveTimeLogs(timeLogs);
  }, [timeLogs]);

  useEffect(() => {
    StorageService.saveSitePhotos(sitePhotos);
  }, [sitePhotos]);

  // Handlers for Expenses
  const handleAddExpense = (expense: Expense) => {
    setExpenses((prev) => [expense, ...prev]);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // Handlers for Invoices
  const handleAddInvoice = (invoice: Invoice) => {
    setInvoices((prev) => [invoice, ...prev]);
  };

  const handleUpdateInvoiceStatus = (id: string, status: Invoice['status']) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              status,
              paidDate: status === 'paid' ? new Date().toISOString().split('T')[0] : inv.paidDate,
            }
          : inv
      )
    );
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  };

  // Handlers for Estimates & Quotes
  const handleAddEstimate = (estimate: Estimate) => {
    setEstimates((prev) => [estimate, ...prev]);
  };

  const handleUpdateEstimateStatus = (id: string, status: Estimate['status']) => {
    setEstimates((prev) =>
      prev.map((est) => (est.id === id ? { ...est, status } : est))
    );
  };

  const handleDeleteEstimate = (id: string) => {
    setEstimates((prev) => prev.filter((e) => e.id !== id));
  };

  // 1-Click Convert from Estimate to Invoice!
  const handleConvertEstimateToInvoice = (est: Estimate) => {
    const newInvoice: Invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.length + 43).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      dueDate: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 14);
        return d.toISOString().split('T')[0];
      })(),
      clientId: est.clientId,
      clientName: est.clientName,
      clientPhone: est.clientPhone,
      clientAddress: est.clientAddress,
      items: est.items,
      subtotal: est.subtotal,
      taxRate: est.taxRate,
      taxAmount: est.taxAmount,
      total: est.total,
      status: 'sent',
      terms: est.terms,
      notes: est.notes || `Converted from accepted quote ${est.estimateNumber}`,
      templateType: 'landscaping_standard',
      fromEstimateId: est.id,
      createdAt: new Date().toISOString(),
    };

    // Mark estimate as converted
    setEstimates((prev) =>
      prev.map((e) =>
        e.id === est.id ? { ...e, status: 'converted', convertedInvoiceId: newInvoice.id } : e
      )
    );
    setInvoices((prev) => [newInvoice, ...prev]);
  };

  // Handlers for Clients & Photos
  const handleAddClient = (client: ClientSite) => {
    setClients((prev) => [...prev, client]);
  };

  const handleUpdateClient = (client: ClientSite) => {
    setClients((prev) => prev.map((c) => (c.id === client.id ? client : c)));
  };

  const handleAddSitePhoto = (photo: SitePhoto) => {
    setSitePhotos((prev) => [photo, ...prev]);
  };

  const handleUpdateSitePhoto = (photo: SitePhoto) => {
    setSitePhotos((prev) => prev.map((p) => (p.id === photo.id ? photo : p)));
  };

  const handleDeleteSitePhoto = (id: string) => {
    setSitePhotos((prev) => prev.filter((p) => p.id !== id));
  };

  // Handlers for Time Logs
  const handleAddTimeLog = (log: TimeLog) => {
    setTimeLogs((prev) => [log, ...prev]);
  };

  const handleDeleteTimeLog = (id: string) => {
    setTimeLogs((prev) => prev.filter((t) => t.id !== id));
  };

  const handleMarkTimeLogBilled = (id: string) => {
    setTimeLogs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, billed: true } : t))
    );
  };

  const handleResetSampleData = () => {
    if (confirm('Reset all ledger data to initial "Your Neighbourhood Plant Guy" state?')) {
      StorageService.resetToSampleData();
      setProfile(StorageService.getProfile());
      setExpenses(StorageService.getExpenses());
      setInvoices(StorageService.getInvoices());
      setEstimates(StorageService.getEstimates());
      setClients(StorageService.getClients());
      setTimeLogs(StorageService.getTimeLogs());
      setSitePhotos(StorageService.getSitePhotos());
      alert('Reset completed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-slate-900 font-sans selection:bg-emerald-200 selection:text-emerald-950 flex flex-col">
      {/* Top Header */}
      <TopHeader
        profile={profile}
        activeTab={activeTab}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setOpenModalDirectly(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onQuickScanReceipt={() => {
          setActiveTab('expenses');
          setQuickCameraTrigger(true);
        }}
        onQuickNewEstimate={() => {
          setActiveTab('invoices');
          setOpenModalDirectly('estimate');
        }}
        onQuickNewInvoice={() => {
          setActiveTab('invoices');
          setOpenModalDirectly('invoice');
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-3 sm:px-6 py-6 pb-24 md:pb-12">
        {activeTab === 'dashboard' && (
          <DashboardView
            profile={profile}
            expenses={expenses}
            invoices={invoices}
            estimates={estimates}
            clients={clients}
            timeLogs={timeLogs}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              setOpenModalDirectly(null);
            }}
            onOpenNewExpense={(withCamera) => {
              setActiveTab('expenses');
              if (withCamera) setQuickCameraTrigger(true);
            }}
            onOpenNewInvoice={() => {
              setActiveTab('invoices');
              setOpenModalDirectly('invoice');
            }}
            onOpenNewEstimate={() => {
              setActiveTab('invoices');
              setOpenModalDirectly('estimate');
            }}
            onSelectClient={(clientId) => {
              setSelectedClientId(clientId);
              setActiveTab('sites');
            }}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesView
            expenses={expenses}
            profile={profile}
            clients={clients}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
            openWithCameraTrigger={quickCameraTrigger}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoicesView
            invoices={invoices}
            estimates={estimates}
            profile={profile}
            clients={clients}
            timeLogs={timeLogs}
            onAddInvoice={handleAddInvoice}
            onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
            onDeleteInvoice={handleDeleteInvoice}
            onAddEstimate={handleAddEstimate}
            onUpdateEstimateStatus={handleUpdateEstimateStatus}
            onDeleteEstimate={handleDeleteEstimate}
            onConvertEstimateToInvoice={handleConvertEstimateToInvoice}
            openModalDirectly={openModalDirectly}
          />
        )}

        {activeTab === 'sites' && (
          <SitesAndPhotosView
            clients={clients}
            sitePhotos={sitePhotos}
            selectedClientId={selectedClientId}
            onAddClient={handleAddClient}
            onUpdateClient={handleUpdateClient}
            onAddSitePhoto={handleAddSitePhoto}
            onUpdateSitePhoto={handleUpdateSitePhoto}
            onDeleteSitePhoto={handleDeleteSitePhoto}
          />
        )}

        {activeTab === 'clock' && (
          <TimeClockView
            timeLogs={timeLogs}
            clients={clients}
            profile={profile}
            onAddTimeLog={handleAddTimeLog}
            onDeleteTimeLog={handleDeleteTimeLog}
            onMarkBilled={handleMarkTimeLogBilled}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            profile={profile}
            expenses={expenses}
            invoices={invoices}
            clients={clients}
            timeLogs={timeLogs}
          />
        )}

        {activeTab === 'guide' && <UserGuideView />}

        {activeTab === 'settings' && (
          <SettingsView
            profile={profile}
            onUpdateProfile={setProfile}
            onResetSampleData={handleResetSampleData}
          />
        )}
      </main>

      {/* Ergonomic Mobile Thumb Tab Bar */}
      <BottomTabBar
        activeTab={activeTab}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setQuickCameraTrigger(false);
          setOpenModalDirectly(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
