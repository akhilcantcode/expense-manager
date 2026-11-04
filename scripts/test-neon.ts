import { prisma } from '../lib/prisma';

async function testNeonPostgres() {
  console.log('Testing connection to Neon PostgreSQL via Prisma...');
  
  // 1. Raw Query check
  const nowResult = await prisma.$queryRaw<Array<{ now: Date }>>`SELECT NOW() as now;`;
  console.log('✓ Successfully executed raw query. Server time from Neon:', nowResult[0].now);

  // 2. Insert test expense
  const testUserId = 'test_user_neon_verification';
  const newExpense = await prisma.expense.create({
    data: {
      userId: testUserId,
      title: 'Neon DB Integration Test',
      amount: 42.5,
      type: 'expense',
      category: 'Bills & Subscriptions',
      paymentMethod: 'UPI / Digital Wallet',
      date: '2026-11-03',
      notes: 'Testing end-to-end persistence on Neon production branch',
    },
  });
  console.log('✓ Successfully created Expense in Neon:', newExpense.id, newExpense.title, newExpense.amount);

  // 3. Read back from Neon
  const fetched = await prisma.expense.findUnique({
    where: { id: newExpense.id },
  });
  console.log('✓ Successfully read back Expense from Neon:', fetched?.title);

  // 4. Test BudgetConfig upsert
  const budget = await prisma.budgetConfig.upsert({
    where: { userId: testUserId },
    create: {
      userId: testUserId,
      monthlyTotalLimit: 75000,
      currency: '₹',
      categoryBudgets: { 'Food & Dining': 15000, 'Housing & Utilities': 25000 },
    },
    update: {
      monthlyTotalLimit: 75000,
    },
  });
  console.log('✓ Successfully upserted BudgetConfig in Neon for user:', budget.userId, 'limit:', budget.monthlyTotalLimit);

  // 5. Clean up test records
  await prisma.expense.delete({ where: { id: newExpense.id } });
  await prisma.budgetConfig.delete({ where: { userId: testUserId } });
  console.log('✓ Successfully cleaned up test records from Neon DB.');

  console.log('\nAll Neon PostgreSQL database operations passed with 100% success!');
}

testNeonPostgres()
  .catch((e) => {
    console.error('Neon test failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
