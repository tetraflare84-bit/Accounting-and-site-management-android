import React, { useState, useRef } from 'react';
import {
  FileText,
  Plus,
  Printer,
  Search,
  Upload,
  CheckCircle,
  Clock,
  Sparkles,
  Download,
  Trash2,
  Eye,
  FileSpreadsheet,
  AlertCircle,
  Calculator,
  ArrowRight,
} from 'lucide-react';
import { Invoice, Estimate, CompanyProfile, ClientSite, TimeLog, InvoiceItem } from '../types';
import { InvoiceViewer } from './InvoiceViewer';
import { GoogleSheetsExporter, downloadFile } from '../services/googleSheetsExporter';

interface InvoicesViewProps {
  invoices: Invoice[];
  estimates: Estimate[];
  profile: CompanyProfile;
  clients: ClientSite[];
  timeLogs: TimeLog[];
  onAddInvoice: (invoice: Invoice) => void;
  onUpdateInvoiceStatus: (id: string, status: Invoice['status']) => void;
  onDeleteInvoice: (id: string) => void;
  onAddEstimate: (estimate: Estimate) => void;
  onUpdateEstimateStatus: (id: string, status: Estimate['status']) => void;
  onDeleteEstimate: (id: string) => void;
  onConvertEstimateToInvoice: (estimate: Estimate) => void;
  initialMode?: 'invoices' | 'estimates';
  openModalDirectly?: 'invoice' | 'estimate' | null;
}

export const InvoicesView: React.FC<InvoicesViewProps> = ({
  invoices,
  estimates,
  profile,
  clients,
  timeLogs,
  onAddInvoice,
  onUpdateInvoiceStatus,
  onDeleteInvoice,
  onAddEstimate,
  onUpdateEstimateStatus,
  onDeleteEstimate,
  onConvertEstimateToInvoice,
  initialMode = 'invoices',
  openModalDirectly = null,
}) => {
  const [activeSegment, setActiveSegment] = useState<'invoices' | 'estimates'>(
    openModalDirectly === 'estimate' ? 'estimates' : initialMode
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedDocForView, setSelectedDocForView] = useState<{
    doc: Invoice | Estimate;
    type: 'invoice' | 'estimate';
  } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(!!openModalDirectly);
  const [modalType, setModalType] = useState<'invoice' | 'estimate'>(
    openModalDirectly || 'invoice'
  );
  const [isParsingDoc, setIsParsingDoc] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Form Fields
  const [formNumber, setFormNumber] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formDueDateOrValid, setFormDueDateOrValid] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [formClientId, setFormClientId] = useState(clients[0]?.id || '');
  const [formClientName, setFormClientName] = useState(clients[0]?.name || '');
  const [formClientPhone, setFormClientPhone] = useState(clients[0]?.phone || '');
  const [formClientAddress, setFormClientAddress] = useState(clients[0]?.address || '');
  const [formTemplate, setFormTemplate] = useState<Invoice['templateType']>('landscaping_standard');

  const [formItems, setFormItems] = useState<InvoiceItem[]>([
    {
      id: 'item_1',
      task: 'Eco-Friendly Garden Maintenance & Shrub Trimming',
      quantity: 1,
      price: 280.0,
      extPrice: 280.0,
    },
  ]);

  const [formTerms, setFormTerms] = useState<string[]>([...profile.termsAndConditions]);
  const [formNotes, setFormNotes] = useState(
    'Thank you for supporting your local neighbourhood plant specialist!'
  );

  // Listen to openModalDirectly prop changes
  React.useEffect(() => {
    if (openModalDirectly) {
      openCreateModal(openModalDirectly);
      setActiveSegment(openModalDirectly === 'estimate' ? 'estimates' : 'invoices');
    }
  }, [openModalDirectly]);

  // Reset form with appropriate prefix
  const openCreateModal = (type: 'invoice' | 'estimate') => {
    setModalType(type);
    if (type === 'estimate') {
      setFormNumber(`EST-${new Date().getFullYear()}-${String(estimates.length + 18).padStart(3, '0')}`);
      setFormTerms([
        'Quote valid for 30 days from date of issue',
        '50% deposit required upon project scheduling and material booking',
        ...profile.termsAndConditions,
      ]);
    } else {
      setFormNumber(`INV-${new Date().getFullYear()}-${String(invoices.length + 42).padStart(3, '0')}`);
      setFormTerms([...profile.termsAndConditions]);
    }
    setIsModalOpen(true);
  };

  // Switch modal type without erasing line items
  const switchModalType = (type: 'invoice' | 'estimate') => {
    setModalType(type);
    if (type === 'estimate') {
      if (!formNumber.startsWith('EST')) {
        setFormNumber(`EST-${new Date().getFullYear()}-${String(estimates.length + 18).padStart(3, '0')}`);
      }
      setFormTerms([
        'Quote valid for 30 days from date of issue',
        '50% deposit required upon project scheduling and material booking',
        ...profile.termsAndConditions,
      ]);
    } else {
      if (!formNumber.startsWith('INV')) {
        setFormNumber(`INV-${new Date().getFullYear()}-${String(invoices.length + 42).padStart(3, '0')}`);
      }
      setFormTerms([...profile.termsAndConditions]);
    }
  };

  // Filtered documents
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredEstimates = estimates.filter((est) => {
    const matchesSearch =
      est.estimateNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      est.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || est.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate totals for modal form
  const subtotal = formItems.reduce((sum, item) => sum + item.extPrice, 0);
  const taxAmount = subtotal * profile.taxRate;
  const total = subtotal + taxAmount;

  // Handle client selection change
  const handleClientSelect = (clientId: string) => {
    setFormClientId(clientId);
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setFormClientName(client.name);
      setFormClientPhone(client.phone);
      setFormClientAddress(client.address);
    }
  };

  // Add Item row
  const handleAddItem = () => {
    setFormItems((prev) => [
      ...prev,
      {
        id: `item_${Date.now()}`,
        task: '',
        quantity: 1,
        price: 0,
        extPrice: 0,
      },
    ]);
  };

  const handleUpdateItem = (
    id: string,
    field: 'task' | 'quantity' | 'price',
    val: any
  ) => {
    setFormItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, [field]: val };
        if (field === 'quantity' || field === 'price') {
          const q = field === 'quantity' ? Number(val) : item.quantity;
          const p = field === 'price' ? Number(val) : item.price;
          updated.extPrice = q * p;
        }
        return updated;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    if (formItems.length <= 1) return;
    setFormItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Import unbilled time logs into invoice/quote
  const handleImportUnbilledHours = () => {
    const unbilled = timeLogs.filter((t) => t.clientId === formClientId && !t.billed);
    if (unbilled.length === 0) {
      alert('No unbilled labor logs found for this client.');
      return;
    }

    const newItems: InvoiceItem[] = unbilled.map((log) => ({
      id: `item_time_${log.id}`,
      task: `Labor: ${log.taskDescription} (${(log.durationMinutes / 60).toFixed(1)} hrs @ $${log.hourlyRate}/hr)`,
      quantity: 1,
      price: (log.durationMinutes / 60) * log.hourlyRate,
      extPrice: (log.durationMinutes / 60) * log.hourlyRate,
    }));

    setFormItems((prev) => [...prev, ...newItems]);
    alert(`Imported ${unbilled.length} labor session(s) into this draft!`);
  };

  // Parse Document / Uploaded Invoice PDF Screenshot
  const handleParseDocument = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsingDoc(true);
    setParseError(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        const res = await fetch('/api/ocr/invoice-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64,
            mimeType: file.type || 'image/jpeg',
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to parse invoice document');

        if (json.data) {
          const d = json.data;
          if (d.clientName) setFormClientName(d.clientName);
          if (d.clientPhone) setFormClientPhone(d.clientPhone);
          if (d.clientAddress) setFormClientAddress(d.clientAddress);
          if (d.date) setFormDate(d.date);
          if (d.invoiceNumber) setFormNumber(d.invoiceNumber);
          if (Array.isArray(d.items) && d.items.length > 0) {
            setFormItems(
              d.items.map((it: any, i: number) => ({
                id: `parsed_${i}`,
                task: it.task,
                quantity: 1,
                price: it.price || 0,
                extPrice: it.price || 0,
              }))
            );
          }
          if (Array.isArray(d.terms) && d.terms.length > 0) {
            setFormTerms(d.terms);
          }
        }
      } catch (err: any) {
        setParseError(err.message || 'Error parsing document.');
      } finally {
        setIsParsingDoc(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit form
  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClientName) {
      alert('Please specify client name.');
      return;
    }

    if (modalType === 'estimate') {
      const newEstimate: Estimate = {
        id: `est_${Date.now()}`,
        estimateNumber: formNumber || `EST-${Date.now()}`,
        date: formDate,
        validUntil: formDueDateOrValid,
        clientId: formClientId || `client_${Date.now()}`,
        clientName: formClientName,
        clientPhone: formClientPhone,
        clientAddress: formClientAddress,
        templateType: formTemplate,
        items: formItems.filter((i) => i.task.trim() !== ''),
        subtotal,
        taxRate: profile.taxRate,
        taxAmount,
        total,
        status: 'pending',
        terms: formTerms,
        notes: formNotes,
        createdAt: new Date().toISOString(),
      };
      onAddEstimate(newEstimate);
      setIsModalOpen(false);
      setSelectedDocForView({ doc: newEstimate, type: 'estimate' });
    } else {
      const newInvoice: Invoice = {
        id: `inv_${Date.now()}`,
        invoiceNumber: formNumber || `INV-${Date.now()}`,
        date: formDate,
        dueDate: formDueDateOrValid,
        clientId: formClientId || `client_${Date.now()}`,
        clientName: formClientName,
        clientPhone: formClientPhone,
        clientAddress: formClientAddress,
        templateType: formTemplate,
        items: formItems.filter((i) => i.task.trim() !== ''),
        subtotal,
        taxRate: profile.taxRate,
        taxAmount,
        total,
        status: 'sent',
        terms: formTerms,
        notes: formNotes,
        createdAt: new Date().toISOString(),
      };
      onAddInvoice(newInvoice);
      setIsModalOpen(false);
      setSelectedDocForView({ doc: newInvoice, type: 'invoice' });
    }
  };

  // Export to Google Sheets
  const handleExportGoogleSheets = () => {
    if (activeSegment === 'estimates') {
      const csv = GoogleSheetsExporter.generateEstimatesCsv(estimates);
      downloadFile(csv, 'PlantPro_Estimates_Quotes_GoogleSheets.csv');
    } else {
      const csv = GoogleSheetsExporter.generateInvoicesCsv(invoices);
      downloadFile(csv, 'PlantPro_Invoices_Master_GoogleSheets.csv');
    }
  };

  // If viewing a specific document
  if (selectedDocForView) {
    return (
      <InvoiceViewer
        document={selectedDocForView.doc}
        documentType={selectedDocForView.type}
        profile={profile}
        onBack={() => setSelectedDocForView(null)}
        onStatusChange={(newStatus) => {
          if (selectedDocForView.type === 'estimate') {
            onUpdateEstimateStatus(selectedDocForView.doc.id, newStatus);
            setSelectedDocForView((prev) =>
              prev ? { ...prev, doc: { ...prev.doc, status: newStatus } } : null
            );
          } else {
            onUpdateInvoiceStatus(selectedDocForView.doc.id, newStatus);
            setSelectedDocForView((prev) =>
              prev ? { ...prev, doc: { ...prev.doc, status: newStatus } } : null
            );
          }
        }}
        onConvertToInvoice={(est) => {
          onConvertEstimateToInvoice(est);
          setSelectedDocForView(null);
          setActiveSegment('invoices');
          alert(`Estimate ${est.estimateNumber} successfully converted to active Invoice!`);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header with Dual Prominent Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Invoices, Quotes & Job Estimates
          </h2>
          <p className="text-xs text-slate-500">
            Create proposals, track client decision stages & convert approved quotes to invoices
          </p>
        </div>

        {/* Dual Prominent Actions as requested by user! */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportGoogleSheets}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
            <span className="hidden sm:inline">Export to Google Sheets</span>
          </button>

          {/* New Estimate / Quote Button - Prominent */}
          <button
            onClick={() => openCreateModal('estimate')}
            className="flex items-center gap-1.5 rounded-lg border-2 border-emerald-700 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-900 shadow-xs hover:bg-emerald-100 transition active:scale-95"
          >
            <Calculator className="h-4 w-4 text-emerald-700" />
            <span>+ New Estimate / Quote</span>
          </button>

          {/* New Invoice Button - Prominent */}
          <button
            onClick={() => openCreateModal('invoice')}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-800 transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>+ New Invoice</span>
          </button>
        </div>
      </div>

      {/* Segment Selector: Invoices vs Quotes & Estimates */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveSegment('invoices');
              setStatusFilter('All');
            }}
            className={`flex items-center gap-2 pb-2 text-sm font-bold transition border-b-2 ${
              activeSegment === 'invoices'
                ? 'border-emerald-700 text-emerald-950'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Invoices</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 font-mono">
              {invoices.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveSegment('estimates');
              setStatusFilter('All');
            }}
            className={`flex items-center gap-2 pb-2 text-sm font-bold transition border-b-2 ${
              activeSegment === 'estimates'
                ? 'border-emerald-700 text-emerald-950'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Job Quotes & Estimates</span>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-900 font-mono font-bold">
              {estimates.length}
            </span>
          </button>
        </div>

        {activeSegment === 'estimates' && (
          <span className="text-xs text-amber-800 font-medium hidden sm:inline">
            Awaiting client decision before converting to billable invoice
          </span>
        )}
      </div>

      {/* Estimates & Quotes Pipeline Metrics Ribbon */}
      {activeSegment === 'estimates' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3 shadow-xs">
            <span className="text-[11px] font-medium text-amber-800">Total Quoted Value</span>
            <p className="text-lg font-bold font-mono text-amber-950 mt-1 tabular-nums">
              ${estimates.reduce((sum, e) => sum + e.total, 0).toFixed(2)}
            </p>
            <p className="text-[10px] text-amber-700/80">{estimates.length} proposals created</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-white p-3 shadow-xs">
            <span className="text-[11px] font-medium text-slate-500">Awaiting Client Choice</span>
            <p className="text-lg font-bold font-mono text-amber-600 mt-1 tabular-nums">
              ${estimates.filter((e) => e.status === 'pending').reduce((sum, e) => sum + e.total, 0).toFixed(2)}
            </p>
            <p className="text-[10px] text-slate-500 font-semibold">
              {estimates.filter((e) => e.status === 'pending').length} pending decision
            </p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 shadow-xs">
            <span className="text-[11px] font-medium text-emerald-800">Client Approved (Ready)</span>
            <p className="text-lg font-bold font-mono text-emerald-900 mt-1 tabular-nums">
              ${estimates.filter((e) => e.status === 'accepted').reduce((sum, e) => sum + e.total, 0).toFixed(2)}
            </p>
            <p className="text-[10px] text-emerald-700 font-semibold">
              {estimates.filter((e) => e.status === 'accepted').length} ready to convert
            </p>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-3 shadow-xs">
            <span className="text-[11px] font-medium text-blue-800">Converted to Invoices</span>
            <p className="text-lg font-bold font-mono text-blue-900 mt-1 tabular-nums">
              ${estimates.filter((e) => e.status === 'converted').reduce((sum, e) => sum + e.total, 0).toFixed(2)}
            </p>
            <p className="text-[10px] text-blue-700 font-semibold">
              {estimates.filter((e) => e.status === 'converted').length} active jobs billed
            </p>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeSegment === 'estimates' ? 'estimate #' : 'invoice #'} or client name...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg overflow-x-auto">
          {(activeSegment === 'estimates'
            ? ['All', 'pending', 'accepted', 'declined', 'converted']
            : ['All', 'sent', 'paid', 'draft']
          ).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table Display: Invoices OR Estimates */}
      {activeSegment === 'invoices' ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
                <tr>
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Client Name</th>
                  <th className="px-4 py-3">Issue Date</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3 text-right">Subtotal</th>
                  <th className="px-4 py-3 text-right">HST Tax</th>
                  <th className="px-4 py-3 text-right">Total ($)</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400">
                      No invoices found. Click "+ New Invoice" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3 font-mono font-bold text-emerald-800">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{inv.clientName}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">
                          {inv.clientAddress}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 tabular-nums">
                        {inv.date}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 tabular-nums">
                        {inv.dueDate}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700 tabular-nums">
                        ${inv.subtotal.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-500 tabular-nums">
                        ${inv.taxAmount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 text-sm tabular-nums">
                        ${inv.total.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
                            inv.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : inv.status === 'sent'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => setSelectedDocForView({ doc: inv, type: 'invoice' })}
                            className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-slate-700 hover:bg-emerald-100 hover:text-emerald-800 transition font-medium"
                            title="View / Print Printable Invoice"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => onDeleteInvoice(inv.id)}
                            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 transition"
                            title="Delete invoice"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Estimates & Quotes Table */
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-amber-50/60 font-semibold text-slate-700">
                <tr>
                  <th className="px-4 py-3">Estimate #</th>
                  <th className="px-4 py-3">Client / Site</th>
                  <th className="px-4 py-3">Quote Date</th>
                  <th className="px-4 py-3">Valid Until</th>
                  <th className="px-4 py-3 text-right">Subtotal</th>
                  <th className="px-4 py-3 text-right">Est. Total ($)</th>
                  <th className="px-4 py-3 text-center">Client Decision</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEstimates.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No quotes or estimates found. Click "+ New Estimate / Quote" to create one.
                    </td>
                  </tr>
                ) : (
                  filteredEstimates.map((est) => (
                    <tr key={est.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3 font-mono font-bold text-amber-900">
                        {est.estimateNumber}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-slate-900">{est.clientName}</p>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">
                          {est.items.map((i) => i.task).join(', ')}
                        </p>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 tabular-nums">
                        {est.date}
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600 tabular-nums">
                        {est.validUntil}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700 tabular-nums">
                        ${est.subtotal.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 text-sm tabular-nums">
                        ${est.total.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <select
                          value={est.status}
                          disabled={est.status === 'converted'}
                          onChange={(e) =>
                            onUpdateEstimateStatus(est.id, e.target.value as Estimate['status'])
                          }
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold border transition cursor-pointer ${
                            est.status === 'accepted'
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                              : est.status === 'pending'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : est.status === 'converted'
                              ? 'bg-blue-100 text-blue-900 border-blue-300 opacity-90 cursor-default'
                              : 'bg-rose-100 text-rose-900 border-rose-300'
                          }`}
                        >
                          <option value="pending">⏳ Awaiting Decision</option>
                          <option value="accepted">✓ Client Approved</option>
                          <option value="declined">✕ Declined</option>
                          {est.status === 'converted' && (
                            <option value="converted">🚀 Converted</option>
                          )}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {est.status !== 'converted' ? (
                            <button
                              onClick={() => {
                                onConvertEstimateToInvoice(est);
                                setActiveSegment('invoices');
                              }}
                              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-bold text-xs transition shadow-xs active:scale-95 ${
                                est.status === 'accepted'
                                  ? 'bg-emerald-700 text-white hover:bg-emerald-800 ring-2 ring-emerald-400/50'
                                  : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
                              }`}
                              title="Client says go ahead! Convert quote into an official invoice"
                            >
                              <span>Convert to Invoice</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <span className="text-[11px] font-mono font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                              Invoice Active
                            </span>
                          )}
                          <button
                            onClick={() => setSelectedDocForView({ doc: est, type: 'estimate' })}
                            className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1.5 text-slate-700 hover:bg-slate-200 transition font-semibold text-xs"
                            title="View / Print Printable Quote"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span className="hidden xl:inline">View</span>
                          </button>
                          <button
                            onClick={() => onDeleteEstimate(est.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 transition"
                            title="Delete quote"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Invoice OR Job Estimate */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-2xl my-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header with Form Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                    Form Creator
                  </span>
                  <span>·</span>
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => switchModalType('estimate')}
                      className={`px-3 py-1 rounded-md transition ${
                        modalType === 'estimate'
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Job Estimate / Quote
                    </button>
                    <button
                      type="button"
                      onClick={() => switchModalType('invoice')}
                      className={`px-3 py-1 rounded-md transition ${
                        modalType === 'invoice'
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Official Invoice
                    </button>
                  </div>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {modalType === 'estimate'
                    ? 'Create New Job Quote & Estimate'
                    : 'Create New Client Invoice'}
                </h3>
              </div>

              {/* Upload & parse existing invoice PDF / image */}
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleParseDocument}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isParsingDoc}
                  className="flex items-center gap-1 rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 disabled:opacity-50"
                  title="Upload invoice - Sheet1.pdf or quote file to parse"
                >
                  <Sparkles className="h-3.5 w-3.5 text-emerald-700" />
                  <span>{isParsingDoc ? 'Parsing...' : 'Parse File (AI)'}</span>
                </button>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <span className="sr-only">Close</span>
                  ✕
                </button>
              </div>
            </div>

            {parseError && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-100 p-2 text-xs text-amber-900">
                <AlertCircle className="h-4 w-4" />
                <span>{parseError}</span>
              </div>
            )}

            <form onSubmit={handleCreateDocument} className="mt-4 space-y-4 text-xs">
              {/* Client Selection Strip */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Client & Site Details
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-medium">Quick Select Client:</span>
                    <select
                      value={formClientId}
                      onChange={(e) => handleClientSelect(e.target.value)}
                      className="rounded border border-slate-300 bg-white px-2 py-1 text-slate-800 font-medium"
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Client Name *</label>
                    <input
                      type="text"
                      required
                      value={formClientName}
                      onChange={(e) => setFormClientName(e.target.value)}
                      className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Client Phone</label>
                    <input
                      type="text"
                      value={formClientPhone}
                      onChange={(e) => setFormClientPhone(e.target.value)}
                      className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Client Address</label>
                    <input
                      type="text"
                      value={formClientAddress}
                      onChange={(e) => setFormClientAddress(e.target.value)}
                      className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Number and Dates Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {modalType === 'estimate' ? 'Estimate #' : 'Invoice #'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formNumber}
                    onChange={(e) => setFormNumber(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 font-mono font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Issue Date</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {modalType === 'estimate' ? 'Quote Valid Until' : 'Payment Due Date'}
                  </label>
                  <input
                    type="date"
                    required
                    value={formDueDateOrValid}
                    onChange={(e) => setFormDueDateOrValid(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-slate-900"
                  />
                </div>
              </div>

              {/* Line Items Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                    {modalType === 'estimate' ? 'Proposed Scope & Pricing' : 'Task Items & Pricing'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleImportUnbilledHours}
                      className="flex items-center gap-1 rounded bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-100"
                    >
                      <Clock className="h-3 w-3" />
                      <span>Import Time Clock Hours</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-200"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add Row</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-3">
                  {formItems.map((item, idx) => (
                    <div key={item.id} className="flex items-center gap-2">
                      <span className="w-5 text-center text-slate-400 font-mono">{idx + 1}</span>
                      <input
                        type="text"
                        required
                        placeholder="Task description (e.g. Backyard excavation, 6x Boxwoods, Mulch spreading)"
                        value={item.task}
                        onChange={(e) => handleUpdateItem(item.id, 'task', e.target.value)}
                        className="flex-1 rounded border border-slate-300 bg-white px-2.5 py-1.5 text-slate-900 text-xs"
                      />
                      <div className="w-20">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) =>
                            handleUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 1)
                          }
                          className="w-full rounded border border-slate-300 bg-white px-2 py-1.5 text-center font-mono text-slate-900"
                        />
                      </div>
                      <div className="w-28">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Price $"
                          value={item.price}
                          onChange={(e) =>
                            handleUpdateItem(item.id, 'price', parseFloat(e.target.value) || 0)
                          }
                          className="w-full rounded border border-slate-300 bg-white px-2.5 py-1.5 text-right font-mono font-bold text-slate-900"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        disabled={formItems.length <= 1}
                        className="p-1 text-slate-400 hover:text-red-600 disabled:opacity-20"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-right">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span className="font-mono font-semibold">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>HST ({(profile.taxRate * 100).toFixed(0)}%):</span>
                    <span className="font-mono font-semibold">${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-1 text-sm font-bold text-slate-900">
                    <span>{modalType === 'estimate' ? 'Estimated Total:' : 'Total:'}</span>
                    <span className="font-mono text-emerald-900">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Terms & Conditions preview */}
              <div className="rounded-lg bg-emerald-50/50 border border-emerald-200 p-3 text-slate-700">
                <p className="font-semibold text-emerald-950 mb-1">
                  Enforced Terms from "invoice - Sheet1.pdf":
                </p>
                <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-700">
                  {formTerms.map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg px-4 py-2 font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`rounded-lg px-5 py-2 font-semibold text-white shadow-sm ${
                    modalType === 'estimate'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-emerald-700 hover:bg-emerald-800'
                  }`}
                >
                  {modalType === 'estimate'
                    ? 'Save Estimate & Preview Quote'
                    : 'Create & Preview Invoice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
