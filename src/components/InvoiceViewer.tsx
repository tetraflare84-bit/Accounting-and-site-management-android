import React from 'react';
import { Printer, ArrowLeft, ArrowRight, CheckCircle, Clock, XCircle, FileText } from 'lucide-react';
import { Invoice, Estimate, CompanyProfile } from '../types';

interface InvoiceViewerProps {
  document: Invoice | Estimate;
  documentType: 'invoice' | 'estimate';
  profile: CompanyProfile;
  onBack: () => void;
  onStatusChange?: (newStatus: any) => void;
  onConvertToInvoice?: (estimate: Estimate) => void;
}

export const InvoiceViewer: React.FC<InvoiceViewerProps> = ({
  document,
  documentType,
  profile,
  onBack,
  onStatusChange,
  onConvertToInvoice,
}) => {
  const isEstimate = documentType === 'estimate';
  const estimate = isEstimate ? (document as Estimate) : null;
  const invoice = !isEstimate ? (document as Invoice) : null;

  const docNumber = isEstimate ? estimate!.estimateNumber : invoice!.invoiceNumber;
  const dueDateOrValidUntil = isEstimate ? estimate!.validUntil : invoice!.dueDate;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-4xl pb-12">
      {/* Action Bar (hidden during browser printing) */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm print:hidden">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to {isEstimate ? 'Estimates & Quotes' : 'Invoices'}</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* If Estimate: Convert to Invoice button */}
          {isEstimate && onConvertToInvoice && (
            <button
              onClick={() => onConvertToInvoice(estimate!)}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-800 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-900 transition active:scale-95"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>Convert to Active Invoice</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Status changer */}
          {onStatusChange && (
            <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs">
              <span className="px-2 text-slate-500 font-medium">Status:</span>
              {isEstimate ? (
                <>
                  <button
                    onClick={() => onStatusChange('pending')}
                    className={`rounded px-2.5 py-1 font-medium transition ${
                      estimate?.status === 'pending'
                        ? 'bg-amber-100 text-amber-900 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Pending Choice
                  </button>
                  <button
                    onClick={() => onStatusChange('accepted')}
                    className={`rounded px-2.5 py-1 font-medium transition ${
                      estimate?.status === 'accepted'
                        ? 'bg-emerald-100 text-emerald-900 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Client Approved
                  </button>
                  <button
                    onClick={() => onStatusChange('declined')}
                    className={`rounded px-2.5 py-1 font-medium transition ${
                      estimate?.status === 'declined'
                        ? 'bg-red-100 text-red-900 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Declined
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => onStatusChange('draft')}
                    className={`rounded px-2.5 py-1 font-medium transition ${
                      invoice?.status === 'draft'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Draft
                  </button>
                  <button
                    onClick={() => onStatusChange('sent')}
                    className={`rounded px-2.5 py-1 font-medium transition ${
                      invoice?.status === 'sent'
                        ? 'bg-amber-100 text-amber-900 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sent
                  </button>
                  <button
                    onClick={() => onStatusChange('paid')}
                    className={`rounded px-2.5 py-1 font-medium transition ${
                      invoice?.status === 'paid'
                        ? 'bg-emerald-100 text-emerald-900 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Paid
                  </button>
                </>
              )}
            </div>
          )}

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
          >
            <Printer className="h-4 w-4" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>

      {/* Document Canvas - Exact structure matching 'invoice - Sheet1.pdf' */}
      <div className="rounded-xl border border-slate-200 bg-white p-8 sm:p-12 shadow-md print:border-none print:p-0 print:shadow-none font-sans">
        {/* Document Kind Banner for Estimate */}
        {isEstimate && (
          <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 flex items-center justify-between text-xs font-semibold text-amber-900 print:hidden">
            <span>JOB QUOTE & ESTIMATE (Awaiting Client Approval)</span>
            <span className="uppercase text-[11px] font-bold">Status: {estimate?.status}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex items-start justify-between border-b-2 border-emerald-800 pb-6">
          <div className="flex items-center gap-4">
            {profile.logoUri ? (
              <img
                src={profile.logoUri}
                alt={profile.name}
                className="h-20 w-20 rounded-full border-2 border-emerald-700 object-cover"
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-800 text-2xl font-bold text-white">
                PG
              </div>
            )}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                {isEstimate ? 'Plant Guy — Job Quote & Estimate' : 'Plant Guy — Invoice'}
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {profile.name}
              </h1>
              <p className="text-sm font-medium text-slate-600 italic">
                {profile.tagline}
              </p>
            </div>
          </div>

          <div className="text-right text-xs leading-relaxed text-slate-700">
            <p className="font-semibold text-slate-900">{profile.ownerName}</p>
            <p>{profile.email}</p>
            <div className="mt-1 flex items-center justify-end gap-3 font-mono font-medium">
              <span>{profile.officePhone}</span>
              <span>·</span>
              <span>{profile.cellPhone}</span>
            </div>
            {profile.website && (
              <p className="text-emerald-700 font-medium">{profile.website}</p>
            )}
            {profile.taxNumber && (
              <p className="text-slate-500 font-mono text-[11px]">{profile.taxNumber}</p>
            )}
          </div>
        </div>

        {/* Client Metadata Grid */}
        <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4 border border-slate-200 text-sm">
          <div>
            <div className="flex items-baseline gap-2 mb-1.5">
              <span className="w-18 shrink-0 font-semibold text-slate-700">Name:</span>
              <span className="font-medium text-slate-900">{document.clientName}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="w-18 shrink-0 font-semibold text-slate-700">Address:</span>
              <span className="text-slate-800">{document.clientAddress}</span>
            </div>
          </div>

          <div className="sm:text-right">
            <div className="flex sm:justify-end items-baseline gap-2 mb-1.5">
              <span className="font-semibold text-slate-700">Phone:</span>
              <span className="font-mono text-slate-800">{document.clientPhone}</span>
            </div>
            <div className="flex sm:justify-end items-baseline gap-2 mb-1.5">
              <span className="font-semibold text-slate-700">
                {isEstimate ? 'Quote Date:' : 'Date:'}
              </span>
              <span className="font-mono text-slate-800">{document.date}</span>
            </div>
            <div className="flex sm:justify-end items-baseline gap-2">
              <span className="font-semibold text-slate-700">
                {isEstimate ? 'Estimate #:' : 'Invoice #:'}
              </span>
              <span className="font-mono font-bold text-emerald-800">
                {docNumber}
              </span>
            </div>
            {dueDateOrValidUntil && (
              <div className="flex sm:justify-end items-baseline gap-2 mt-1">
                <span className="text-slate-500 text-xs">
                  {isEstimate ? 'Valid Until:' : 'Due Date:'}
                </span>
                <span className="font-mono text-xs text-slate-700">{dueDateOrValidUntil}</span>
              </div>
            )}
          </div>
        </div>

        {/* Line Items Table (Matches ruled sheet styling from invoice PDF) */}
        <div className="overflow-hidden rounded-lg border-2 border-slate-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b-2 border-slate-800 bg-slate-100 text-slate-900 font-bold">
              <tr>
                <th className="px-4 py-2.5 w-12 text-center border-r border-slate-300">#</th>
                <th className="px-4 py-2.5">
                  {isEstimate ? 'Proposed Task / Work Scope' : 'Task'}
                </th>
                <th className="px-6 py-2.5 text-right w-36 border-l border-slate-800">
                  Price ($)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {document.items.map((item, idx) => (
                <tr key={item.id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-center text-xs text-slate-500 font-mono border-r border-slate-200">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {item.task}
                    {item.quantity > 1 && (
                      <span className="ml-2 text-xs text-slate-500">
                        (Qty: {item.quantity})
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right font-mono font-semibold text-slate-900 border-l border-slate-800 tabular-nums">
                    ${item.extPrice.toFixed(2)}
                  </td>
                </tr>
              ))}

              {/* Pad with empty lines if fewer than 5 items for authentic printable appearance */}
              {Array.from({ length: Math.max(0, 5 - document.items.length) }).map((_, i) => (
                <tr key={`pad_${i}`} className="h-10">
                  <td className="border-r border-slate-200" />
                  <td />
                  <td className="border-l border-slate-800" />
                </tr>
              ))}
            </tbody>
            {/* Table Footer Totals */}
            <tfoot className="border-t-2 border-slate-800 bg-slate-50">
              {document.taxAmount > 0 && (
                <>
                  <tr className="border-b border-slate-200">
                    <td colSpan={2} className="px-4 py-2 text-right text-xs font-semibold text-slate-600">
                      Subtotal:
                    </td>
                    <td className="px-6 py-2 text-right font-mono text-xs font-semibold text-slate-800 border-l border-slate-800 tabular-nums">
                      ${document.subtotal.toFixed(2)}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td colSpan={2} className="px-4 py-2 text-right text-xs font-semibold text-slate-600">
                      HST ({(document.taxRate * 100).toFixed(0)}%):
                    </td>
                    <td className="px-6 py-2 text-right font-mono text-xs font-semibold text-slate-800 border-l border-slate-800 tabular-nums">
                      ${document.taxAmount.toFixed(2)}
                    </td>
                  </tr>
                </>
              )}
              <tr className="bg-slate-100 font-bold text-base">
                <td colSpan={2} className="px-4 py-3 text-right text-slate-900">
                  {isEstimate ? 'Estimated Total:' : 'Total:'}
                </td>
                <td className="px-6 py-3 text-right font-mono text-lg text-emerald-900 border-l border-slate-800 tabular-nums">
                  ${document.total.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Terms & Conditions (Verbatim from invoice - Sheet1.pdf) */}
        <div className="mt-8 rounded-lg bg-emerald-50/60 p-4 border border-emerald-200 text-xs text-slate-700 leading-relaxed">
          <p className="font-semibold text-emerald-950 uppercase tracking-wider mb-2">
            {isEstimate ? 'Estimate & Proposal Terms' : 'Project Terms & Conditions'}
          </p>
          <ul className="space-y-1.5 list-disc list-inside">
            {document.terms.map((term, i) => (
              <li key={i} className="text-slate-800">
                {term}
              </li>
            ))}
          </ul>
        </div>

        {/* Acceptance Authorization Signature Block for Estimates */}
        {isEstimate && (
          <div className="mt-6 rounded-lg border-2 border-dashed border-amber-300 bg-amber-50/40 p-4 text-xs">
            <p className="font-bold text-amber-950 uppercase tracking-wider mb-2">
              Client Acceptance & Work Authorization
            </p>
            <p className="text-slate-600 mb-4">
              By signing below or approving via phone/text/email, the client authorizes Your Neighbourhood Plant Guy to proceed with the specified scope, scheduling, and payment terms.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="border-b border-slate-400 pb-1">
                <span className="text-[10px] text-slate-400 uppercase">Authorized Client Signature</span>
              </div>
              <div className="border-b border-slate-400 pb-1">
                <span className="text-[10px] text-slate-400 uppercase">Date of Acceptance</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Thank You Note */}
        <div className="mt-6 text-center text-xs text-slate-500">
          <p>
            {profile.name} · {profile.email} · {profile.cellPhone}
          </p>
          <p className="mt-1">
            Eco-Friendly plant care, tree trimming, garden installations & property maintenance.
          </p>
        </div>
      </div>
    </div>
  );
};
