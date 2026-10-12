export interface LineItem {
  description: string;
  quantity?: number;
  price?: number;
  extPrice?: number;
}

export interface Expense {
  id: string;
  date: string; // YYYY-MM-DD
  merchant: string;
  category: string;
  subCategory?: string;
  amount: number;
  tax: number;
  currency: string;
  paymentMethod: string;
  receiptNumber?: string;
  receiptImageUri?: string;
  notes?: string;
  clientId?: string;
  clientName?: string;
  lineItems?: LineItem[];
  synced: boolean;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  task: string;
  quantity: number;
  price: number;
  extPrice: number;
}

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue';
export type InvoiceTemplate = 'landscaping_standard' | 'proposal' | 'contract';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number; // e.g. 0.13 for 13% HST
  taxAmount: number;
  total: number;
  status: InvoiceStatus;
  terms: string[];
  notes?: string;
  templateType: InvoiceTemplate;
  paidDate?: string;
  fromEstimateId?: string;
  createdAt: string;
}

export type EstimateStatus = 'draft' | 'pending' | 'accepted' | 'declined' | 'converted';

export interface Estimate {
  id: string;
  estimateNumber: string;
  date: string;
  validUntil: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  status: EstimateStatus;
  terms: string[];
  notes?: string;
  templateType: InvoiceTemplate;
  convertedInvoiceId?: string;
  createdAt: string;
}

export interface AnnotationItem {
  id: string;
  type: 'freehand' | 'arrow' | 'rect' | 'circle' | 'text';
  color: string;
  strokeWidth: number;
  points: { x: number; y: number }[];
  text?: string;
}

export interface SitePhoto {
  id: string;
  clientId: string;
  folder: string; // e.g. 'Photos', 'Plants', 'Designs'
  filename: string;
  caption: string;
  timestamp: string;
  imageUri: string;
  annotatedUri?: string;
  annotations?: AnnotationItem[];
  notes?: string;
  fileType?: 'photo' | 'design' | 'doc' | 'list';
}

export interface ClientSite {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  gpsCoordinates?: {
    lat: number;
    lng: number;
    accuracy?: number;
  };
  folders: string[];
  notes: string;
  shoppingListText?: string;
  createdAt: string;
}

export interface TimeLog {
  id: string;
  clientId: string;
  clientName: string;
  employeeName: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  hourlyRate: number;
  taskDescription: string;
  billed: boolean;
  invoiceId?: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  monthlyBudget?: number;
}

export interface BackupSettings {
  provider: 'google_drive' | 'backblaze_b2' | 'onedrive' | 'local';
  autoSyncInterval: 'manual' | 'daily' | 'weekly';
  targetFolder: string;
  lastBackupTime?: string;
  lastChecksum?: string;
}

export interface CompanyProfile {
  name: string;
  ownerName: string;
  tagline: string;
  experienceYears: number;
  officePhone: string;
  cellPhone: string;
  email: string;
  website: string;
  address: string;
  taxNumber?: string;
  taxRate: number;
  currency: string;
  logoUri?: string;
  services: string[];
  termsAndConditions: string[];
  categories: BudgetCategory[];
  backupSettings: BackupSettings;
}

export interface CloudBackupResult {
  success: boolean;
  backupId: string;
  provider: string;
  targetFolder: string;
  timestamp: string;
  byteSize: number;
  checksum: string;
  recordCount: {
    expenses: number;
    invoices: number;
    clients: number;
    timeLogs: number;
    sitePhotos: number;
  };
  status: string;
}
