# Project Requirements Document (PRD)

## 1. Project Overview

CodeGuide Finance Tracker is a modern, secure personal finance application that helps individuals record their income and expenses, create and manage budgets, track financial goals, and view insightful reports. It solves the core problem of fragmented or manual budgeting by offering a single dashboard where every transaction is captured, categorized, and visualized automatically. With built-in authentication and row-level security, users can trust that their financial data remains private and accessible only to them.

This application is being built to streamline personal money management and provide actionable insights. Key objectives include: 1) enabling users to effortlessly log transactions and set budgets, 2) offering real-time summaries and reports for better financial control, and 3) leveraging AI to categorize spending and suggest budget adjustments. Success will be measured by user adoption, frequency of logged transactions, accuracy of automated categorization, and user satisfaction with the reporting features.

## 2. In-Scope vs. Out-of-Scope

### In-Scope
- User authentication and authorization using Clerk (sign-up, sign-in, session management)
- PostgreSQL data storage via Supabase with Row-Level Security (RLS)
- CRUD operations for Transactions, Budgets, and Financial Goals through Next.js API routes
- Interactive dashboard showing income vs. expenses, budget vs. actuals, and goal progress
- Basic AI-powered expense categorization and budgeting advice using Vercel AI SDK
- Reusable UI components built with shadcn/ui and styled with Tailwind CSS
- Light/dark theme toggle via next-themes
- Input validation on APIs with Zod
- Real-time updates or polling to reflect new transactions immediately
- Data visualization using Chart.js or Recharts for charts (pie, bar, line)
- Client-side data fetching and caching with TanStack Query

### Out-of-Scope (Phase 1)
- Bank account aggregation or direct bank integrations (Plaid, Yodlee)
- Multi-currency support and currency conversion rates
- Mobile-only features or dedicated native apps (iOS, Android)
- Premium subscription or payment gateway integration
- Complex forecasting models beyond basic AI suggestions
- In-depth end-to-end testing suite (to be added later)

## 3. User Flow

A new user lands on the marketing homepage and clicks “Get Started.” They sign up or sign in securely via Clerk’s email or social login. Once authenticated, they arrive at the Dashboard page, which features a top navigation bar, a sidebar for different sections (Transactions, Budgets, Goals, Reports), and a main content area showing summary cards (Total Income, Total Expenses), a budget overview, and quick-access buttons like “Add Transaction.”

When the user clicks “Add Transaction,” a modal form appears with fields for amount, date, category (auto-categorized or AI suggestion), transaction type (income/expense), and optional description. Upon submission, the app sends the data to `POST /api/transactions`, stores it in Supabase, and updates the UI in real time. The user can navigate to the Budgets page to define or adjust budgets, to Goals for setting target amounts, or to Reports for chart-driven insights. In each section, the sidebar remains visible for quick switching, and the header provides access to theme toggling and profile settings.

## 4. Core Features

- **Authentication & Security**
  - Clerk-powered sign-up/sign-in, session management
  - Next.js middleware to protect private routes
- **Data Management**
  - Supabase PostgreSQL with RLS (Tables: transactions, budgets, goals)
  - CRUD API routes (`/api/transactions`, `/api/budgets`, `/api/goals`)
  - Zod schemas for request validation
- **Transaction & Budget Management**
  - Forms to add/edit/delete income and expenses
  - Budget creation and adjustment by category and period
- **Financial Goals Tracking**
  - Define goals with target and current amounts
  - Progress bars with real-time updates
- **Interactive Dashboard & Reporting**
  - Summary cards for key metrics
  - Charts (pie, line, bar) for expense breakdowns and trends
- **AI-Powered Insights**
  - Expense categorizer chatbot using Vercel AI SDK
  - Personalized budget suggestions based on spending habits
- **Theming & Accessibility**
  - Light/dark mode toggle via next-themes
  - WCAG-compliant components from shadcn/ui
- **Real-Time Data Updates**
  - Supabase subscriptions or polling for live UI refresh
- **Client-Side Data Fetching**
  - TanStack Query for caching, background refresh, optimistic updates

## 5. Tech Stack & Tools

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling & Components**: Tailwind CSS v4, shadcn/ui
- **Authentication**: Clerk
- **Database & Backend**: Supabase (PostgreSQL, RLS, migrations)
- **AI Integration**: Vercel AI SDK (expense categorizer, chatbot)
- **Charting**: Chart.js or Recharts
- **Validation**: Zod
- **Data Fetching**: TanStack Query (React Query)
- **State Management**: (Optional) Zustand or Jotai for UI state
- **Theming**: next-themes
- **IDE & Plugins**: VSCode (with Cursor, Windsurf for AI-assisted coding)

## 6. Non-Functional Requirements

- **Performance**: Dashboard initial load < 2 seconds on 3G; API response time < 200ms for common queries
- **Security**: HTTPS everywhere, enforce RLS, sanitize all inputs, implement CSP headers
- **Compliance**: GDPR data erasure and portability; data stored in EU region if required
- **Usability**: WCAG AA accessibility, keyboard navigable forms, responsive layout for desktop/tablet
- **Scalability**: Design schema and API to handle up to 10k users without schema changes

## 7. Constraints & Assumptions

- Supabase and Clerk services remain available and within free or paid plan limits
- Vercel AI SDK can handle required request volumes; fallback to manual categorization if rate-limited
- Single-currency support (e.g., USD) for Phase 1
- Environment variables store all secrets (Supabase URL/Key, Clerk credentials)
- No offline or mobile-app support in initial release

## 8. Known Issues & Potential Pitfalls

- **API Rate Limits**: Supabase or Clerk free tiers may throttle requests. Mitigate by caching and batching.
- **Real-Time Complexity**: Subscriptions may cause excessive re-renders on large data sets. Use pagination and limit listens.
- **Chart Performance**: Rendering hundreds of data points can slow the browser. Mitigate with lazy loading, data aggregation, or virtualized charts.
- **AI Classification Errors**: The AI model might miscategorize transactions. Provide manual override in the UI and log misclassifications to retrain prompts.
- **Theme FOUC**: Flash of unstyled content when switching themes. Mitigate by hydrating theme preference early in `_app.tsx`.

---

This PRD provides a clear, unambiguous foundation. The AI model can now generate detailed technical documents—Tech Stack, Frontend Guidelines, Backend Structure—without missing any core requirements or assumptions.