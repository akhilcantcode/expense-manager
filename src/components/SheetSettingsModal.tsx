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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSyncing) onClose();
      }}
    >
      <div
        id="sheet-settings-card"
        className="bg-[#161616] rounded-xl max-w-lg w-full p-6 shadow-2xl border border-[#2A2A2A] text-[#E5E5E5]"
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#2A2A2A]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-[#182A24] border border-[#1E4035] text-[#03DAC6] flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#9E9E9E] uppercase tracking-widest font-semibold">
                Cloud Integration
              </p>
              <h3 className="text-lg font-light text-[#E5E5E5] mt-0.5">Google Sheets Settings</h3>
            </div>
          </div>
          <button
            id="sheet-settings-close-btn"
            onClick={onClose}
            className="p-2 text-[#9E9E9E] hover:text-[#E5E5E5] hover:bg-[#2A2A2A] rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {syncStatus && (
          <div
            className={`mt-4 p-3 rounded-lg text-xs font-semibold ${
              syncStatus.startsWith('Error')
                ? 'bg-[#2A1518] text-[#CF6679] border border-[#441C22]'
                : 'bg-[#182A24] text-[#03DAC6] border border-[#1E4035]'
            }`}
          >
            {syncStatus}
          </div>
        )}

        <div className="mt-4 space-y-4 text-xs">
          {/* Status block */}
          <div className="p-4 bg-[#1F1F1F] rounded-lg border border-[#2A2A2A] space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="text-[#9E9E9E]">Status</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#182A24] text-[#03DAC6] border border-[#1E4035]">
                <CheckCircle2 className="w-3 h-3 mr-1" /> Active & Synced
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[#9E9E9E]">Account</span>
              <span className="font-semibold text-[#E5E5E5]">{userEmail || 'Connected User'}</span>
            </div>
            {sheetMeta && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-[#9E9E9E]">Spreadsheet</span>
                  <span className="font-medium text-[#E5E5E5]">Personal Expenses - ExpenseManager</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#9E9E9E]">Last Sync</span>
                  <span className="text-[#9E9E9E] font-mono">
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
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-[#03DAC6] text-black rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#00BFA5] transition-colors shadow-xs"
            >
              <span>Open in Google Sheets</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}

          {/* Sync controls */}
          <div className="pt-1">
            <span className="font-semibold text-[#9E9E9E] uppercase tracking-wider text-xs block mb-2">
              Manual Synchronization
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                id="sheet-sync-pull-btn"
                type="button"
                disabled={isSyncing}
                onClick={() => handleSyncAction('pull')}
                className="flex items-center justify-center space-x-1.5 p-2.5 bg-[#222222] hover:bg-[#2A2A2A] border border-[#2A2A2A] text-[#E5E5E5] rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <DownloadCloud className="w-4 h-4 text-[#BB86FC]" />
                <span>Pull from Sheet</span>
              </button>

              <button
                id="sheet-sync-push-btn"
                type="button"
                disabled={isSyncing}
                onClick={() => handleSyncAction('push')}
                className="flex items-center justify-center space-x-1.5 p-2.5 bg-[#222222] hover:bg-[#2A2A2A] border border-[#2A2A2A] text-[#E5E5E5] rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4 text-[#BB86FC]" />
                <span>Push to Sheet</span>
              </button>
            </div>
            <p className="text-[11px] text-[#777777] mt-2">
              Changes you make in this app are automatically mirrored directly to your connected Google Sheet.
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#2A2A2A] text-[#E5E5E5] hover:bg-[#333333] border border-[#3A3A3A] rounded-lg text-xs font-bold uppercase tracking-wider"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
