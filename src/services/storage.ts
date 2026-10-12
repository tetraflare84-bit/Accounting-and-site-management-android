import {
  CompanyProfile,
  ClientSite,
  Expense,
  Invoice,
  Estimate,
  SitePhoto,
  TimeLog,
} from '../types';
import {
  initialCompanyProfile,
  initialClients,
  initialExpenses,
  initialInvoices,
  initialEstimates,
  initialSitePhotos,
  initialTimeLogs,
} from '../data/seedData';

const STORAGE_KEYS = {
  PROFILE: 'plantpro_company_profile_v1',
  CLIENTS: 'plantpro_clients_v1',
  EXPENSES: 'plantpro_expenses_v1',
  INVOICES: 'plantpro_invoices_v1',
  ESTIMATES: 'plantpro_estimates_v1',
  PHOTOS: 'plantpro_site_photos_v1',
  TIMELOGS: 'plantpro_timelogs_v1',
  SYNC_QUEUE: 'plantpro_sync_queue_v1',
};

// Safe JSON loader
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading key ${key} from storage:`, err);
    return fallback;
  }
}

// Safe JSON saver
function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving key ${key} to storage:`, err);
  }
}

export const StorageService = {
  getProfile(): CompanyProfile {
    return loadFromStorage(STORAGE_KEYS.PROFILE, initialCompanyProfile);
  },
  saveProfile(profile: CompanyProfile): void {
    saveToStorage(STORAGE_KEYS.PROFILE, profile);
  },

  getClients(): ClientSite[] {
    return loadFromStorage(STORAGE_KEYS.CLIENTS, initialClients);
  },
  saveClients(clients: ClientSite[]): void {
    saveToStorage(STORAGE_KEYS.CLIENTS, clients);
  },

  getExpenses(): Expense[] {
    return loadFromStorage(STORAGE_KEYS.EXPENSES, initialExpenses);
  },
  saveExpenses(expenses: Expense[]): void {
    saveToStorage(STORAGE_KEYS.EXPENSES, expenses);
  },

  getInvoices(): Invoice[] {
    return loadFromStorage(STORAGE_KEYS.INVOICES, initialInvoices);
  },
  saveInvoices(invoices: Invoice[]): void {
    saveToStorage(STORAGE_KEYS.INVOICES, invoices);
  },

  getEstimates(): Estimate[] {
    return loadFromStorage(STORAGE_KEYS.ESTIMATES, initialEstimates);
  },
  saveEstimates(estimates: Estimate[]): void {
    saveToStorage(STORAGE_KEYS.ESTIMATES, estimates);
  },

  getSitePhotos(): SitePhoto[] {
    return loadFromStorage(STORAGE_KEYS.PHOTOS, initialSitePhotos);
  },
  saveSitePhotos(photos: SitePhoto[]): void {
    saveToStorage(STORAGE_KEYS.PHOTOS, photos);
  },

  getTimeLogs(): TimeLog[] {
    return loadFromStorage(STORAGE_KEYS.TIMELOGS, initialTimeLogs);
  },
  saveTimeLogs(logs: TimeLog[]): void {
    saveToStorage(STORAGE_KEYS.TIMELOGS, logs);
  },

  // Export full vault as structured JSON for offline backup / cloud sync
  exportFullVault(): {
    version: string;
    exportedAt: string;
    profile: CompanyProfile;
    clients: ClientSite[];
    expenses: Expense[];
    invoices: Invoice[];
    estimates: Estimate[];
    sitePhotos: SitePhoto[];
    timeLogs: TimeLog[];
  } {
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      profile: this.getProfile(),
      clients: this.getClients(),
      expenses: this.getExpenses(),
      invoices: this.getInvoices(),
      estimates: this.getEstimates(),
      sitePhotos: this.getSitePhotos(),
      timeLogs: this.getTimeLogs(),
    };
  },

  // Restore from vault JSON
  importFullVault(vault: any): { success: boolean; message: string } {
    try {
      if (!vault || typeof vault !== 'object') {
        throw new Error('Invalid vault file format.');
      }
      if (vault.profile) this.saveProfile(vault.profile);
      if (Array.isArray(vault.clients)) this.saveClients(vault.clients);
      if (Array.isArray(vault.expenses)) this.saveExpenses(vault.expenses);
      if (Array.isArray(vault.invoices)) this.saveInvoices(vault.invoices);
      if (Array.isArray(vault.estimates)) this.saveEstimates(vault.estimates);
      if (Array.isArray(vault.sitePhotos)) this.saveSitePhotos(vault.sitePhotos);
      if (Array.isArray(vault.timeLogs)) this.saveTimeLogs(vault.timeLogs);
      return { success: true, message: 'Vault restored successfully!' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Restore failed' };
    }
  },

  // Reset to initial sample data
  resetToSampleData(): void {
    saveToStorage(STORAGE_KEYS.PROFILE, initialCompanyProfile);
    saveToStorage(STORAGE_KEYS.CLIENTS, initialClients);
    saveToStorage(STORAGE_KEYS.EXPENSES, initialExpenses);
    saveToStorage(STORAGE_KEYS.INVOICES, initialInvoices);
    saveToStorage(STORAGE_KEYS.ESTIMATES, initialEstimates);
    saveToStorage(STORAGE_KEYS.PHOTOS, initialSitePhotos);
    saveToStorage(STORAGE_KEYS.TIMELOGS, initialTimeLogs);
  },
};
