import { auth } from '@clerk/nextjs/server';
import { getExpenses } from '../lib/actions/expenses';
import { getBudget } from '../lib/actions/budget';
import { HomeClient } from '../components/HomeClient';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const { userId } = await auth();

  const [expenses, budget] = await Promise.all([
    userId ? getExpenses() : Promise.resolve([]),
    getBudget(),
  ]);

  return (
    <HomeClient
      userId={userId}
      initialExpenses={expenses}
      initialBudget={budget}
    />
  );
}
