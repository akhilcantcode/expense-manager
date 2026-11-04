# kharche — Personal Expense & Budget Manager

A modern, high-performance personal finance tracking application built with **Next.js (App Router)**, **Neon Serverless PostgreSQL**, **Prisma ORM**, and **Clerk Authentication**.

---

## 🚀 Key Advantages Over Google Sheets

1. **Persistent Sessions (No Broken Connections on Refresh)**:
   - Clerk maintains secure, persistent session cookies across browser reloads, tabs, and devices.
   - Say goodbye to lost OAuth in-memory tokens or broken spreadsheet connection popups.

2. **Serverless PostgreSQL (Neon DB)**:
   - True ACID-compliant relational storage with sub-50ms query response times.
   - Indexed by user and transaction date for instant dashboard rendering.

3. **Type-Safe ORM (Prisma)**:
   - Full TypeScript safety from database models down to client components.
   - Easy migrations and database schema inspection with Prisma Studio.

4. **Next.js App Router & Server Actions**:
   - Zero-latency initial load: Server Components fetch user data directly during SSR.
   - Optimistic UI updates with automatic server action revalidation.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Auth**: [Clerk](https://clerk.com/) (`@clerk/nextjs`)
- **Database**: [Neon](https://neon.tech/) (Serverless Postgres)
- **ORM**: [Prisma ORM 6](https://www.prisma.io/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Visualizations**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## ⚙️ Quick Start Setup

### 1. Configure Environment Variables

Create or open `.env.local` and add your database and authentication credentials:

```bash
# Neon Serverless Postgres (from https://console.neon.tech)
DATABASE_URL="postgresql://user:password@ep-sample-pooler.region.aws.neon.tech/neondb?sslmode=require"

# Clerk Authentication (from https://dashboard.clerk.com -> API Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."

# Clerk Route URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"
```

### 2. Push Schema to Neon Database

Sync the Prisma schema (`prisma/schema.prisma`) directly with your Neon Postgres database:

```bash
npm run db:push
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view your expense manager.

---

## 📂 Project Architecture

```
├── app/
│   ├── globals.css                       # Dark theme aesthetic and color tokens
│   ├── layout.tsx                        # Root layout wrapped in ClerkProvider
│   ├── page.tsx                          # Server Component (SSR data prefetch)
│   ├── sign-in/[[...sign-in]]/page.tsx   # Custom Clerk sign-in screen
│   └── sign-up/[[...sign-up]]/page.tsx   # Custom Clerk sign-up screen
├── components/
│   └── Dashboard.tsx                     # Main interactive client dashboard
├── lib/
│   ├── prisma.ts                         # Singleton PrismaClient instance
│   └── actions/
│       ├── expenses.ts                   # Server actions for Expense CRUD
│       └── budget.ts                     # Server actions for Budget settings
├── prisma/
│   └── schema.prisma                     # Prisma schema (Expense, BudgetConfig)
├── src/
│   ├── components/                       # Shared UI components
│   │   ├── AnalyticsView.tsx             # Interactive charts & trend analysis
│   │   ├── BudgetManager.tsx             # Category limits and targets
│   │   ├── DeleteConfirmModal.tsx        # Safe deletion modal
│   │   ├── ExpenseList.tsx               # Filterable & searchable transaction log
│   │   ├── ExpenseModal.tsx              # Add / edit transaction modal
│   │   ├── Header.tsx                    # Top navigation & Clerk UserButton
│   │   └── SummaryCards.tsx              # Metric stat cards (Income/Expense/Savings)
│   ├── types.ts                          # TypeScript types & interfaces
│   └── utils/helpers.ts                  # Analytics compute, formatting, CSV export
└── middleware.ts                         # Clerk authentication middleware
```

---

## 📊 Useful Commands

- `npm run dev`: Launch the local development server on port 3000.
- `npm run build`: Validate Prisma types and build the production Next.js bundle.
- `npm run db:push`: Push the Prisma schema directly to your Neon database without manual SQL.
- `npm run db:studio`: Launch Prisma Studio GUI in your browser to inspect and edit database records.
- `npm run lint`: Run TypeScript type-checking across the repository.
