'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '../prisma';
import { revalidatePath } from 'next/cache';
import { ExpenseItem, TransactionType, ExpenseCategory, PaymentMethod } from '../../src/types';

export async function getExpenses(): Promise<ExpenseItem[]> {
  const { userId } = await auth();
  if (!userId) {
    return [];
  }

  try {
    const records = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });

    return records.map((r: {
      id: string;
      date: string;
      title: string;
      amount: number;
      type: string;
      category: string;
      paymentMethod: string;
      notes: string | null;
      createdAt: Date;
      updatedAt: Date;
    }) => ({
      id: r.id,
      date: r.date,
      title: r.title,
      amount: r.amount,
      type: r.type as TransactionType,
      category: r.category as ExpenseCategory,
      paymentMethod: r.paymentMethod as PaymentMethod,
      notes: r.notes || undefined,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      syncedToSheet: true,
    }));
  } catch (error) {
    console.error('Error fetching expenses from Neon DB:', error);
    return [];
  }
}

export async function createExpense(
  item: Omit<ExpenseItem, 'id' | 'createdAt' | 'updatedAt' | 'syncedToSheet'>
): Promise<ExpenseItem> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const created = await prisma.expense.create({
    data: {
      userId,
      date: item.date,
      title: item.title,
      amount: item.amount,
      type: item.type,
      category: item.category,
      paymentMethod: item.paymentMethod,
      notes: item.notes || null,
    },
  });

  revalidatePath('/');

  return {
    id: created.id,
    date: created.date,
    title: created.title,
    amount: created.amount,
    type: created.type as TransactionType,
    category: created.category as ExpenseCategory,
    paymentMethod: created.paymentMethod as PaymentMethod,
    notes: created.notes || undefined,
    createdAt: created.createdAt.toISOString(),
    updatedAt: created.updatedAt.toISOString(),
    syncedToSheet: true,
  };
}

export async function updateExpense(
  id: string,
  item: Omit<ExpenseItem, 'id' | 'createdAt' | 'updatedAt' | 'syncedToSheet'>
): Promise<ExpenseItem> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  const updated = await prisma.expense.update({
    where: {
      id,
    },
    data: {
      date: item.date,
      title: item.title,
      amount: item.amount,
      type: item.type,
      category: item.category,
      paymentMethod: item.paymentMethod,
      notes: item.notes || null,
    },
  });

  revalidatePath('/');

  return {
    id: updated.id,
    date: updated.date,
    title: updated.title,
    amount: updated.amount,
    type: updated.type as TransactionType,
    category: updated.category as ExpenseCategory,
    paymentMethod: updated.paymentMethod as PaymentMethod,
    notes: updated.notes || undefined,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    syncedToSheet: true,
  };
}

export async function deleteExpense(id: string): Promise<boolean> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  await prisma.expense.deleteMany({
    where: {
      id,
      userId,
    },
  });

  revalidatePath('/');
  return true;
}

export async function bulkImportExpenses(
  items: Omit<ExpenseItem, 'id' | 'createdAt' | 'updatedAt' | 'syncedToSheet'>[]
): Promise<number> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('Unauthorized');
  }

  if (items.length === 0) return 0;

  const result = await prisma.expense.createMany({
    data: items.map((item) => ({
      userId,
      date: item.date,
      title: item.title,
      amount: item.amount,
      type: item.type,
      category: item.category,
      paymentMethod: item.paymentMethod,
      notes: item.notes || null,
    })),
  });

  revalidatePath('/');
  return result.count;
}
