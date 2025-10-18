# Backend Structure Document

This document outlines the complete backend setup for the CodeGuide Finance Tracker. It explains how the architecture, databases, APIs, hosting, and infrastructure components work together to provide a secure, scalable, and high-performance finance tracking application.

## 1. Backend Architecture

Overall Design

- We use Next.js 15’s App Router on the backend. Each API route is implemented as a serverless function that runs on demand.
- TypeScript ensures type safety across the entire codebase, reducing runtime errors and making the code easier to maintain.
- The folder structure follows a clear module pattern:
  - `/src/app/api/` holds RESTful endpoints.
  - `/src/lib/` contains shared utilities (for example, the Supabase client).
  - `/supabase/migrations/` stores database schema changes.

Scalability

- Serverless functions (via Vercel) automatically scale based on incoming traffic.
- Supabase’s managed PostgreSQL scales vertically and horizontally as needed.

Maintainability

- Logical separation of concerns (API routes, utilities, migrations) keeps code easy to navigate.
- TypeScript types and Zod schemas guard against invalid data and speed up onboarding for new developers.

Performance

- Next.js Server Components fetch critical data on the server, reducing client-side bundle size and speeding up initial page loads.
- Supabase real-time features can push updates to the client instantly.

## 2. Database Management

Database Technology

- We use Supabase, a hosted PostgreSQL solution, for all persistent data storage.
- Supabase provides built-in auth, row-level security (RLS), and real-time subscriptions.

Data Organization

- Each user’s data is isolated by RLS policies tied to their unique `auth.uid()`.
- Core tables include:
  - `transactions` (income and expenses)
  - `budgets` (planned spending by category)
  - `goals` (savings targets)
  - `categories` (expense categories)

Data Access

- The frontend calls Next.js API routes, which use the Supabase client to query or modify data.
- All mutations and queries are wrapped in validation logic (Zod) to ensure data integrity.

Best Practices

- Use database migrations to evolve the schema in a controlled way.
- Apply RLS policies to every table so users see only their own records.
- Store secrets (database URL, API keys) in environment variables, not in code.

## 3. Database Schema

We use PostgreSQL with the following human-readable schema and SQL definitions.

Human-Readable Schema

- transactions:
  - `id`: unique identifier
  - `user_id`: reference to the owner
  - `amount`: numeric value of transaction
  - `date`: date of transaction
  - `category_id`: references a category
  - `type`: "income" or "expense"
  - `description`: optional text

- budgets:
  - `id`: unique identifier
  - `user_id`: reference to the owner
  - `category_id`: references a category
  - `amount`: planned budget amount
  - `period`: budget period (monthly, weekly)

- goals:
  - `id`: unique identifier
  - `user_id`: reference to the owner
  - `name`: goal name
  - `target_amount`: savings target
  - `current_amount`: amount saved so far

- categories:
  - `id`: unique identifier
  - `user_id`: reference to the owner
  - `name`: category name
  - `type`: "income" or "expense"

SQL Schema (PostgreSQL)

```sql
-- Transactions table
drop table if exists transactions;
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  amount numeric not null,
  date date not null,
  category_id uuid not null,
  type varchar(10) not null check (type in ('income', 'expense')),
  description text,
  created_at timestamp with time zone default now(),
  foreign key (category_id) references categories(id)
);

-- Budgets table
drop table if exists budgets;
create table budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  category_id uuid not null,
  amount numeric not null,
  period varchar(10) not null check (period in ('daily','weekly','monthly','yearly')),
  created_at timestamp with time zone default now(),
  foreign key (category_id) references categories(id)
);

-- Goals table
drop table if exists goals;
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  target_amount numeric not null,
  current_amount numeric default 0,
  created_at timestamp with time zone default now()
);

-- Categories table
drop table if exists categories;
create table categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  type varchar(10) not null check (type in ('income','expense'))
);

-- Enable Row Level Security and policies (example for transactions)
alter table transactions enable row level security;
create policy "Users can manage own transactions"
  on transactions for all
  using (user_id = auth.uid());
``` 

## 4. API Design and Endpoints

We follow a RESTful approach. Every route lives under `/src/app/api/`.

Key Endpoints

- `GET  /api/transactions` 
  • List all transactions for the logged-in user.
- `POST /api/transactions`
  • Create a new transaction.
- `GET  /api/transactions/[id]`
  • Get details for a single transaction.
- `PUT  /api/transactions/[id]`
  • Update an existing transaction.
- `DELETE /api/transactions/[id]`
  • Remove a transaction.

- `GET  /api/budgets` and similar CRUD endpoints under `/api/budgets`.
- `GET  /api/goals` and similar CRUD endpoints under `/api/goals`.

- `POST /api/chat`
  • AI-powered endpoint (using Vercel AI SDK) for expense categorization or budgeting advice.

How It Works

- Frontend components call these endpoints via `fetch` or TanStack Query.
- Each route:
  1. Validates input with Zod.
  2. Checks user authentication via Clerk middleware.
  3. Calls Supabase client in `/src/lib/supabase.ts`.
  4. Returns JSON responses or error messages.

## 5. Hosting Solutions

Primary Hosting

- Next.js and API routes are deployed on Vercel as serverless functions.
- Supabase runs on its managed cloud database service.

Benefits

- Automatic scaling: functions spin up on demand.
- Global edge network for low-latency responses.
- Built-in HTTPS, custom domains, and continuous deployment.
- Supabase handles backups, replication, and high availability.

## 6. Infrastructure Components

Load Balancing and CDN

- Vercel’s platform automatically balances traffic across edge nodes.
- Static assets and serverless responses are cached at the CDN edge.

Caching

- Next.js ISR (Incremental Static Regeneration) can cache frequently requested dashboard pages.
- Client-side caching via TanStack Query reduces redundant API calls.

Message Queues / Background Tasks (Future)

- We can integrate a background worker (for example, with Supabase Functions or a simple queue) to process heavy tasks like generating monthly reports.

## 7. Security Measures

Authentication & Authorization

- Clerk handles user sign-up, login, and session management.
- Clerk middleware protects both pages and API routes.

Data Protection

- Row-Level Security in PostgreSQL ensures users see only their own data.
- All traffic uses HTTPS.
- Sensitive keys and JWT secrets are stored in environment variables.

Input Validation

- Zod schemas enforce correct data shapes before any database operation.

Encryption

- Supabase encrypts data at rest.
- TLS encryption is enforced in transit.

Center for Compliance

- The combination of RLS, encryption, and secure auth keeps us compliant with privacy regulations such as GDPR.

## 8. Monitoring and Maintenance

Monitoring Tools

- Vercel Analytics tracks function latency, error rates, and traffic.
- Supabase console provides database performance metrics and query logs.
- Optionally, integrate Sentry for real-time error tracking.

Maintenance Practices

- Schema changes via migration files in `/supabase/migrations/`.
- Automated tests (Jest or Vitest) for business logic validate that new changes don’t break existing features.
- Scheduled backups and routine security audits.
- Regular dependency updates via Dependabot or similar tooling.

## 9. Conclusion and Overall Backend Summary

The backend for CodeGuide Finance Tracker is built on modern, serverless infrastructure with Next.js, Supabase, and Clerk. It offers:

- A clear, modular code structure that’s easy to scale and maintain.
- A secure PostgreSQL database with strict row-level security.
- RESTful APIs that the frontend can call to perform all core CRUD operations.
- Hosting on Vercel and Supabase, ensuring high performance and low operational overhead.
- Comprehensive security measures from authentication to data encryption.
- Monitoring and maintenance workflows that keep the system healthy and up to date.

This setup aligns perfectly with the goal of delivering a reliable, responsive, and secure personal finance application. Unique aspects—such as Clerk & Supabase synergy, AI-powered endpoints, and Next.js Server Components—differentiate this backend from typical starter kits and position you well for future growth and features.