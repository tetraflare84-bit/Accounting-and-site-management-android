import React, { useState, useRef } from 'react';
import {
  Folder,
  FolderOpen,
  Camera,
  MapPin,
  Edit3,
  Plus,
  Image as ImageIcon,
  FileText,
  Navigation,
  Download,
  Trash2,
  ExternalLink,
  Check,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { ClientSite, SitePhoto, AnnotationItem } from '../types';
import { PhotoCanvasAnnotator } from './PhotoCanvasAnnotator';

interface SitesAndPhotosViewProps {
  clients: ClientSite[];
  sitePhotos: SitePhoto[];
  selectedClientId?: string;
  onUpdateClient: (client: ClientSite) => void;
  onAddClient: (client: ClientSite) => void;
  onAddSitePhoto: (photo: SitePhoto) => void;
  onUpdateSitePhoto: (photo: SitePhoto) => void;
  onDeleteSitePhoto: (id: string) => void;
}

export const SitesAndPhotosView: React.FC<SitesAndPhotosViewProps> = ({
  clients,
  sitePhotos,
  selectedClientId,
  onUpdateClient,
  onAddClient,
  onAddSitePhoto,
  onUpdateSitePhoto,
  onDeleteSitePhoto,
}) => {
  const [activeClientId, setActiveClientId] = useState<string>(
    selectedClientId || clients[0]?.id || ''
  );
  const [activeFolder, setActiveFolder] = useState<string>('All');
  const [annotatingPhoto, setAnnotatingPhoto] = useState<SitePhoto | null>(null);

  // New Client Modal
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');

  // Shopping list editor state
  const [isEditingShoppingList, setIsEditingShoppingList] = useState(false);
  const [shoppingListDraft, setShoppingListDraft] = useState('');

  // GPS acquisition state
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const activeClient = clients.find((c) => c.id === activeClientId) || clients[0];

  // Photos belonging to the active client
  const clientPhotos = sitePhotos.filter((p) => p.clientId === activeClient?.id);
  const displayedPhotos =
    activeFolder === 'All'
      ? clientPhotos
      : clientPhotos.filter((p) => p.folder === activeFolder);

  // Handle GPS coordinate fetch via navigator.geolocation
  const handleFetchCurrentGps = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser or device.');
      return;
    }

    setGpsLoading(true);
    setGpsMessage(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        };
        if (activeClient) {
          const updated = { ...activeClient, gpsCoordinates: coords };
          onUpdateClient(updated);
          setGpsMessage(
            `GPS Tagged: ${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)} (±${Math.round(coords.accuracy || 0)}m)`
          );
        }
      },
      (err) => {
        setGpsLoading(false);
        alert(`Failed to get GPS location: ${err.message}. Using manual coordinates.`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle new site photo upload or camera snap
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeClient) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const targetFolder = activeFolder === 'All' ? 'Photos' : activeFolder;

      const newPhoto: SitePhoto = {
        id: `photo_${Date.now()}`,
        clientId: activeClient.id,
        folder: targetFolder,
        filename: file.name || `photo_${Date.now()}.jpg`,
        caption: `Site photo captured on ${new Date().toLocaleDateString()}`,
        timestamp: new Date().toLocaleString(),
        imageUri: dataUrl,
        annotations: [],
        notes: '',
        fileType: 'photo',
      };

      onAddSitePhoto(newPhoto);
      // Auto open annotator so user can immediately mark notes on the taken photo!
      setAnnotatingPhoto(newPhoto);
    };
    reader.readAsDataURL(file);
  };

  // Save annotation result
  const handleSaveAnnotation = (
    annotatedDataUrl: string,
    annotations: AnnotationItem[]
  ) => {
    if (!annotatingPhoto) return;
    const updated: SitePhoto = {
      ...annotatingPhoto,
      annotatedUri: annotatedDataUrl,
      annotations,
    };
    onUpdateSitePhoto(updated);
    setAnnotatingPhoto(null);
  };

  // Save updated shopping list
  const handleSaveShoppingList = () => {
    if (!activeClient) return;
    const updated = { ...activeClient, shoppingListText: shoppingListDraft };
    onUpdateClient(updated);
    setIsEditingShoppingList(false);
  };

  // Create new client
  const handleCreateNewClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    const newClient: ClientSite = {
      id: `client_${Date.now()}`,
      name: newClientName.trim(),
      phone: newClientPhone.trim() || '905-555-0100',
      email: newClientEmail.trim() || '',
      address: newClientAddress.trim() || 'Maplewood, ON',
      folders: ['Plants', 'Designs', 'Photos', 'Invoices', 'Shopping Lists'],
      notes: 'New client garden and property management record.',
      shoppingListText: 'SHOPPING LIST:\n- Material 1\n- Material 2',
      createdAt: new Date().toISOString().split('T')[0],
    };

    onAddClient(newClient);
    setActiveClientId(newClient.id);
    setIsNewClientModalOpen(false);
    setNewClientName('');
    setNewClientAddress('');
    setNewClientPhone('');
    setNewClientEmail('');
  };

  if (!activeClient) {
    return <div>No clients available.</div>;
  }

  return (
    <div className="space-y-6">
      {/* View Header with Client Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Client Directory, Photos & Site Markup
          </h2>
          <p className="text-xs text-slate-500">
            Organized folders (mirroring desktop layout) with GPS coordinates and drawing tools
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Client Selector dropdown */}
          <select
            value={activeClientId}
            onChange={(e) => {
              setActiveClientId(e.target.value);
              setActiveFolder('All');
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-xs focus:border-emerald-600 focus:outline-none"
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.address.split(',')[0]})
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsNewClientModalOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>+ New Site</span>
          </button>
        </div>
      </div>

      {/* Client Overview Card & GPS Geotag Panel */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                Active Job Site
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-xs text-slate-500">{activeClient.createdAt}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">{activeClient.name}</h3>
            <p className="text-xs text-slate-600 font-medium">{activeClient.address}</p>
            <p className="text-xs text-slate-500 font-mono">
              {activeClient.phone} {activeClient.email && `· ${activeClient.email}`}
            </p>
          </div>

          {/* GPS Coordinates & Map Link */}
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                <MapPin className="h-4 w-4 text-emerald-700" />
                <span>Site Coordinates</span>
              </div>
              {activeClient.gpsCoordinates && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${activeClient.gpsCoordinates.lat},${activeClient.gpsCoordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  <span>Google Maps</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>

            <div className="font-mono text-xs text-slate-600">
              {activeClient.gpsCoordinates ? (
                <div>
                  <span className="font-semibold text-slate-900 tabular-nums">
                    {activeClient.gpsCoordinates.lat.toFixed(5)},{' '}
                    {activeClient.gpsCoordinates.lng.toFixed(5)}
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1">
                    (±{Math.round(activeClient.gpsCoordinates.accuracy || 5)}m)
                  </span>
                </div>
              ) : (
                <span className="text-slate-400">No GPS co-ordinates logged yet.</span>
              )}
            </div>

            <div className="pt-1 flex items-center gap-2">
              <button
                onClick={handleFetchCurrentGps}
                disabled={gpsLoading}
                className="flex items-center gap-1.5 rounded-md bg-emerald-700 px-2.5 py-1 text-[11px] font-semibold text-white shadow-xs hover:bg-emerald-800 disabled:opacity-50"
              >
                <Navigation className="h-3 w-3" />
                <span>{gpsLoading ? 'Acquiring GPS...' : 'Tag Device GPS'}</span>
              </button>
              {gpsMessage && (
                <span className="text-[10px] text-emerald-700 font-medium">
                  {gpsMessage}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Site Notes */}
        {activeClient.notes && (
          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
            <span className="font-semibold text-slate-800">Site Directives: </span>
            {activeClient.notes}
          </div>
        )}
      </div>

      {/* Virtual Directory Folder Navigation (Mirroring user screenshot '57 Magani') */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-emerald-700" />
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Directory Tree: /{activeClient.name}
            </span>
          </div>

          {/* Quick upload photo or snap on camera */}
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800 transition active:scale-95"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Snap / Add Site Photo</span>
            </button>
          </div>
        </div>

        {/* Folder navigation buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveFolder('All')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
              activeFolder === 'All'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>All Files ({clientPhotos.length})</span>
          </button>

          {activeClient.folders.map((folder) => {
            const count = clientPhotos.filter((p) => p.folder === folder).length;
            return (
              <button
                key={folder}
                onClick={() => setActiveFolder(folder)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition whitespace-nowrap ${
                  activeFolder === folder
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Folder className="h-3.5 w-3.5" />
                <span>
                  {folder} ({count})
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shopping List / Materials Notepad (Matches 'shopping list.txt' from user screenshot) */}
      {(activeFolder === 'All' || activeFolder === 'Shopping Lists') && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-emerald-700" />
              <h4 className="text-sm font-bold text-slate-900">
                shopping list.txt & Site Materials Notepad
              </h4>
            </div>

            {isEditingShoppingList ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingShoppingList(false)}
                  className="rounded px-2.5 py-1 text-xs text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveShoppingList}
                  className="flex items-center gap-1 rounded bg-emerald-700 px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-800"
                >
                  <Check className="h-3 w-3" />
                  <span>Save List</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShoppingListDraft(activeClient.shoppingListText || '');
                  setIsEditingShoppingList(true);
                }}
                className="flex items-center gap-1 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <Edit3 className="h-3 w-3" />
                <span>Edit Notepad</span>
              </button>
            )}
          </div>

          {isEditingShoppingList ? (
            <textarea
              rows={6}
              value={shoppingListDraft}
              onChange={(e) => setShoppingListDraft(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-3 font-mono text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
              placeholder="Enter materials to buy, plants, soil bags, tools..."
            />
          ) : (
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
              <pre className="whitespace-pre-wrap font-mono text-xs text-slate-800 leading-relaxed">
                {activeClient.shoppingListText || 'No shopping list items recorded yet.'}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Photos & Document Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-slate-900">
            Site Images & Design Artifacts ({displayedPhotos.length})
          </h4>
          <span className="text-xs text-slate-500">
            Tap any photo to launch drawing canvas & comments
          </span>
        </div>

        {displayedPhotos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white py-12 text-center">
            <ImageIcon className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-2 text-sm font-semibold text-slate-700">No photos in this folder</p>
            <p className="text-xs text-slate-400 mt-1">
              Snap a site picture with your camera or upload a landscape photo
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-emerald-800"
            >
              <Camera className="h-3.5 w-3.5" />
              <span>Add Site Photo</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedPhotos.map((photo) => {
              const displaySrc = photo.annotatedUri || photo.imageUri;
              const hasMarkup = !!photo.annotatedUri;

              return (
                <div
                  key={photo.id}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition hover:shadow-md"
                >
                  {/* Photo Container */}
                  <div
                    onClick={() => setAnnotatingPhoto(photo)}
                    className="relative aspect-4/3 cursor-pointer overflow-hidden bg-slate-900"
                  >
                    <img
                      src={displaySrc}
                      alt={photo.caption}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />

                    {/* Badge if annotated */}
                    {hasMarkup && (
                      <span className="absolute left-2.5 top-2.5 rounded bg-emerald-900/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
                        Marked Up ({photo.annotations?.length || 1} notes)
                      </span>
                    )}

                    {/* Hover overlay hint */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                      <div className="flex items-center gap-1.5 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-900 shadow-md">
                        <Edit3 className="h-3.5 w-3.5 text-emerald-700" />
                        <span>Draw / Add Notes</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Content Footer */}
                  <div className="p-3.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-mono text-xs font-bold text-slate-900 truncate max-w-[200px]">
                          {photo.filename}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{photo.caption}</p>
                      </div>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 shrink-0">
                        {photo.folder}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px] text-slate-400">
                      <span>{photo.timestamp}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setAnnotatingPhoto(photo)}
                          className="font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                          Annotate
                        </button>
                        <button
                          onClick={() => onDeleteSitePhoto(photo.id)}
                          className="text-slate-400 hover:text-red-600"
                          title="Delete photo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Fullscreen Interactive Photo Canvas Markup Overlay */}
      {annotatingPhoto && (
        <PhotoCanvasAnnotator
          imageSrc={annotatingPhoto.imageUri}
          initialAnnotations={annotatingPhoto.annotations || []}
          title={`Draw & Annotate: ${annotatingPhoto.filename}`}
          onSave={handleSaveAnnotation}
          onCancel={() => setAnnotatingPhoto(null)}
        />
      )}

      {/* New Client Modal */}
      {isNewClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-base font-bold text-slate-900">Add New Client & Job Site</h3>
              <button
                onClick={() => setIsNewClientModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewClient} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Site / Client Identifier *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 57 Magani, 22 Willowdale"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Physical Address
                </label>
                <input
                  type="text"
                  placeholder="Street, City, Postal Code"
                  value={newClientAddress}
                  onChange={(e) => setNewClientAddress(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-emerald-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="905-555-0199"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="client@gmail.com"
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewClientModalOpen(false)}
                  className="rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-700 px-4 py-1.5 font-semibold text-white hover:bg-emerald-800"
                >
                  Create Client Hub
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
