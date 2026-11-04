'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Edit2,
  Calendar,
  DollarSign,
  Tag,
  CreditCard,
  FileText,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { ExpenseItem, ExpenseCategory, PaymentMethod, TransactionType } from '../types';
import { CATEGORIES, PAYMENT_METHODS } from '../utils/helpers';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<ExpenseItem, 'id' | 'createdAt' | 'updatedAt' | 'syncedToSheet'>) => void;
  initialItem?: ExpenseItem | null;
  currency: string;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialItem,
  currency,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [category, setCategory] = useState<ExpenseCategory>('Food & Dining');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Credit Card');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialItem) {
      setTitle(initialItem.title);
      setAmount(initialItem.amount.toString());
      setType(initialItem.type);
      setCategory(initialItem.category);
      setPaymentMethod(initialItem.paymentMethod);
      setDate(initialItem.date);
      setNotes(initialItem.notes || '');
    } else {
      // Reset form
      setTitle('');
      setAmount('');
      setType('expense');
      setCategory('Food & Dining');
      setPaymentMethod('Credit Card');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setError(null);
  }, [initialItem, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title or merchant name.');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive amount.');
      return;
    }
    if (!date) {
      setError('Please select a date.');
      return;
    }

    onSave({
      title: title.trim(),
      amount: numAmount,
      type,
      category,
      paymentMethod,
      date,
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <div
      id="expense-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="expense-modal-card"
        className="bg-[#111111] rounded-xl max-w-lg w-full p-6 border border-neutral-800 my-8 text-white"
      >
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-neutral-900 border border-neutral-800 text-white">
              {initialItem ? (
                <Edit2 className="w-4 h-4 text-neutral-300" />
              ) : type === 'expense' ? (
                <TrendingDown className="w-4 h-4 text-[#e5484d]" />
              ) : (
                <TrendingUp className="w-4 h-4 text-[#c6f24e]" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {initialItem ? 'Edit Transaction' : 'New Transaction'}
              </h3>
            </div>
          </div>
          <button
            id="expense-modal-close-btn"
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 bg-[#2c1a20] border border-[#441C22] rounded-lg text-[#e5484d] text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Transaction Type Toggle */}
          <div className="grid grid-cols-2 gap-2 bg-neutral-900 p-1 rounded-lg border border-neutral-800">
            <button
              type="button"
              id="expense-type-expense-btn"
              onClick={() => {
                setType('expense');
                if (category === 'Salary & Income') setCategory('Food & Dining');
              }}
              className={`py-2 rounded-md text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                type === 'expense'
                  ? 'bg-neutral-800 text-[#e5484d]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Expense</span>
            </button>
            <button
              type="button"
              id="expense-type-income-btn"
              onClick={() => {
                setType('income');
                setCategory('Salary & Income');
              }}
              className={`py-2 rounded-md text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors cursor-pointer ${
                type === 'income'
                  ? 'bg-neutral-800 text-[#c6f24e]'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Income</span>
            </button>
          </div>

          {/* Title & Amount Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-neutral-400 mb-1 block">
                Merchant or description *
              </label>
              <input
                id="expense-title-input"
                type="text"
                required
                placeholder="e.g. Whole Foods, Uber"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-900 text-white text-sm focus:outline-none focus:border-neutral-600"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-400 mb-1 block">
                Amount ({currency}) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-neutral-400 font-medium text-sm">
                  {currency}
                </span>
                <input
                  id="expense-amount-input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 rounded-lg border border-neutral-800 bg-neutral-900 text-white text-sm font-semibold focus:outline-none focus:border-neutral-600"
                />
              </div>
            </div>
          </div>

          {/* Category & Payment Method Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-neutral-400 mb-1 block">
                Category
              </label>
              <select
                id="expense-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-900 text-white text-sm focus:outline-none focus:border-neutral-600 cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.label} value={cat.label} className="bg-[#111111] text-white">
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-400 mb-1 block">
                Payment channel
              </label>
              <select
                id="expense-payment-method-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-900 text-white text-sm focus:outline-none focus:border-neutral-600 cursor-pointer"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method} className="bg-[#111111] text-white">
                    {method}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-neutral-400 mb-1 block">
                Date
              </label>
              <input
                id="expense-date-input"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-900 text-white text-sm focus:outline-none focus:border-neutral-600 cursor-pointer [color-scheme:dark]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-neutral-400 mb-1 block">
                Notes (optional)
              </label>
              <input
                id="expense-notes-input"
                type="text"
                placeholder="Memo, invoice #..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-800 bg-neutral-900 text-white text-sm focus:outline-none focus:border-neutral-600"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-800">
            <button
              type="button"
              id="expense-modal-cancel-btn"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="expense-modal-save-btn"
              className="px-4 py-2 rounded-lg text-xs font-medium bg-white text-black hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              {initialItem ? 'Update transaction' : 'Save transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
