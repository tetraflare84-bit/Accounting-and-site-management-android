import React from 'react';
import {
  BookOpen,
  Camera,
  MapPin,
  Clock,
  FileText,
  FileSpreadsheet,
  Cloud,
  CheckCircle,
  HelpCircle,
  Smartphone,
  Edit3,
} from 'lucide-react';

export const UserGuideView: React.FC = () => {
  return (
    <div className="max-w-4xl space-y-6">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-900 to-emerald-950 p-6 sm:p-8 text-white shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-6 w-6 text-emerald-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300">
            Operations & Field Team Handbook
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          PlantPro Employee & Onboarding Guide
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-2xl">
          Complete standard operating procedures for field technicians, crew leads, accountants, and office managers using the PlantPro system for Your Neighbourhood Plant Guy.
        </p>
      </div>

      {/* Guide Modules */}
      <div className="space-y-4">
        {/* Module 1: Daily Expenses & OCR */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <Camera className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                1. Snapping Receipts & Automated AI OCR
              </h3>
              <p className="text-[11px] text-slate-500">
                For crew purchasing plants, soil, fuel, tools, or paying dump tipping fees
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
            <p>
              Whenever you purchase nursery plants, soil, fuel, or pay waste transfer station fees:
            </p>
            <ol className="list-decimal list-inside space-y-1.5 pl-2 text-slate-600">
              <li>
                Tap <strong>+ Log Expense</strong> or the camera icon on the dashboard.
              </li>
              <li>
                Tap <strong>Take Photo / Upload</strong> to open your phone camera. Keep the receipt flat with good lighting.
              </li>
              <li>
                Gemini Vision AI instantly scans the receipt image and automatically extracts:
                <ul className="list-disc list-inside pl-4 mt-1 space-y-0.5 text-slate-500">
                  <li>Store Name (e.g. Green Thumb Nursery, Shell Gas)</li>
                  <li>Transaction Date & Time</li>
                  <li>Itemized Line Items (quantities, prices)</li>
                  <li>13% Ontario HST Tax and Total Amount</li>
                  <li>Auto-selects the Landscaping Budget Category (Plants, Soil, Tools, Fuel, Disposal)</li>
                </ul>
              </li>
              <li>
                Select the <strong>Client / Job Site</strong> (e.g., <em>57 Magani</em>) so the materials are attributed to that project.
              </li>
              <li>
                Tap <strong>Save to Offline Ledger</strong>. The receipt is permanently saved to your device.
              </li>
            </ol>
          </div>
        </div>

        {/* Module 2: Site Photo Directory & Drawing Annotation */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <Edit3 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                2. Site Photo Directory & Drawing Markup
              </h3>
              <p className="text-[11px] text-slate-500">
                Managing client file folders (e.g. 57 Magani), garden designs & photo comments
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
            <ol className="list-decimal list-inside space-y-1.5 pl-2 text-slate-600">
              <li>
                Navigate to the <strong>Sites & Photos</strong> tab and select your active job site (e.g., <em>57 Magani</em>).
              </li>
              <li>
                Notice the virtual folder directory matching Trevor's desktop workflow:
                <strong> /Plants</strong>, <strong>/Designs</strong>, <strong>/Photos</strong>, <strong>/Invoices</strong>, and <strong>/Shopping Lists</strong>.
              </li>
              <li>
                Tap <strong>Snap / Add Site Photo</strong> to document before/after stages, troubled boxwoods, or lawn grading.
              </li>
              <li>
                <strong>Draw on Photos:</strong> Tap any photo thumbnail to open the interactive canvas markup tool.
                <ul className="list-disc list-inside pl-4 mt-1 space-y-0.5 text-slate-500">
                  <li>Use the <strong>Pen</strong> tool for freehand boundary drawing.</li>
                  <li>Use the <strong>Arrow</strong> tool to point to walkway borders or drainage slopes.</li>
                  <li>Use the <strong>Rectangle / Circle</strong> tools to mark shrub planting zones.</li>
                  <li>Use the <strong>Text</strong> tool to click and type notes (e.g. <em>"6x Boxwood Hedge along fence"</em>).</li>
                </ul>
              </li>
              <li>
                Tap <strong>Save Markup</strong> to save the annotated photo into the client's file vault.
              </li>
              <li>
                <strong>Shopping List Notepad:</strong> Edit <code>shopping list.txt</code> directly inside the client folder for nursery runs.
              </li>
            </ol>
          </div>
        </div>

        {/* Module 3: GPS Tagging & Navigation */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <MapPin className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                3. GPS Site Coordinates & Turn-by-Turn Navigation
              </h3>
              <p className="text-[11px] text-slate-500">
                Pinpoint exact customer properties and launch Google Maps
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <p>
              When arriving at a client site in the work truck:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>
                Open the <strong>Sites & Photos</strong> tab and tap <strong>Tag Device GPS</strong>.
              </li>
              <li>
                Your device will record high-accuracy latitude and longitude coordinates.
              </li>
              <li>
                Click <strong>Google Maps</strong> at any time to open instant driving directions for your crew.
              </li>
            </ul>
          </div>
        </div>

        {/* Module 4: Time Clock & Labor Tracking */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                4. Punch Clock & On-Site Labor Tracking
              </h3>
              <p className="text-[11px] text-slate-500">
                Punching in/out, tracking billable time, and job costing
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>
                Select your client site and hourly rate ($65/hr default).
              </li>
              <li>
                Tap <strong>Punch In (Start)</strong> when beginning garden bed excavation, pruning, or planting.
              </li>
              <li>
                The live display shows elapsed time and live billable earnings updated in real time.
              </li>
              <li>
                Tap <strong>Punch Out & Log</strong> when leaving the site. The session is saved to your log history.
              </li>
              <li>
                When generating client invoices, click <strong>Import Time Clock Hours</strong> to automatically bill tracked labor!
              </li>
            </ul>
          </div>
        </div>

        {/* Module 5: Invoicing & Printable PDF */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                5. Creating & Printing Branded Invoices
              </h3>
              <p className="text-[11px] text-slate-500">
                Formatted to Trevor Auton's exact "invoice - Sheet1.pdf" layout and terms
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <p>
              Invoices generated by PlantPro strictly adhere to the business policies of <strong>Your Neighbourhood Plant Guy</strong>:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>
                <strong>Customer Materials Policy:</strong> Includes <em>"Customer to provide all materials in advance prior to project completion"</em>.
              </li>
              <li>
                <strong>Disposal Policy:</strong> Includes <em>"All disposal handled through yard waste or additional charges apply"</em>.
              </li>
              <li>
                <strong>Seasonal Regime:</strong> Includes <em>"Spring openings and Fall cleanups not part of scheduled lawn maintenance regimes"</em>.
              </li>
              <li>
                Click <strong>View</strong> $\rightarrow$ <strong>Print / Save PDF</strong> to generate client-ready invoices directly from your phone or truck tablet.
              </li>
              <li>
                You can also upload an existing invoice screenshot or PDF to parse automatically with Gemini AI!
              </li>
            </ul>
          </div>
        </div>

        {/* Module 6: Google Sheets Export & Cloud Sync */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                6. Google Sheets Export & Offsite Cloud Backups
              </h3>
              <p className="text-[11px] text-slate-500">
                For bookkeepers, CPAs, and business owners doing monthly financial closes
              </p>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 leading-relaxed">
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>
                Click <strong>Export to Google Sheets</strong> from the Reports or Expenses view.
              </li>
              <li>
                Downloads clean, RFC-4180 standard CSV files with tabular numbers and category breakdown.
              </li>
              <li>
                In Google Drive: click <strong>New</strong> $\rightarrow$ <strong>File Upload</strong> $\rightarrow$ Open in Google Sheets. All columns, taxes, and vendor totals format perfectly.
              </li>
              <li>
                In <strong>Settings</strong>: configure automated syncing to Google Drive or Backblaze B2, or download a full JSON snapshot of your business database.
              </li>
            </ul>
          </div>
        </div>

        {/* Module 7: Compiling into Android APK & Sideloading */}
        <div className="rounded-xl border border-emerald-300 bg-emerald-50/40 p-5 shadow-xs">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white">
              <Smartphone className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-950">
                7. Compiling to Android APK & Native Device Installation
              </h3>
              <p className="text-[11px] text-emerald-800 font-medium">
                How to run PlantPro as a standalone native Android app (.apk) on your device
              </p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
            <div className="rounded-lg bg-white p-3.5 border border-emerald-200">
              <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Method A: 1-Tap Native Android WebAPK (Recommended - No PC required)</span>
              </h4>
              <p className="text-slate-600">
                Android OS includes a native WebAPK compiler built into Google Chrome. When you visit this app on an Android device:
              </p>
              <ol className="list-decimal list-inside pl-2 mt-1.5 space-y-1 text-slate-600">
                <li>Open the app URL in Google Chrome on your Android phone.</li>
                <li>Tap the <strong>Install App</strong> button in the top header (or Chrome menu ⋮ $\rightarrow$ <em>Install app</em>).</li>
                <li>Android automatically compiles and installs a standalone APK package on your device.</li>
                <li>It appears in your app launcher with the Trevor Auton logo, launches full screen without browser bars, and runs 100% offline.</li>
              </ol>
            </div>

            <div className="rounded-lg bg-white p-3.5 border border-emerald-200">
              <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Method B: Download Standalone Signed .APK File (PWABuilder / TWA)</span>
              </h4>
              <p className="text-slate-600">
                If you need a standalone <code>.apk</code> installer file to sideload via Android Package Installer or upload to Google Play:
              </p>
              <ol className="list-decimal list-inside pl-2 mt-1.5 space-y-1 text-slate-600">
                <li>Go to official Google/Microsoft tool: <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-emerald-700 font-semibold underline">PWABuilder.com</a>.</li>
                <li>Enter your shared app URL (available in Settings or the browser bar).</li>
                <li>Click <strong>Package for Android</strong>.</li>
                <li>Click <strong>Generate APK</strong> to download your signed <code>.apk</code> file instantly!</li>
              </ol>
            </div>

            <div className="rounded-lg bg-white p-3.5 border border-emerald-200">
              <h4 className="font-bold text-slate-900 mb-1 flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <span>Method C: Capacitor / Android Studio Project</span>
              </h4>
              <p className="text-slate-600">
                The repository includes <code>capacitor.config.json</code> with app ID <code>com.plantpro.fieldops</code>. You can run <code>npx cap add android</code> and build directly in Android Studio with <code>./gradlew assembleDebug</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
