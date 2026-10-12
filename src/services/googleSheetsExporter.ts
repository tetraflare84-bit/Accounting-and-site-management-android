import { Expense, Invoice, Estimate, ClientSite, TimeLog, CompanyProfile } from '../types';

// Escapes CSV cell according to RFC 4180
function escapeCsv(value: any): string {
  if (value === null || value === undefined) return '""';
  const stringValue = String(value);
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return `"${stringValue}"`;
}

// Download helper for browser
export function downloadFile(content: string, filename: string, mimeType = 'text/csv;charset=utf-8;'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const GoogleSheetsExporter = {
  // 1. Export Expenses Sheet
  generateExpensesCsv(expenses: Expense[], filterCategory?: string): string {
    const list = filterCategory
      ? expenses.filter((e) => e.category.toLowerCase() === filterCategory.toLowerCase())
      : expenses;

    const headers = [
      'Transaction Date',
      'Merchant / Vendor',
      'Budget Category',
      'Sub-Category',
      'Client / Site Tag',
      'Subtotal',
      'Tax Amount',
      'Total Amount',
      'Currency',
      'Payment Method',
      'Receipt Ref #',
      'Itemized Description & Notes',
    ];

    const rows = list.map((e) => [
      e.date,
      e.merchant,
      e.category,
      e.subCategory || '',
      e.clientName || 'General Overhead',
      (e.amount - e.tax).toFixed(2),
      e.tax.toFixed(2),
      e.amount.toFixed(2),
      e.currency || '$',
      e.paymentMethod,
      e.receiptNumber || '',
      e.notes || '',
    ]);

    const csvContent = [
      headers.map(escapeCsv).join(','),
      ...rows.map((row) => row.map(escapeCsv).join(',')),
    ].join('\r\n');

    return csvContent;
  },

  // 2. Export Invoices Sheet
  generateInvoicesCsv(invoices: Invoice[]): string {
    const headers = [
      'Invoice #',
      'Issue Date',
      'Due Date',
      'Client Name',
      'Client Phone',
      'Client Address',
      'Subtotal',
      'Tax Rate',
      'Tax Amount',
      'Total Invoice $',
      'Payment Status',
      'Paid Date',
      'Task Items Breakdown',
    ];

    const rows = invoices.map((inv) => [
      inv.invoiceNumber,
      inv.date,
      inv.dueDate,
      inv.clientName,
      inv.clientPhone,
      inv.clientAddress,
      inv.subtotal.toFixed(2),
      `${(inv.taxRate * 100).toFixed(0)}%`,
      inv.taxAmount.toFixed(2),
      inv.total.toFixed(2),
      inv.status.toUpperCase(),
      inv.paidDate || '',
      inv.items.map((i) => `${i.task} ($${i.price.toFixed(2)})`).join(' | '),
    ]);

    return [
      headers.map(escapeCsv).join(','),
      ...rows.map((row) => row.map(escapeCsv).join(',')),
    ].join('\r\n');
  },

  // 2b. Export Quotes & Estimates Sheet
  generateEstimatesCsv(estimates: Estimate[]): string {
    const headers = [
      'Estimate #',
      'Issue Date',
      'Valid Until Date',
      'Client Name',
      'Client Phone',
      'Client Address',
      'Subtotal',
      'Tax Rate',
      'Tax Amount',
      'Total Quote $',
      'Quote Status',
      'Converted Invoice ID',
      'Task Scope Breakdown',
    ];

    const rows = estimates.map((est) => [
      est.estimateNumber,
      est.date,
      est.validUntil,
      est.clientName,
      est.clientPhone,
      est.clientAddress,
      est.subtotal.toFixed(2),
      `${(est.taxRate * 100).toFixed(0)}%`,
      est.taxAmount.toFixed(2),
      est.total.toFixed(2),
      est.status.toUpperCase(),
      est.convertedInvoiceId || '',
      est.items.map((i) => `${i.task} ($${i.price.toFixed(2)})`).join(' | '),
    ]);

    return [
      headers.map(escapeCsv).join(','),
      ...rows.map((row) => row.map(escapeCsv).join(',')),
    ].join('\r\n');
  },

  // 3. Export Time Tracking & Labor Sheet
  generateTimeLogsCsv(timeLogs: TimeLog[]): string {
    const headers = [
      'Date',
      'Client / Site',
      'Employee / Contractor',
      'Start Time',
      'End Time',
      'Duration (Minutes)',
      'Duration (Hours)',
      'Hourly Rate',
      'Total Labor Value',
      'Task Performed',
      'Billed to Invoice',
    ];

    const rows = timeLogs.map((log) => [
      log.date,
      log.clientName,
      log.employeeName,
      log.startTime,
      log.endTime,
      log.durationMinutes,
      (log.durationMinutes / 60).toFixed(2),
      log.hourlyRate.toFixed(2),
      ((log.durationMinutes / 60) * log.hourlyRate).toFixed(2),
      log.taskDescription,
      log.billed ? 'YES' : 'PENDING',
    ]);

    return [
      headers.map(escapeCsv).join(','),
      ...rows.map((row) => row.map(escapeCsv).join(',')),
    ].join('\r\n');
  },

  // 4. Export Client Sites & GPS Directory Sheet
  generateClientsCsv(clients: ClientSite[]): string {
    const headers = [
      'Site / Client Name',
      'Phone Number',
      'Email Address',
      'Physical Address',
      'GPS Latitude',
      'GPS Longitude',
      'Project Folders',
      'Site Notes',
      'Created Date',
    ];

    const rows = clients.map((c) => [
      c.name,
      c.phone,
      c.email,
      c.address,
      c.gpsCoordinates?.lat || '',
      c.gpsCoordinates?.lng || '',
      c.folders.join(', '),
      c.notes,
      c.createdAt,
    ]);

    return [
      headers.map(escapeCsv).join(','),
      ...rows.map((row) => row.map(escapeCsv).join(',')),
    ].join('\r\n');
  },

  // 5. Export Executive Profit & Loss Summary
  generateProfitLossCsv(
    profile: CompanyProfile,
    invoices: Invoice[],
    expenses: Expense[],
    timeLogs: TimeLog[]
  ): string {
    const totalRevenue = invoices
      .filter((i) => i.status === 'paid')
      .reduce((sum, i) => sum + i.total, 0);

    const pendingRevenue = invoices
      .filter((i) => i.status === 'sent' || i.status === 'overdue')
      .reduce((sum, i) => sum + i.total, 0);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalRevenue - totalExpenses;
    const margin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Group expenses by category
    const categoryTotals: { [key: string]: number } = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const lines = [
      `"EXECUTIVE FINANCIAL SUMMARY - ${profile.name}"`,
      `"Generated for:",${escapeCsv(profile.ownerName)},"Date:",${escapeCsv(new Date().toLocaleDateString())}`,
      `"Company Phone:",${escapeCsv(profile.cellPhone)},"Tax ID:",${escapeCsv(profile.taxNumber || 'N/A')}`,
      '""',
      '"KEY PERFORMANCE METRICS","AMOUNT ($)","NOTES"',
      `"Total Collected Revenue",${totalRevenue.toFixed(2)},"From Paid Invoices"`,
      `"Pending Receivables",${pendingRevenue.toFixed(2)},"Awaiting Client Payment"`,
      `"Total Operating Expenses",${totalExpenses.toFixed(2)},"Receipts & Purchases Logged"`,
      `"Net Operating Profit",${netProfit.toFixed(2)},"Collected Revenue - Total Expenses"`,
      `"Operating Profit Margin",${margin.toFixed(1)}%,"Margin percentage"`,
      '""',
      '"EXPENSES BREAKDOWN BY CATEGORY","TOTAL SPENT ($)","% OF EXPENSES"',
      ...Object.entries(categoryTotals).map(([cat, amt]) => {
        const pct = totalExpenses > 0 ? (amt / totalExpenses) * 100 : 0;
        return `${escapeCsv(cat)},${amt.toFixed(2)},${pct.toFixed(1)}%`;
      }),
    ];

    return lines.join('\r\n');
  },
};
