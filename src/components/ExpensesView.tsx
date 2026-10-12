import React, { useState, useRef } from 'react';
import {
  Camera,
  Plus,
  Receipt,
  Search,
  Filter,
  Download,
  Upload,
  Sparkles,
  Check,
  AlertCircle,
  X,
  Trash2,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import { Expense, CompanyProfile, ClientSite, LineItem } from '../types';
import { GoogleSheetsExporter, downloadFile } from '../services/googleSheetsExporter';

interface ExpensesViewProps {
  expenses: Expense[];
  profile: CompanyProfile;
  clients: ClientSite[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  openWithCameraTrigger?: boolean;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  profile,
  clients,
  onAddExpense,
  onDeleteExpense,
  openWithCameraTrigger = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(openWithCameraTrigger);
  const [previewReceiptUri, setPreviewReceiptUri] = useState<string | null>(null);

  // Form State
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [ocrSuccessMessage, setOcrSuccessMessage] = useState<string | null>(null);

  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formMerchant, setFormMerchant] = useState('');
  const [formCategory, setFormCategory] = useState('Plants & Nursery');
  const [formAmount, setFormAmount] = useState('');
  const [formTax, setFormTax] = useState('');
  const [formPaymentMethod, setFormPaymentMethod] = useState('Visa');
  const [formReceiptNumber, setFormReceiptNumber] = useState('');
  const [formClientId, setFormClientId] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formImageUri, setFormImageUri] = useState<string | null>(null);
  const [formLineItems, setFormLineItems] = useState<LineItem[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Filtered expenses
  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.notes && e.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (e.clientName && e.clientName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      selectedCategory === 'All' || e.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Reset form
  const resetForm = () => {
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormMerchant('');
    setFormCategory('Plants & Nursery');
    setFormAmount('');
    setFormTax('');
    setFormPaymentMethod('Visa');
    setFormReceiptNumber('');
    setFormClientId('');
    setFormNotes('');
    setFormImageUri(null);
    setFormLineItems([]);
    setScanError(null);
    setOcrSuccessMessage(null);
  };

  // Run OCR on an image base64
  const processImageOCR = async (base64: string, mimeType = 'image/jpeg') => {
    setIsScanning(true);
    setScanError(null);
    setOcrSuccessMessage(null);

    try {
      const res = await fetch('/api/ocr/receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || json.details || 'OCR service failed');
      }

      if (json.data) {
        const data = json.data;
        if (data.merchant) setFormMerchant(data.merchant);
        if (data.date) setFormDate(data.date);
        if (data.total !== undefined) setFormAmount(String(data.total));
        if (data.tax !== undefined) setFormTax(String(data.tax));
        if (data.category) setFormCategory(data.category);
        if (data.paymentMethod) setFormPaymentMethod(data.paymentMethod);
        if (data.receiptNumber) setFormReceiptNumber(data.receiptNumber);
        if (data.notes) setFormNotes(data.notes);
        if (Array.isArray(data.lineItems)) setFormLineItems(data.lineItems);

        setOcrSuccessMessage(
          `Extracted ${data.merchant} ($${data.total}) and categorized as "${data.category}".`
        );
      }
    } catch (err: any) {
      console.error('OCR scan failed:', err);
      setScanError(
        err.message || 'Unable to scan receipt. Please enter fields manually.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  // Handle file upload / camera capture
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormImageUri(base64);
      processImageOCR(base64, file.type || 'image/jpeg');
    };
    reader.readAsDataURL(file);
  };

  // Load sample receipt for quick testing
  const handleLoadSampleReceipt = () => {
    const sampleUri = '/src/assets/images/receipt_nursery_sample_1791836681709.jpg';
    setFormImageUri(sampleUri);
    // Convert to base64 or run OCR directly
    fetch(sampleUri)
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          processImageOCR(base64, 'image/jpeg');
        };
        reader.readAsDataURL(blob);
      });
  };

  // Save expense to ledger
  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMerchant || !formAmount) {
      alert('Please provide merchant name and total amount.');
      return;
    }

    const matchedClient = clients.find((c) => c.id === formClientId);

    const newExpense: Expense = {
      id: `exp_${Date.now()}`,
      date: formDate,
      merchant: formMerchant,
      category: formCategory,
      amount: parseFloat(formAmount) || 0,
      tax: parseFloat(formTax) || 0,
      currency: profile.currency,
      paymentMethod: formPaymentMethod,
      receiptNumber: formReceiptNumber,
      receiptImageUri: formImageUri || undefined,
      notes: formNotes,
      clientId: formClientId || undefined,
      clientName: matchedClient?.name,
      lineItems: formLineItems,
      synced: true,
      createdAt: new Date().toISOString(),
    };

    onAddExpense(newExpense);
    setIsModalOpen(false);
    resetForm();
  };

  // Export to Google Sheets
  const handleExportGoogleSheets = (category?: string) => {
    const csvData = GoogleSheetsExporter.generateExpensesCsv(expenses, category);
    const filename = category
      ? `PlantPro_Expenses_${category.replace(/\s+/g, '_')}_GoogleSheets.csv`
      : 'PlantPro_Expenses_Master_GoogleSheets.csv';
    downloadFile(csvData, filename);
  };

  return (
    <div className="space-y-6">
      {/* View Header with Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Daily Expense Ledger & Receipts
          </h2>
          <p className="text-xs text-slate-500">
            Track job expenses, photograph receipts & auto-categorize with Gemini AI
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleExportGoogleSheets(selectedCategory === 'All' ? undefined : selectedCategory)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
            title="Download CSV for Google Sheets"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
            <span>Export to Google Sheets</span>
          </button>

          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800 transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>+ Log Expense</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search vendor, receipt note, or client site..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs text-slate-500 font-medium shrink-0">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 focus:border-emerald-600 focus:outline-none shrink-0"
          >
            <option value="All">All Categories ({expenses.length})</option>
            {profile.categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary KPI Strip for Current Filter */}
      <div className="flex items-center justify-between rounded-lg bg-emerald-50/70 border border-emerald-200 px-4 py-2.5 text-xs text-emerald-950 font-medium">
        <span>
          Showing <strong>{filteredExpenses.length}</strong> transactions
          {selectedCategory !== 'All' && ` in "${selectedCategory}"`}
        </span>
        <span className="font-mono text-sm font-bold text-emerald-900 tabular-nums">
          Total: ${totalFilteredAmount.toFixed(2)}
        </span>
      </div>

      {/* Expenses Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-semibold text-slate-600">
              <tr>
                <th className="px-4 py-3">Receipt</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Vendor / Merchant</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Client / Job</th>
                <th className="px-4 py-3 text-right">Tax (HST)</th>
                <th className="px-4 py-3 text-right">Total ($)</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No expense records found. Click "+ Log Expense" to snap a receipt.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3">
                      {exp.receiptImageUri ? (
                        <button
                          onClick={() => setPreviewReceiptUri(exp.receiptImageUri!)}
                          className="group relative flex h-10 w-10 overflow-hidden rounded-md border border-slate-200"
                        >
                          <img
                            src={exp.receiptImageUri}
                            alt="Receipt"
                            className="h-full w-full object-cover transition group-hover:scale-105"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                            <Eye className="h-3.5 w-3.5 text-white" />
                          </div>
                        </button>
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-slate-100 text-slate-400">
                          <Receipt className="h-4 w-4" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-600 tabular-nums">
                      {exp.date}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{exp.merchant}</p>
                      {exp.receiptNumber && (
                        <p className="text-[10px] text-slate-400 font-mono">
                          Ref: #{exp.receiptNumber}
                        </p>
                      )}
                      {exp.notes && (
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">
                          {exp.notes}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-700">{exp.category}</span>
                    </td>
                    <td className="px-4 py-3">
                      {exp.clientName ? (
                        <span className="font-medium text-emerald-800">
                          {exp.clientName}
                        </span>
                      ) : (
                        <span className="text-slate-400">General Overhead</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-500 tabular-nums">
                      ${exp.tax.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      ${exp.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => onDeleteExpense(exp.id)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-red-600 transition"
                        title="Delete entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Expense with Gemini Vision AI OCR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Log Daily Expense & Receipt
                  </h3>
                  <p className="text-xs text-slate-500">
                    Snap receipt with camera or upload screenshot for Gemini OCR
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* OCR Capture Area */}
            <div className="mt-4 rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/40 p-4">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {formImageUri ? (
                    <img
                      src={formImageUri}
                      alt="Captured Receipt"
                      className="h-16 w-16 rounded-lg object-cover border border-emerald-300 shadow-sm"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                      <Camera className="h-7 w-7" />
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                      On-Device Camera & Screenshot OCR
                    </h4>
                    <p className="text-[11px] text-slate-600">
                      Extracts vendor, date, line items, taxes & budget category
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isScanning}
                    className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-50"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    <span>Take Photo / Upload</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLoadSampleReceipt}
                    disabled={isScanning}
                    className="flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-2.5 py-2 text-xs font-medium text-emerald-800 hover:bg-emerald-50 disabled:opacity-50"
                    title="Load pre-built sample nursery receipt"
                  >
                    <span>Test Sample</span>
                  </button>
                </div>
              </div>

              {/* Scanning status banner */}
              {isScanning && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-100 px-3 py-2 text-xs font-medium text-emerald-900 animate-pulse">
                  <Sparkles className="h-4 w-4 animate-spin text-emerald-700" />
                  <span>Gemini Vision is analyzing receipt image & itemizing costs...</span>
                </div>
              )}

              {ocrSuccessMessage && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-emerald-100/80 px-3 py-2 text-xs font-medium text-emerald-900">
                  <Check className="h-4 w-4 text-emerald-700" />
                  <span>{ocrSuccessMessage}</span>
                </div>
              )}

              {scanError && (
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-2 text-xs font-medium text-amber-900">
                  <AlertCircle className="h-4 w-4 text-amber-700" />
                  <span>{scanError}</span>
                </div>
              )}
            </div>

            {/* Manual Form Fields (pre-filled by OCR) */}
            <form onSubmit={handleSaveExpense} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Merchant / Vendor *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Green Thumb Nursery, Shell Gas"
                    value={formMerchant}
                    onChange={(e) => setFormMerchant(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Transaction Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Budget Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none font-medium"
                  >
                    {profile.categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Client / Job Site Attribution
                  </label>
                  <select
                    value={formClientId}
                    onChange={(e) => setFormClientId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="">General Overhead (No Client)</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Total Amount ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono font-bold text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tax Amount (HST/GST)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formTax}
                    onChange={(e) => setFormTax(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="Debit">Debit Card</option>
                    <option value="Cash">Cash</option>
                    <option value="E-Transfer">E-Transfer</option>
                    <option value="Company Account">Company Account</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Receipt / Reference #
                  </label>
                  <input
                    type="text"
                    placeholder="Receipt or invoice number"
                    value={formReceiptNumber}
                    onChange={(e) => setFormReceiptNumber(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Itemized Notes / Materials Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 6x Boxwoods, 8 bags soil, mulch delivery for backyard renovation"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {/* Line items if detected */}
              {formLineItems.length > 0 && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="font-semibold text-slate-700 mb-1.5">
                    Extracted Line Items ({formLineItems.length}):
                  </p>
                  <div className="space-y-1 font-mono text-[11px] text-slate-600 max-h-24 overflow-y-auto">
                    {formLineItems.map((item, i) => (
                      <div key={i} className="flex justify-between">
                        <span>
                          {item.quantity ? `${item.quantity}x ` : ''}
                          {item.description}
                        </span>
                        <span>${item.extPrice?.toFixed(2) || item.price?.toFixed(2) || ''}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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
                  className="rounded-lg bg-emerald-700 px-5 py-2 font-semibold text-white shadow-sm hover:bg-emerald-800"
                >
                  Save to Offline Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Receipt Image Preview Modal */}
      {previewReceiptUri && (
        <div
          onClick={() => setPreviewReceiptUri(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        >
          <div className="relative max-h-[90vh] max-w-lg overflow-hidden rounded-xl bg-white p-2">
            <button
              onClick={() => setPreviewReceiptUri(null)}
              className="absolute right-3 top-3 rounded-full bg-black/60 p-1 text-white hover:bg-black"
            >
              <X className="h-4 w-4" />
            </button>
            <img
              src={previewReceiptUri}
              alt="Receipt Preview"
              className="max-h-[85vh] w-full rounded object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};
