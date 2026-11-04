'use client';

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
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) onCancel();
      }}
    >
      <div
        id="delete-modal-card"
        className="bg-[#111111] rounded-lg max-w-md w-full p-6 border border-neutral-800 text-neutral-100"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-9 h-9 rounded-md bg-[#241215] border border-[#3d191e] flex items-center justify-center">
            <AlertTriangle className="w-4 h-4 text-[#e5484d]" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-neutral-100">Delete Transaction</h3>
            <p className="text-xs text-neutral-400 mt-0.5">This action cannot be undone.</p>
          </div>
        </div>

        <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
          Are you sure you want to delete this transaction? If your Google Sheet is connected, this
          entry will automatically be removed from the active spreadsheet.
        </p>

        <div className="bg-neutral-900 border border-neutral-800 rounded-md p-3.5 mb-5 space-y-1.5 text-xs">
          <div className="flex justify-between font-semibold text-neutral-100 text-sm">
            <span>{item.title}</span>
            <span className={`tabular-nums ${item.type === 'expense' ? 'text-[#e5484d]' : 'text-[#c6f24e]'}`}>
              {item.type === 'expense' ? '-' : '+'}
              {formatCurrency(item.amount, currency)}
            </span>
          </div>
          <div className="flex justify-between text-neutral-400 text-xs">
            <span>Category: {item.category}</span>
            <span>Date: {formatDate(item.date)}</span>
          </div>
          {item.notes && <p className="text-neutral-500 italic mt-1 truncate text-xs">Note: {item.notes}</p>}
        </div>

        <div className="flex items-center justify-end space-x-3">
          <button
            type="button"
            id="delete-modal-cancel-btn"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-3.5 py-2 rounded-md text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-transparent transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            id="delete-modal-confirm-btn"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-md text-xs font-semibold bg-[#e5484d] text-white hover:bg-[#d03d42] transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? 'Deleting...' : 'Delete Transaction'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
