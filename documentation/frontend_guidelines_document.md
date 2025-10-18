# Frontend Guidelines Document for CodeGuide Finance Tracker

This document outlines the frontend setup, design choices, and best practices for the CodeGuide Finance Tracker. It is written in everyday language to ensure clarity for all team members.

## 1. Frontend Architecture

### Overview
- **Framework:** Next.js 15 (App Router) provides server and client components out of the box. It handles routing, page layouts, and API routes in a unified way.
- **Language:** TypeScript ensures that data structures (e.g., transactions, budgets) are strictly defined, reducing runtime errors.
- **UI Library:** `shadcn/ui` gives a collection of accessible, customizable components (forms, tables, cards) built on Radix and Tailwind CSS.
- **Styling:** Tailwind CSS v4 (utility-first) allows rapid styling without maintaining separate CSS files.
- **Authentication:** Clerk handles user sign-up/sign-in flows, session management, and route protection seamlessly.
- **Database & Backend-as-a-Service:** Supabase (PostgreSQL) stores financial records. Preconfigured Row-Level Security ensures each user only accesses their own data.
- **AI Integration:** Vercel AI SDK provides a foundation for chat-based features like expense categorization or budgeting advice.
- **Theming:** `next-themes` enables light/dark mode switching at runtime.

### How It Supports Key Goals
- **Scalability:** File-based routing and server components make it easy to add new pages and features without clutter. Supabase scales with your data needs.
- **Maintainability:** TypeScript, clear folder structure, and component-based design help developers find and update code quickly.
- **Performance:** Server-side rendering (SSR) for initial page loads, code splitting, and caching result in fast page speed.

## 2. Design Principles

### Usability
- Keep interfaces intuitive: use clear labels, consistent button styles, and logical form flows.
- Provide immediate feedback (e.g., loading spinners, success/error messages).

### Accessibility
- Follow WCAG guidelines: sufficient color contrast, keyboard navigation, and proper `aria-` attributes.
- Leverage `shadcn/ui` components which are built with accessibility in mind.

### Responsiveness
- Design mobile-first: ensure layouts adapt to screens from 320px to 1920px.
- Use Tailwind’s responsive utilities (`sm:`, `md:`, `lg:`, `xl:`) for breakpoints.

### Consistency
- Reuse components for buttons, inputs, cards, and tables.
- Centralize margins, paddings, and color definitions.

## 3. Styling and Theming

### Styling Approach
- **Utility-First CSS:** Tailwind CSS for most styling needs. Avoid custom CSS unless absolutely necessary.
- **Component Styling:** Use Tailwind classes directly in JSX. For complex variants, define presets in `tailwind.config.js`.

### Theming
- **Light/Dark Modes:** Managed by `next-themes`. Theme toggle stored in `localStorage` and synced across pages.
- **Consistent Look & Feel:** All components consume the same color and spacing scales defined in Tailwind.

### Visual Style
- **Design Style:** Modern, flat design with subtle depth accents (soft shadows on cards).
- **Color Palette:**
  - Primary:   #3B82F6 (blue-500)
  - Primary Light: #60A5FA (blue-400)
  - Primary Dark:  #1E40AF (blue-800)
  - Secondary: #10B981 (green-500)
  - Accent:    #F59E0B (amber-500)
  - Neutral:   #6B7280 (gray-500)
  - Background Light: #F3F4F6 (gray-100)
  - Background Dark:  #111827 (gray-900)
  - Surface Light:    #FFFFFF
  - Surface Dark:     #1F2937

### Typography
- **Font Family:** Inter, system-ui, sans-serif.
- **Headings & Body:** Use Tailwind’s `text-xl`, `text-lg`, and `leading-relaxed` for readability.

## 4. Component Structure

### Folder Organization
- `/src/app/`: Next.js App Router pages and layouts.
- `/src/components/`: Shared UI components and feature-specific components.
  - `/ui/`: Wrappers around `shadcn/ui` primitives.
  - `/transactions/`, `/budgets/`, `/goals/`: Domain components.
- `/src/lib/`: Utilities and service clients (e.g., Supabase client, auth helpers).

### Reusability
- Build small, focused components (e.g., `Button`, `Modal`, `FormField`).
- Compose complex UI by combining smaller components.
- Export generic variants (e.g., `PrimaryButton`, `SecondaryButton`).

### Benefits of Component-Based Design
- **Maintainability:** Fix a bug or update a style in one place.
- **Testability:** Easily isolate and test individual components.
- **Consistency:** Enforced via shared props and styles.

## 5. State Management

### Remote Data Fetching
- **TanStack Query (React Query):** Manages server state, caching, background re-fetching, and optimistic updates for transactions, budgets, and goals.

### Global State
- **React Context & Hooks:** Minimal usage for theme and user session state (via Clerk).
- **Local State:** For component-level interactions (e.g., modals, form inputs).
- **Optional:** Zustand or Jotai can be introduced if complex cross-component state emerges.

## 6. Routing and Navigation

- **File-Based Routing:** Next.js App Router automatically maps `/src/app/dashboard/page.tsx` to `/dashboard`.
- **Layouts:** Define shared wrappers (headers, sidebars) in `layout.tsx` files.
- **Protected Routes:** Clerk’s middleware ensures only authenticated users can reach sensitive pages.
- **Navigation Elements:** Use Next.js `<Link>` for client-side transitions without full reloads.

## 7. Performance Optimization

- **Server Components:** Fetch data on the server to reduce bundle size sent to the client.
- **Code Splitting & Dynamic Imports:** Use `next/dynamic` to lazily load heavy components (e.g., charts).
- **Image Optimization:** Use Next.js `<Image>` for automatic resizing and optimized formats.
- **Asset Caching:** Leverage Vercel CDN and HTTP caching headers.
- **Tailwind JIT:** Generates only the CSS classes you actually use, keeping bundle size small.

## 8. Testing and Quality Assurance

### Unit & Integration Tests
- **Jest or Vitest:** Test pure functions (e.g., budget calculations) and component snapshots.
- **React Testing Library:** Render components and assert on user interactions.

### End-to-End Tests
- **Playwright or Cypress:** Automate critical flows (login, add transaction, view report) across browsers.

### linting & Formatting
- **ESLint:** Enforce code standards and catch bugs early.
- **Prettier:** Auto-format code for consistent style.
- **TypeScript:** Compile-time checks for data integrity.

### Schema Validation
- **Zod:** Validate request and response shapes in API routes to prevent bad data from reaching the database.

## 9. Conclusion and Overall Frontend Summary

This document lays out a clear, maintainable, and high-performance frontend setup for the CodeGuide Finance Tracker. By leveraging Next.js 15, Tailwind CSS, shadcn/ui, Clerk, and Supabase, we achieve:

- **Scalable Architecture:** Easy to grow with new features.
- **Consistent Design:** Modern, accessible, and responsive UI.
- **Rapid Development:** Utility classes, prebuilt components, and managed services.
- **Robust Security:** User data is protected via Clerk and Supabase RLS.
- **Enhanced User Experience:** Fast load times, theming, and AI-augmented insights.

Following these guidelines will help you build a personal finance application that is secure, easy to maintain, and delightful for users.