import React, { useState } from 'react';
import {
  FileSpreadsheet,
  ExternalLink,
  RefreshCw,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  UploadCloud,
  DownloadCloud,
} from 'lucide-react';
import { SheetMetadata } from '../types';

interface SheetSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheetMeta: SheetMetadata | null;
  userEmail: string | null;
  onForceSync: (direction: 'push' | 'pull') => Promise<void>;
  isSyncing: boolean;
}

export const SheetSettingsModal: React.FC<SheetSettingsModalProps> = ({
  isOpen,
  onClose,
  sheetMeta,
  userEmail,
  onForceSync,
  isSyncing,
}) => {
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSyncAction = async (direction: 'push' | 'pull') => {
    try {
      setSyncStatus(`Syncing (${direction === 'push' ? 'uploading' : 'downloading'})...`);
      await onForceSync(direction);
      setSyncStatus('Synchronization completed successfully!');
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (e: any) {
      setSyncStatus(`Error: ${e.message || 'Sync failed'}`);
    }
  };

  return (
    <div
      id="sheet-settings-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSyncing) onClose();
      }}
    >
      <div
        id="sheet-settings-card"
        className="bg-[#111111] rounded-lg max-w-lg w-full p-6 border border-neutral-800 text-neutral-100"
      >
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-md bg-neutral-900 border border-neutral-800 text-[#c6f24e] flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-100">Google Sheets Settings</h3>
              <p className="text-xs text-neutral-400 mt-0.5">Manage live two-way cloud synchronization</p>
            </div>
          </div>
          <button
            id="sheet-settings-close-btn"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {syncStatus && (
          <div
            className={`mt-4 p-3 rounded-md text-xs font-medium border ${
              syncStatus.startsWith('Error')
                ? 'bg-[#241215] text-[#e5484d] border-[#3d191e]'
                : 'bg-[#182312] text-[#c6f24e] border-[#293d18]'
            }`}
          >
            {syncStatus}
          </div>
        )}

        <div className="mt-4 space-y-4 text-xs">
          {/* Status block */}
          <div className="p-4 bg-neutral-900 rounded-md border border-neutral-800 space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Status</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[#182312] text-[#c6f24e] border border-[#293d18]">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Active &amp; Synced
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Account</span>
              <span className="font-medium text-neutral-200">{userEmail || 'Connected User'}</span>
            </div>
            {sheetMeta && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Spreadsheet</span>
                  <span className="font-medium text-neutral-200">Personal Expenses - ExpenseManager</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-400">Last Sync</span>
                  <span className="text-neutral-300 tabular-nums">
                    {sheetMeta.lastSyncedAt
                      ? new Date(sheetMeta.lastSyncedAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })
                      : 'Just now'}
                  </span>
                </div>
              </>
            )}
          </div>

          {sheetMeta?.spreadsheetUrl && (
            <a
              id="sheet-open-direct-btn"
              href={sheetMeta.spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-white text-black rounded-md text-xs font-semibold hover:bg-neutral-200 transition-colors"
            >
              <span>Open in Google Sheets</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {/* Sync controls */}
          <div className="pt-1">
            <span className="font-medium text-neutral-300 text-xs block mb-2">
              Manual Synchronization
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="sheet-sync-pull-btn"
                type="button"
                disabled={isSyncing}
                onClick={() => handleSyncAction('pull')}
                className="flex items-center justify-center space-x-1.5 p-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
              >
                <DownloadCloud className="w-4 h-4 text-neutral-400" />
                <span>Pull from Sheet</span>
              </button>

              <button
                id="sheet-sync-push-btn"
                type="button"
                disabled={isSyncing}
                onClick={() => handleSyncAction('push')}
                className="flex items-center justify-center space-x-1.5 p-2.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-200 rounded-md text-xs font-medium transition-colors disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4 text-neutral-400" />
                <span>Push to Sheet</span>
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-2">
              Changes you make in this app are automatically mirrored directly to your connected Google Sheet.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 bg-neutral-800 text-neutral-200 hover:bg-neutral-700 border border-neutral-700 rounded-md text-xs font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
