import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { ExpenseItem } from '../types';
import { formatCurrency, formatDate } from '../utils/helpers';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  item: ExpenseItem | null;
  currency: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  item,
  currency,
  onConfirm,
  onCancel,
  isDeleting,
}) => {
  if (!isOpen || !item) return null;

  return (
    <div
      id="delete-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onCancel();
      }}
    >
      <div
        id="delete-modal-card"
        className="bg-[#161616] rounded-xl max-w-md w-full p-6 shadow-2xl border border-[#2A2A2A] text-[#E5E5E5]"
      >
        <div className="flex items-center space-x-3 text-[#CF6679] mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#2A1518] border border-[#441C22] flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-[#CF6679]" />
          </div>
          <div>
            <p className="text-xs text-[#9E9E9E] uppercase tracking-widest font-semibold">
              Destructive Action
            </p>
            <h3 className="text-lg font-light text-[#E5E5E5] mt-0.5">Confirm Deletion</h3>
          </div>
        </div>

        <p className="text-xs text-[#9E9E9E] mb-4 leading-relaxed">
          Are you sure you want to delete this transaction? If your Google Sheet is connected, this
          entry will automatically be synchronized and removed from the active spreadsheet.
        </p>

        <div className="bg-[#1F1F1F] border border-[#2A2A2A] rounded-lg p-3.5 mb-5 space-y-1.5 text-xs">
          <div className="flex justify-between font-semibold text-[#E5E5E5] text-sm">
            <span>{item.title}</span>
            <span className={item.type === 'expense' ? 'text-[#CF6679]' : 'text-[#03DAC6]'}>
              {item.type === 'expense' ? '-' : '+'}
              {formatCurrency(item.amount, currency)}
            </span>
          </div>
          <div className="flex justify-between text-[#9E9E9E] text-[11px]">
            <span>Category: {item.category}</span>
            <span>Date: {formatDate(item.date)}</span>
          </div>
          {item.notes && <p className="text-[#777777] italic mt-1 truncate text-[11px]">Note: {item.notes}</p>}
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            id="delete-modal-cancel-btn"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-[#9E9E9E] hover:text-[#E5E5E5] hover:bg-[#222222] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            id="delete-modal-confirm-btn"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#CF6679] text-black hover:bg-[#B55365] transition-colors shadow-xs disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'Deleting...' : 'Delete Transaction'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
