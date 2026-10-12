import React, { useState, useRef } from 'react';
import {
  Settings,
  Cloud,
  Save,
  Plus,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  CheckCircle,
  AlertCircle,
  Building,
  DollarSign,
  Shield,
  Layers,
} from 'lucide-react';
import { CompanyProfile, BudgetCategory, BackupSettings, CloudBackupResult } from '../types';
import { StorageService } from '../services/storage';

interface SettingsViewProps {
  profile: CompanyProfile;
  onUpdateProfile: (profile: CompanyProfile) => void;
  onResetSampleData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile,
  onResetSampleData,
}) => {
  const [formData, setFormData] = useState<CompanyProfile>({ ...profile });
  const [backupStatus, setBackupStatus] = useState<CloudBackupResult | null>(null);
  const [isBackingUp, setIsBackingUp] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // New Category input
  const [newCatName, setNewCatName] = useState('');
  const [newCatDescription, setNewCatDescription] = useState('');
  const [newCatBudget, setNewCatBudget] = useState('1000');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Save profile changes
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  // Add new category
  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newCategory: BudgetCategory = {
      id: `cat_${Date.now()}`,
      name: newCatName.trim(),
      icon: 'Tag',
      description: newCatDescription.trim() || 'Custom budget category',
      color: '#059669',
      monthlyBudget: parseFloat(newCatBudget) || 500,
    };
    const updated = {
      ...formData,
      categories: [...formData.categories, newCategory],
    };
    setFormData(updated);
    onUpdateProfile(updated);
    setNewCatName('');
    setNewCatDescription('');
  };

  // Remove category
  const handleRemoveCategory = (catId: string) => {
    if (formData.categories.length <= 1) {
      alert('You must have at least one category.');
      return;
    }
    const updated = {
      ...formData,
      categories: formData.categories.filter((c) => c.id !== catId),
    };
    setFormData(updated);
    onUpdateProfile(updated);
  };

  // Preset switches for other industries
  const handleApplyPreset = (industry: string) => {
    if (!confirm(`Apply standard category preset for "${industry}"?`)) return;

    let newCats: BudgetCategory[] = [];
    if (industry === 'General Contracting') {
      newCats = [
        { id: 'c1', name: 'Lumber & Framing', icon: 'Box', description: 'Wood, studs, plywood', color: '#b45309', monthlyBudget: 4000 },
        { id: 'c2', name: 'Drywall & Paint', icon: 'Paintbrush', description: 'Sheetrock, mud, primer', color: '#0284c7', monthlyBudget: 1500 },
        { id: 'c3', name: 'Plumbing & Electrical Supplies', icon: 'Zap', description: 'Pipes, wire, outlets', color: '#eab308', monthlyBudget: 2000 },
        { id: 'c4', name: 'Subcontractors', icon: 'Users', description: 'Specialist trades', color: '#9333ea', monthlyBudget: 5000 },
        { id: 'c5', name: 'Fuel & Fleet', icon: 'Fuel', description: 'Truck gas & maintenance', color: '#ea580c', monthlyBudget: 1200 },
        { id: 'c6', name: 'Dumpster & Disposal', icon: 'Trash2', description: 'Roll-off bin rentals', color: '#78716c', monthlyBudget: 800 },
      ];
    } else if (industry === 'Cleaning & Janitorial') {
      newCats = [
        { id: 'c1', name: 'Cleaning Chemicals', icon: 'Sparkles', description: 'Disinfectants, soap', color: '#0284c7', monthlyBudget: 800 },
        { id: 'c2', name: 'Vacuums & Equipment', icon: 'Tool', description: 'Floor buffers, vacuums', color: '#059669', monthlyBudget: 600 },
        { id: 'c3', name: 'Mops, Rags & Consumables', icon: 'Package', description: 'Microfiber, trash bags', color: '#b45309', monthlyBudget: 500 },
        { id: 'c4', name: 'Cleaner Wages', icon: 'Users', description: 'Crew payroll', color: '#9333ea', monthlyBudget: 4500 },
        { id: 'c5', name: 'Vehicle & Gas', icon: 'Fuel', description: 'Route travel fuel', color: '#ea580c', monthlyBudget: 750 },
      ];
    } else {
      // Landscaping default
      newCats = [
        { id: 'cat_plants', name: 'Plants & Nursery', icon: 'Sprout', description: 'Perennials, shrubs, trees', color: '#16a34a', monthlyBudget: 2500 },
        { id: 'cat_soil', name: 'Bulk Soil & Mulch', icon: 'Layers', description: 'Triple mix, mulch, rocks', color: '#b45309', monthlyBudget: 1800 },
        { id: 'cat_tools', name: 'Tools & Equipment', icon: 'Wrench', description: 'Trimmers, mowers, blades', color: '#0284c7', monthlyBudget: 600 },
        { id: 'cat_fuel', name: 'Fuel & Vehicle', icon: 'Fuel', description: 'Truck gas, 2-stroke mix', color: '#ea580c', monthlyBudget: 950 },
        { id: 'cat_disposal', name: 'Disposal & Yard Waste', icon: 'Trash2', description: 'Green waste tipping fees', color: '#78716c', monthlyBudget: 500 },
        { id: 'cat_labor', name: 'Subcontractor & Crew', icon: 'Users', description: 'Seasonal helpers', color: '#9333ea', monthlyBudget: 3200 },
        { id: 'cat_materials', name: 'Materials & Supplies', icon: 'Package', description: 'Edging, fertilizer', color: '#059669', monthlyBudget: 750 },
      ];
    }

    const updated = { ...formData, categories: newCats };
    setFormData(updated);
    onUpdateProfile(updated);
  };

  // Test Cloud Backup Now
  const handleTestCloudBackup = async () => {
    setIsBackingUp(true);
    setBackupStatus(null);
    try {
      const vaultData = StorageService.exportFullVault();
      const res = await fetch('/api/cloud-backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: formData.backupSettings.provider,
          vaultData,
          targetFolder: formData.backupSettings.targetFolder,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Backup failed');
      setBackupStatus(json);

      // Update last backup time
      const updatedProfile = {
        ...formData,
        backupSettings: {
          ...formData.backupSettings,
          lastBackupTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' }),
          lastChecksum: json.checksum,
        },
      };
      setFormData(updatedProfile);
      onUpdateProfile(updatedProfile);
    } catch (err: any) {
      alert(`Cloud backup failed: ${err.message}`);
    } finally {
      setIsBackingUp(false);
    }
  };

  // Export full JSON Vault
  const handleDownloadVaultJson = () => {
    const vault = StorageService.exportFullVault();
    const str = JSON.stringify(vault, null, 2);
    const blob = new Blob([str], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PlantPro_Backup_Vault_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Restore JSON Vault
  const handleRestoreVaultFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const vault = JSON.parse(event.target?.result as string);
        const res = StorageService.importFullVault(vault);
        if (res.success) {
          alert('Full backup vault restored successfully! Reloading...');
          window.location.reload();
        } else {
          alert(`Restore failed: ${res.message}`);
        }
      } catch (err: any) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* View Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Business Settings & Industry Customization
        </h2>
        <p className="text-xs text-slate-500">
          Customize company info, budget cost categories & cloud backup targets
        </p>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-100 p-3 text-xs font-semibold text-emerald-900 shadow-xs">
          <CheckCircle className="h-4 w-4 text-emerald-700" />
          <span>Company profile and cost settings saved successfully!</span>
        </div>
      )}

      {/* Section 1: Company Profile & Invoicing Branding */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
          <Building className="h-4 w-4 text-emerald-700" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Company Identity & Invoice Header
          </h3>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company / Trade Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Owner / Operator</label>
              <input
                type="text"
                required
                value={formData.ownerName}
                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tax ID / HST Registration</label>
              <input
                type="text"
                value={formData.taxNumber || ''}
                onChange={(e) => setFormData({ ...formData, taxNumber: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Office Phone</label>
              <input
                type="text"
                value={formData.officePhone}
                onChange={(e) => setFormData({ ...formData, officePhone: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cell Phone</label>
              <input
                type="text"
                value={formData.cellPhone}
                onChange={(e) => setFormData({ ...formData, cellPhone: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 font-mono text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Website</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white shadow-xs hover:bg-emerald-800"
            >
              <Save className="h-4 w-4" />
              <span>Save Company Profile</span>
            </button>
          </div>
        </form>
      </div>

      {/* Section 2: Industry Categories & Cost Structures */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-700" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Budget Categories & Industry Presets
            </h3>
          </div>

          {/* Quick industry preset buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-medium">Presets:</span>
            <button
              type="button"
              onClick={() => handleApplyPreset('Landscaping')}
              className="rounded bg-emerald-50 border border-emerald-200 px-2 py-1 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100"
            >
              Landscaping (Default)
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('General Contracting')}
              className="rounded bg-slate-100 border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
            >
              General Contractor
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('Cleaning & Janitorial')}
              className="rounded bg-slate-100 border border-slate-200 px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-200"
            >
              Cleaning / Janitorial
            </button>
          </div>
        </div>

        {/* Existing Categories */}
        <div className="space-y-2 mb-6">
          {formData.categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-xs"
            >
              <div>
                <p className="font-bold text-slate-900">{cat.name}</p>
                <p className="text-[11px] text-slate-500">{cat.description}</p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-mono text-slate-600 tabular-nums">
                  Budget: ${cat.monthlyBudget || 0}/mo
                </span>
                <button
                  onClick={() => handleRemoveCategory(cat.id)}
                  className="p-1 text-slate-400 hover:text-red-600"
                  title="Remove category"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Category row */}
        <div className="rounded-xl border border-dashed border-slate-300 p-4 bg-slate-50/40 text-xs">
          <p className="font-bold text-slate-800 mb-2">Add Custom Budget Category</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Category name (e.g. Nursery Stock)"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              className="rounded border border-slate-300 p-2 text-slate-900 bg-white"
            />
            <input
              type="text"
              placeholder="Description (e.g. Shrubs & perennials)"
              value={newCatDescription}
              onChange={(e) => setNewCatDescription(e.target.value)}
              className="rounded border border-slate-300 p-2 text-slate-900 bg-white"
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="Monthly Budget $"
                value={newCatBudget}
                onChange={(e) => setNewCatBudget(e.target.value)}
                className="w-28 rounded border border-slate-300 p-2 font-mono text-slate-900 bg-white"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="flex items-center gap-1 rounded bg-slate-900 px-3 py-2 font-semibold text-white hover:bg-slate-800 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Cloud Host Sync & Automated Backup (Google Drive / Backblaze / OneDrive) */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
          <Cloud className="h-4 w-4 text-emerald-700" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Cloud Hosts & Automated Sync Settings
          </h3>
        </div>

        <div className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Synchronize your receipts, invoice PDFs, client photos, and spreadsheet exports to your preferred cloud destination for safe offsite archiving.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Cloud Provider</label>
              <select
                value={formData.backupSettings.provider}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    backupSettings: {
                      ...formData.backupSettings,
                      provider: e.target.value as any,
                    },
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white p-2 font-semibold text-slate-800"
              >
                <option value="google_drive">Google Drive (Recommended)</option>
                <option value="backblaze_b2">Backblaze B2</option>
                <option value="onedrive">Microsoft OneDrive</option>
                <option value="local">Local Device Storage</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Target Cloud Directory</label>
              <input
                type="text"
                value={formData.backupSettings.targetFolder}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    backupSettings: {
                      ...formData.backupSettings,
                      targetFolder: e.target.value,
                    },
                  })
                }
                className="w-full rounded-lg border border-slate-300 p-2 font-mono text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Auto-Sync Cadence</label>
              <select
                value={formData.backupSettings.autoSyncInterval}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    backupSettings: {
                      ...formData.backupSettings,
                      autoSyncInterval: e.target.value as any,
                    },
                  })
                }
                className="w-full rounded-lg border border-slate-300 bg-white p-2 text-slate-800"
              >
                <option value="daily">Daily Sync</option>
                <option value="weekly">Weekly Sync</option>
                <option value="manual">Manual On-Demand Only</option>
              </select>
            </div>
          </div>

          {/* Test Backup Button */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleTestCloudBackup}
              disabled={isBackingUp}
              className="flex items-center gap-2 rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white shadow-xs hover:bg-emerald-800 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isBackingUp ? 'animate-spin' : ''}`} />
              <span>{isBackingUp ? 'Uploading & Verifying...' : 'Test Cloud Backup Now'}</span>
            </button>

            <span className="text-slate-400">
              Last Backup: {formData.backupSettings.lastBackupTime || 'None'}
            </span>
          </div>

          {backupStatus && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-emerald-950 font-mono text-[11px] space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-emerald-800 font-sans">
                <CheckCircle className="h-4 w-4" />
                <span>Backup Verified & Synchronized!</span>
              </p>
              <p>ID: {backupStatus.backupId} · Provider: {backupStatus.provider}</p>
              <p>Folder: {backupStatus.targetFolder} · SHA Checksum: {backupStatus.checksum}</p>
              <p>
                Records archived: {backupStatus.recordCount.expenses} expenses, {backupStatus.recordCount.invoices} invoices, {backupStatus.recordCount.clients} sites, {backupStatus.recordCount.sitePhotos} photos
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Section 4: Local Device Vault Backup & Factory Reset */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-4">
          <Shield className="h-4 w-4 text-emerald-700" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Device Vault File Backup & Disaster Recovery
          </h3>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <div>
            <p className="font-bold text-slate-800">Complete JSON Vault Archive</p>
            <p className="text-slate-500">
              Export an encrypted, single-file snapshot of your entire business database to your phone or computer.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadVaultJson}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5 text-emerald-700" />
              <span>Download Vault JSON</span>
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={handleRestoreVaultFile}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Restore from Vault</span>
            </button>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <div>
            <p className="font-semibold text-slate-700">Sample Data</p>
            <p className="text-slate-400">Reset to initial 'Your Neighbourhood Plant Guy' demo data</p>
          </div>
          <button
            type="button"
            onClick={onResetSampleData}
            className="rounded border border-red-200 bg-red-50 px-3 py-1.5 font-semibold text-red-700 hover:bg-red-100"
          >
            Reset Sample Data
          </button>
        </div>
      </div>

      {/* Section 5: Android APK Generation & Device Sideloading */}
      <div className="rounded-xl border border-emerald-300 bg-emerald-50/40 p-6 shadow-xs">
        <div className="flex items-center gap-2 border-b border-emerald-200 pb-3 mb-4">
          <Smartphone className="h-4 w-4 text-emerald-800" />
          <h3 className="text-sm font-bold text-emerald-950 uppercase tracking-wider">
            Android APK Package (.apk) Generation
          </h3>
        </div>

        <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
          <p>
            You can install PlantPro directly onto any Android phone or tablet using two standard methods:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-white p-4 border border-emerald-200 shadow-xs">
              <h4 className="font-bold text-slate-900 mb-1">
                Method 1: Direct Android WebAPK (Instant)
              </h4>
              <p className="text-[11px] text-slate-600 mb-3">
                Open this app in Chrome on your Android phone and tap <strong>Install App</strong> in the top header. Android OS automatically compiles a native <strong>WebAPK</strong> and places it in your App Drawer with full offline storage.
              </p>
              <div className="rounded bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800 inline-block">
                Zero PC build steps required
              </div>
            </div>

            <div className="rounded-xl bg-white p-4 border border-emerald-200 shadow-xs">
              <h4 className="font-bold text-slate-900 mb-1">
                Method 2: Standalone .APK File (PWABuilder)
              </h4>
              <p className="text-[11px] text-slate-600 mb-3">
                Use Google & Microsoft's free <a href="https://www.pwabuilder.com" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline">PWABuilder.com</a> to generate a signed <code>.apk</code> installer file for direct sideloading or Google Play distribution.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin);
                    alert("App URL copied to clipboard! Paste it into PWABuilder.com to generate your APK.");
                  }}
                  className="rounded bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-slate-800"
                >
                  Copy App URL for PWABuilder
                </button>
                <a
                  href={`https://www.pwabuilder.com?url=${encodeURIComponent(window.location.origin)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-100"
                >
                  Open PWABuilder ↗
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
