# LogisticsPro — Architecture Analysis & AI Understanding Document

> **Generated:** 2026-05-11  
> **Scope:** Frontend-only analysis. No backend or database exists.  
> **Purpose:** Deep architectural understanding for safe, consistent AI-assisted module development.

---

## Table of Contents

1. [Project Structure Analysis](#a-project-structure-analysis)
2. [Architecture Flow](#b-architecture-flow)
3. [Data Flow](#c-data-flow)
4. [Component Reusability](#d-component-reusability)
5. [Shared Resources](#e-shared-resources)
6. [Current Design Patterns](#f-current-design-patterns)
7. [Sensitive Areas](#g-sensitive-areas)
8. [Scalability Readiness](#h-scalability-readiness)
9. [Recommended Conventions To Follow](#i-recommended-conventions-to-follow)
10. [Safe Extension Guidelines](#j-safe-extension-guidelines)
11. [AI Development Rules For Future Modules](#k-ai-development-rules-for-future-modules)

---

## A. Project Structure Analysis

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.4 |
| React | React | 19 |
| Language | TypeScript | 5.7.3 (strict) |
| Styling | Tailwind CSS | 4.2.0 |
| UI Primitives | shadcn/ui | "new-york" style |
| Icons | Lucide React | 0.564.0 |
| Charts | Recharts | 2.15.0 |
| Forms | React Hook Form + Zod | 7.54.1 / 3.24.1 |
| Toast | Sonner | 1.7.1 |
| Themes | next-themes | 0.4.6 |
| Analytics | @vercel/analytics | 1.6.1 |

### Build & Deploy Configuration

- **Output mode:** Static export (`output: 'export'` in `next.config.mjs`)
- **Images:** `unoptimized: true` (required for static export)
- **TypeScript:** `ignoreBuildErrors: true` (lenient builds)
- **Path alias:** `@/*` maps to `./*`
- **Deploy target:** Static hosting (Netlify-compatible, see `deploy.sh`)

### Complete Directory Tree

```
LogisticPRO/
├── app/                          # Next.js App Router pages
│   ├── (dashboard)/              # Route group: all authenticated pages
│   │   ├── layout.tsx            # Dashboard shell: Sidebar + Navbar + main
│   │   ├── dashboard/page.tsx    # KPIs, charts, recent shipments, alerts
│   │   ├── shipments/page.tsx    # Shipment list + create modal
│   │   ├── shipments/[id]/       # Dynamic shipment detail
│   │   │   ├── page.tsx          # Static param generation (async RSC)
│   │   │   └── ShipmentDetailClient.tsx  # Client detail view
│   │   ├── orders/page.tsx       # Order management
│   │   ├── fleet/page.tsx        # Vehicle management
│   │   ├── drivers/page.tsx      # Driver management
│   │   ├── dispatch/page.tsx     # Dispatch operations
│   │   ├── warehouse/page.tsx    # Warehouse view
│   │   ├── warehouses/page.tsx   # Warehouse list (separate route)
│   │   ├── customers/page.tsx    # Customer management
│   │   ├── finance/page.tsx      # Invoices & financials
│   │   ├── reports/page.tsx      # Analytics reports
│   │   ├── notifications/page.tsx# Notification center
│   │   ├── users/page.tsx        # User management
│   │   └── settings/page.tsx     # Settings tabs (profile, company, etc.)
│   ├── login/page.tsx            # Custom animated login page
│   ├── page.tsx                  # Root redirect (login vs dashboard)
│   ├── layout.tsx                # Root layout: fonts, providers, metadata
│   ├── not-found.tsx             # 404 page
│   ├── globals.css               # Global CSS + Tailwind + login styles
│   ├── Animatedlogo.tsx          # SVG animated logo component
│   └── Animatedlogo2.tsx         # Secondary animated logo variant
│
├── components/
│   ├── layout/                   # Shell/layout components
│   │   ├── Sidebar.tsx            # Collapsible nav with role filtering
│   │   ├── Navbar.tsx             # Top bar: breadcrumbs, search, theme, notifications, user
│   │   ├── PageWrapper.tsx        # Consistent page header wrapper
│   │   ├── ThemeLayout.tsx        # (unused/theme variant)
│   │   ├── ThemeNavbar.tsx        # (unused/theme variant)
│   │   ├── ThemeSidebar.tsx       # (unused/theme variant)
│   │   ├── ThemePageWrapper.tsx   # (unused/theme variant)
│   │   ├── LoginLogo.tsx          # Logo for login page
│   │   └── MagneticButton.tsx     # Magnetic hover effect button
│   ├── shared/                   # Reusable business components
│   │   ├── DataTable.tsx          # Generic typed table (sort, search, pagination)
│   │   ├── KPICard.tsx            # Metric card with trend indicator
│   │   ├── StatusBadge.tsx        # Status-to-color badge mapper
│   │   ├── SkeletonLoader.tsx     # Loading skeletons (card/table/list/text)
│   │   └── EmptyState.tsx         # Empty state illustration
│   ├── ui/                       # shadcn/ui primitives (50+ components)
│   │   ├── button.tsx, card.tsx, dialog.tsx, table.tsx, input.tsx, select.tsx
│   │   ├── tabs.tsx, switch.tsx, dropdown-menu.tsx, tooltip.tsx
│   │   └── ... (full shadcn suite installed)
│   └── theme-provider.tsx        # next-themes wrapper
│
├── context/                      # React Context providers
│   ├── AuthContext.tsx           # Auth state, permissions, role-based menus
│   └── NotificationContext.tsx   # Notification list, read/unread, add/delete
│
├── services/                     # API abstraction layer (mock-ready)
│   ├── authService.ts            # Login/logout/getCurrentUser
│   ├── shipmentService.ts        # CRUD + status update for shipments
│   ├── orderService.ts           # CRUD for orders
│   ├── fleetService.ts           # CRUD for vehicles
│   ├── driverService.ts          # CRUD for drivers
│   ├── warehouseService.ts       # CRUD for warehouses
│   ├── customerService.ts        # CRUD for customers
│   ├── financeService.ts         # CRUD for invoices
│   ├── userService.ts            # CRUD for users + role permissions + activity log
│   └── reportService.ts          # Report generation helpers
│
├── data/
│   └── mockData.ts               # ALL mock data: types, interfaces, arrays (~730 lines)
│
├── hooks/
│   ├── use-toast.ts              # Toast state management (shadcn pattern)
│   └── use-mobile.ts             # Mobile breakpoint detection
│
├── lib/
│   └── utils.ts                  # cn(), formatDate(), formatCurrency(), generateId(), getStatusColor()
│
├── config/
│   └── appConfig.ts              # APP_CONFIG: USE_MOCK toggle, API_BASE_URL
│
├── styles/
│   ├── globals.css               # (commented out — legacy)
│   └── theme.css                 # Custom theme variables, animations, utility classes
│
├── public/                       # Static assets
│   ├── LogisticsProLogo.png, LogisticsProLogo-bg.png, logisticslogo.png
│   ├── placeholder*.jpg|svg|png # Placeholder images
│   └── favicon variants
│
├── tailwind.config.ts            # Custom colors: space-*, cyan-brand, indigo-brand, gradients
├── next.config.mjs               # Static export config
├── tsconfig.json                 # Strict TS, bundler resolution, @/* alias
├── components.json               # shadcn/ui config (aliases, style, iconLibrary)
└── package.json
```

### Key Observations About Structure

- **Page-based routing** inside a `(dashboard)` route group. No feature-based folder nesting beyond `app/(dashboard)/{feature}/page.tsx`.
- **All dashboard pages are Client Components** (`"use client"`) because they use hooks, state, and direct service calls.
- **One monolithic mock data file** (`data/mockData.ts`) contains every entity type, interface, and mock array.
- **Service layer is cleanly separated** but currently operates on mutable mock arrays in memory.
- **UI primitives are fully shadcn/ui** — every dialog, button, input, select comes from `@/components/ui/*`.

---

## B. Architecture Flow

### High-Level Application Flow

```
User arrives at /
    └── page.tsx checks isAuthenticated
        ├── NOT authenticated → redirect to /login
        └── IS authenticated → redirect to /dashboard

/login
    ├── Custom animated login page (no shadcn forms)
    ├── Calls login() from AuthContext
    ├── AuthContext calls authService.login()
    ├── On success: stores user + token in localStorage
    └── Redirects to /dashboard

/(dashboard)/*
    ├── DashboardLayout (app/(dashboard)/layout.tsx)
    │   ├── Auth guard: redirects to /login if not authenticated
    │   ├── Renders <Sidebar /> + <Navbar /> + <main>{children}</main>
    │   └── Sidebar filters menu items by role (allowedMenuItems)
    │
    └── Individual page (e.g., /shipments)
        ├── PageWrapper (title, description, actions)
        ├── Loads data via useEffect → service function
        ├── Service checks APP_CONFIG.USE_MOCK
        │   ├── true: filters/reads from mockData arrays
        │   └── false: fetches from real API with Bearer token
        ├── Renders:
        │   ├── Filter bar (search inputs, Select dropdowns)
        │   ├── DataTable or custom card grid
        │   └── Dialog modals for create/edit
        └── Uses toast (sonner) for user feedback
```

### Layout Hierarchy

```
RootLayout (app/layout.tsx)
├── ThemeProvider (next-themes)
├── AuthProvider (context)
│   └── NotificationProvider (context)
│       ├── Toaster (sonner)
│       └── children
│           ├── /login → standalone, no dashboard shell
│           └── /(dashboard) → DashboardLayout
│               ├── Sidebar (left, fixed, collapsible)
│               ├── Navbar (top, sticky)
│               └── <main> page content </main>
```

### Architecture Style Classification

| Aspect | Pattern Used |
|--------|-------------|
| Routing | **Page-based** (Next.js App Router) |
| Component Org | **Traditional** (layout/shared/ui split, not atomic design) |
| State Management | **Context-based** (2 contexts: Auth, Notification) |
| Data Access | **Service Layer** with mock/real toggle |
| Forms | **Controlled components** (native inputs + React state), NOT React Hook Form in practice |
| Styling | **Tailwind CSS v4** with inline arbitrary values + custom CSS classes |
| Theming | **CSS variables** (oklch) + `next-themes` dark/light/system |

---

## C. Data Flow

### Mock-First Data Architecture

The entire application is built around a **single toggle**: `APP_CONFIG.USE_MOCK`.

```
Page Component
    └── useEffect calls service function (e.g., getShipments(filters))
        └── service checks APP_CONFIG.USE_MOCK
            ├── TRUE:
            │   ├── Simulates network delay: `await new Promise(r => setTimeout(r, 300))`
            │   ├── Filters/reads directly from exported mock arrays
            │   ├── Mutates arrays in place for create/update/delete (CRUD)
            │   └── Returns typed promise
            └── FALSE:
                ├── Constructs fetch() with Bearer token from localStorage
                ├── Appends query params for filtering
                └── Returns typed promise from API response
```

### State Persistence

- **Auth:** `localStorage` keys: `user` (JSON string), `token` (string)
- **Notifications:** In-memory React state only (refreshes on page reload)
- **Theme:** `next-themes` persists to `localStorage` automatically
- **Settings:** Page-level `useState` only (no persistence implemented)

### Data Types & Relationships

Defined in `data/mockData.ts`:

| Entity | ID Prefix | Key Relationships |
|--------|-----------|-----------------|
| `Shipment` | `shp-` | assignedDriver (→ Driver), assignedVehicle (→ Vehicle), timeline[] |
| `Order` | `ord-` | customerId (→ Customer), shipmentId (→ Shipment, nullable) |
| `Vehicle` | `veh-` | assignedDriver (→ Driver, nullable), maintenanceHistory[], fuelLogs[] |
| `Driver` | `drv-` | vehicleAssigned (→ Vehicle, nullable), tripHistory[] |
| `Warehouse` | `wh-` | inventory[] (InventoryItem), inboundLogs[], outboundLogs[] |
| `Customer` | `cust-` | totalShipments, outstandingBalance |
| `Invoice` | `inv-` | customerId (→ Customer), shipmentId/orderId (nullable) |
| `User` | `usr-` | role (→ rolePermissions, roleMenuConfig) |
| `Notification` | `notif-` | actionUrl (route string, nullable) |

### RBAC Data Flow

```
mockData.ts exports:
    ├── roleMenuConfig: Record<UserRole, string[]>  (which menu IDs each role sees)
    └── rolePermissions: Record<UserRole, Record<module, {view, create, edit, delete}>>

AuthContext:
    ├── reads user.role from stored user
    ├── computes allowedMenuItems from roleMenuConfig
    └── exposes hasPermission(module, action) → boolean

Sidebar.tsx:
    └── filters menuItems array by allowedMenuItems

Pages:
    └── conditionally render create/edit buttons based on hasPermission()
```

---

## D. Component Reusability

### Reusable Components (Safe to Import Anywhere)

| Component | Location | Props | Used By |
|-----------|----------|-------|---------|
| **PageWrapper** | `components/layout/PageWrapper.tsx` | `children, title?, description?, actions?, className?` | Every dashboard page |
| **DataTable** | `components/shared/DataTable.tsx` | `data, columns, searchKey?, pageSize?, onRowClick?, emptyMessage?` | List pages (shipments, orders, etc.) |
| **KPICard** | `components/shared/KPICard.tsx` | `title, value, icon?, trend?, description?, iconColor?` | Dashboard |
| **StatusBadge** | `components/shared/StatusBadge.tsx` | `status, className?` | Any entity with a status field |
| **SkeletonLoader** | `components/shared/SkeletonLoader.tsx` | `variant, count?, className?` | Pages during data loading |
| **EmptyState** | `components/shared/EmptyState.tsx` | `icon?, title, description?, action?` | Empty lists |
| **MagneticButton** | `components/layout/MagneticButton.tsx` | `children, onClick?, strength?, radius?` | Login page only currently |

### Component Coupling Analysis

**Loosely Coupled (safe to modify):**
- `shared/*` components — pure props-driven, no context dependencies except `StatusBadge` (pure mapping)
- `ui/*` primitives — standard shadcn/ui, replaceable

**Moderately Coupled (modify with care):**
- `Sidebar.tsx` — hardcodes `menuItems` array, imports `AuthContext`, has inline CSS for scrollbar
- `Navbar.tsx` — hardcodes `pathLabels` map, imports both `AuthContext` and `NotificationContext`

**Tightly Coupled (sensitive — see Section G):**
- `login/page.tsx` — extensive custom CSS classes defined in `app/globals.css` (`.lp-*`, `.cursor-ring`, etc.)
- `mockData.ts` — single file with all types and data; services mutate these arrays directly
- `globals.css` — mixes Tailwind v4 `@theme inline`, shadcn theme vars, and 700+ lines of custom login/navbar styles

---

## E. Shared Resources

### Global Utilities (`lib/utils.ts`)

| Function | Purpose | Usage |
|----------|---------|-------|
| `cn(...inputs)` | Merges tailwind classes with `clsx` + `tailwind-merge` | Every component |
| `formatDate(date, format?)` | Formats to Indian locale (`en-IN`) | Tables, cards, timelines |
| `formatCurrency(amount)` | Formats to INR (`en-IN`) | KPIs, invoices, finance |
| `generateTrackingId()` | Generates `LOG-{year}-{random}` | Shipment creation |
| `generateId(prefix)` | Generates `{prefix}-{random}` | Generic ID creation |
| `getStatusColor(status)` | Returns Tailwind class string for status | (duplicates StatusBadge logic) |

### Shared Hooks

| Hook | Purpose | Usage |
|------|---------|-------|
| `useAuth()` | Access auth state, login/logout, permissions | Most pages & layout components |
| `useNotifications()` | Access notifications, mark read, add new | Navbar, notifications page |
| `useIsMobile()` | Returns boolean for < 768px | (available, not heavily used) |
| `useToast()` | Toast state management | (available, but pages use `toast` from sonner directly) |

### Theme / Design Tokens

The design system uses **two parallel systems**:

1. **Tailwind v4 + shadcn CSS variables** (`app/globals.css`):
   - `:root` and `.dark` variable sets for `background`, `foreground`, `primary`, `card`, etc.
   - `@theme inline` maps CSS vars to Tailwind theme keys
   - Colors are **oklch** based

2. **Custom login/design CSS** (also in `app/globals.css`):
   - Hardcoded hex values: `#0ea5e9` (cyan), `#6366f1` (indigo), `#050d1a` (dark bg)
   - Custom classes: `.lp-root`, `.lp-card`, `.nb-crumb-active`, `.nb-dropdown`, `.cursor-ring`, etc.
   - Gradient pattern repeated everywhere: `linear-gradient(135deg, #0ea5e9, #6366f1)`

3. **Legacy theme file** (`styles/theme.css`):
   - Defines CSS custom properties like `--bg-primary`, `--accent-primary`
   - **Not imported** in the active global CSS (commented out in `styles/globals.css`)

### Asset Conventions

- Logos: `LogisticsProLogo.png`, `LogisticsProLogo-bg.png` (used in Sidebar and Login)
- Placeholders: `placeholder.jpg`, `placeholder-user.jpg`, `placeholder-logo.png`
- Favicons: Light/dark variants + SVG

---

## F. Current Design Patterns

### 1. Service Layer with Mock Toggle

Every service follows this exact pattern:

```typescript
import { APP_CONFIG } from "@/config/appConfig";
import { mockEntity, type Entity, type EntityStatus } from "@/data/mockData";

export interface EntityFilters {
  status?: EntityStatus;
  search?: string;
}

export const getEntities = async (filters?: EntityFilters): Promise<Entity[]> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    let result = [...mockEntity];
    if (filters?.status) result = result.filter(e => e.status === filters.status);
    if (filters?.search) { /* lowercase includes search */ }
    return result;
  }
  // Real API path
  const response = await fetch(`${APP_CONFIG.API_BASE_URL}/entities?...`);
  return response.json();
};
```

### 2. Page Data Loading Pattern

```typescript
"use client";
import { useEffect, useState } from 'react';

export default function EntityPage() {
  const [items, setItems] = useState<Entity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadItems(); }, [filterDep]);

  const loadItems = async () => {
    setLoading(true);
    try {
      setItems(await getEntities(filters));
    } catch {
      toast.error('Failed to load');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <PageWrapper><SkeletonLoader /></PageWrapper>;
  return <PageWrapper><DataTable data={items} /></PageWrapper>;
}
```

### 3. Form Pattern (Inline Controlled)

Forms are **not** using React Hook Form in practice. They use:
- Local `useState` for form data
- Inline `<input>` and `<textarea>` elements (not always `shadcn/ui/Input`)
- Inline CSS class strings (e.g., `inputCls`, `textareaCls`) defined at top of component
- `Select` from shadcn/ui for dropdowns
- `Dialog` from shadcn/ui for modals
- Form submitted via `form` attribute on a button outside the form (`form="create-shipment-form"`)

### 4. Inline Style Classes Pattern

Pages/components define reusable style strings at module level:

```typescript
const inputCls = `
  w-full h-10 px-3
  bg-muted/40 border border-border
  rounded-[9px] text-[0.84rem] text-foreground
  ...
`;
```

This pattern appears in: `shipments/page.tsx`, `settings/page.tsx`, `ShipmentDetailClient.tsx`.

### 5. Card + Section Pattern

Dashboard/detail pages consistently use:
- `bg-card border border-border/60 rounded-xl overflow-hidden shadow-soft`
- Top header with `px-6 pt-5 pb-3 border-b border-border/40`
- Title: `text-[0.95rem] font-bold font-display text-foreground tracking-tight`
- Subtitle: `text-[0.78rem] text-muted-foreground mt-0.5`
- Hover effect: `hover:border-primary/25 hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)]`

### 6. Gradient Button Pattern

Primary action buttons everywhere use:
```
style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
```
With hover: `hover:-translate-y-px hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]`

---

## G. Sensitive Areas

### CRITICAL — Do Not Break

1. **`app/globals.css` — Massive custom CSS file**
   - Contains Tailwind v4 directives, shadcn theme vars, AND 700+ lines of custom styles
   - Login page depends on `.lp-*`, `.cursor-*`, `.orb`, `.particle` classes
   - Navbar depends on `.nb-crumb-active`, `.nb-dropdown`, `.nb-search`, `.nb-unread-dot`
   - Any reorganization of this file risks breaking visual styles across the app

2. **`data/mockData.ts` — Monolithic data file**
   - All TypeScript interfaces and all mock arrays live here
   - Services directly **mutate** these arrays (`mockShipments.push()`, `mockOrders.splice()`)
   - Role permissions and menu configs are hardcoded here
   - Changing exports or array structures will break every service

3. **`app/(dashboard)/layout.tsx` — Auth guard**
   - If this breaks, unauthenticated users may access dashboard pages
   - Must maintain redirect to `/login` logic

4. **`context/AuthContext.tsx` — Central auth state**
   - `localStorage` keys `user` and `token` are the source of truth
   - `hasPermission()` and `allowedMenuItems` drive sidebar visibility and page actions
   - Changing the context structure affects all permission checks

5. **`components/layout/Sidebar.tsx` — Hardcoded menu**
   - `menuItems` array is the single source of navigation
   - Must stay in sync with route definitions in `app/(dashboard)/`
   - Role filtering depends on `roleMenuConfig` from mockData

### HIGH RISK — Modify Carefully

6. **`next.config.mjs` — Static export config**
   - `output: 'export'` is required for current deployment
   - `images.unoptimized: true` is required because static export can't optimize images
   - Changing these will break the build

7. **`config/appConfig.ts` — Mock toggle**
   - `USE_MOCK: true` is the current mode
   - `setMockMode()` mutates the config at runtime (used by Settings page)
   - Future backend integration will require setting this to `false`

8. **`tsconfig.json` paths**
   - `@/*` alias is used in every import statement
   - Must remain mapped to `./*`

---

## H. Scalability Readiness

### Already Scalable

| Area | Why |
|------|-----|
| Service layer pattern | Every entity has consistent CRUD service; ready for real API swap |
| Typed interfaces | All entities have explicit TypeScript interfaces |
| Component composition | Pages compose shared components rather than duplicating logic |
| shadcn/ui foundation | 50+ primitives available; new forms/features can use existing components |
| Role-based access | AuthContext provides `hasPermission()` for feature gating |
| Theme system | Dark/light mode fully implemented via CSS variables |

### Needs Abstraction Before Scaling

| Area | Current State | Risk |
|------|--------------|------|
| Mock data | Single 730-line file | Will become unmaintainable with more entities |
| Data fetching | Raw `useEffect` + `useState` | No caching, deduplication, or optimistic updates |
| Error handling | Per-page `try/catch` with `toast.error()` | No centralized error boundary or retry logic |
| Form handling | Inline controlled inputs | No validation schema integration (Zod installed but unused in practice) |
| State management | Context for auth/notifications only | Page-level state doesn't share between routes |
| Search/filter | Per-page local state | Filters lost on navigation; no URL query persistence |
| Mobile responsiveness | Basic Tailwind breakpoints | Sidebar doesn't collapse to a drawer on mobile; some complex hover effects only work with mouse |

### Technical Debt

1. **Duplicated status color logic:** `StatusBadge.tsx` and `lib/utils.ts`'s `getStatusColor()` map the same statuses to Tailwind classes. They must stay in sync.
2. **Dead/unused theme files:** `styles/globals.css` (commented out), `styles/theme.css` (not imported), `components/layout/Theme*.tsx` (unused variants).
3. **Direct array mutation in services:** Mock mode mutates exported arrays. If the app ever needs to reset state or run tests, mutations persist.
4. **Mixed input components:** Some pages use raw `<input>` elements, others use `<Input>` from shadcn/ui. Styling is inconsistent.
5. **Settings page is purely UI:** All settings are local state with no persistence or actual API integration.
6. **Magic strings for gradients:** The `linear-gradient(135deg, #0ea5e9, #6366f1)` string is copy-pasted in ~15+ places.

---

## I. Recommended Conventions To Follow

When adding new modules or features, follow these established conventions:

### 1. File & Folder Convention

```
app/(dashboard)/{feature}/
    └── page.tsx                    # Main list/view page

# If detail page needed:
app/(dashboard)/{feature}/[id]/
    ├── page.tsx                    # Server component (generateStaticParams if needed)
    └── {Feature}DetailClient.tsx   # Client component for interactivity

services/{feature}Service.ts
    └── Export: get{Features}, get{Feature}ById, create{Feature}, update{Feature}, delete{Feature}

# If needed, add to data/mockData.ts:
    └── type {Feature}, type {Feature}Status, export const mock{Features}
```

### 2. Page Structure Convention

Every new page should follow this structure:

```typescript
"use client";

import { PageWrapper } from '@/components/layout/PageWrapper';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SkeletonLoader } from '@/components/shared/SkeletonLoader';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

// Service imports
// Type imports from mockData
// Icon imports from lucide-react

export default function NewFeaturePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('newfeature', 'create');

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      setItems(await getItems());
    } catch {
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  // Define columns for DataTable
  const columns = [ /* ... */ ];

  if (loading) {
    return (
      <PageWrapper title="New Feature">
        <SkeletonLoader variant="table" count={5} />
      </PageWrapper>
    );
  }

  return (
    <PageWrapper
      title="New Feature"
      description="Manage new feature items"
      actions={canCreate ? <CreateButton /> : undefined}
    >
      <DataTable data={items} columns={columns} />
    </PageWrapper>
  );
}
```

### 3. Service Convention

```typescript
import { APP_CONFIG } from "@/config/appConfig";
import { mock{Features}, type {Feature} } from "@/data/mockData";

export interface {Feature}Filters {
  status?: {Feature}Status;
  search?: string;
}

export const get{Features} = async (filters?: {Feature}Filters): Promise<{Feature}[]> => {
  if (APP_CONFIG.USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));
    let result = [...mock{Features}];
    // apply filters...
    return result;
  }
  const params = new URLSearchParams();
  // ...
  const response = await fetch(`${APP_CONFIG.API_BASE_URL}/{features}?${params}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  return response.json();
};
```

### 4. Styling Convention

- Use Tailwind utility classes as primary styling method
- For repeated complex styles, define a module-level string variable (see `inputCls` pattern)
- Use `oklch(var(--primary)/0.x)` for theme-aware colors, not hardcoded hex
- Exception: The established gradient `linear-gradient(135deg, #0ea5e9, #6366f1)` is the brand identity — use it for primary CTAs
- Dark mode support: always test both `.dark` and `:root:not(.dark)` contexts

### 5. Icon Convention

- **Always use Lucide React** (`lucide-react`)
- Import individual icons: `import { Package, Truck } from 'lucide-react'`
- Size convention: `size={14}` for buttons, `size={16}` for nav/action icons, `size={13}` for inline small icons

### 6. TypeScript Convention

- Strict mode enabled — no `any` without justification
- Export types from `data/mockData.ts` (or create dedicated `types/` folder if it grows)
- Service functions must return `Promise<T>`
- Use `type` keyword for object types (project convention)

---

## J. Safe Extension Guidelines

### Adding a New Dashboard Module

Follow this checklist:

1. **Data layer:**
   - Add `type NewFeature` and `type NewFeatureStatus` to `data/mockData.ts`
   - Add `export const mockNewFeatures` array to `data/mockData.ts`
   - Create `services/newFeatureService.ts` following the existing service pattern
   - If role-based access needed: add to `rolePermissions` and `roleMenuConfig` in `mockData.ts`

2. **Navigation:**
   - Add menu item to `menuItems` array in `components/layout/Sidebar.tsx`
   - Add label to `pathLabels` in `components/layout/Navbar.tsx` (for breadcrumbs)

3. **Page:**
   - Create `app/(dashboard)/newfeature/page.tsx`
   - Wrap with `PageWrapper`
   - Use `DataTable` for list views, or card grids for dashboard-style views
   - Use `SkeletonLoader` during loading
   - Use `StatusBadge` for status fields
   - Use `toast` from `sonner` for user feedback
   - Respect `hasPermission('newfeature', 'create' | 'edit' | 'delete')` for action buttons

4. **Detail page (if needed):**
   - Create `app/(dashboard)/newfeature/[id]/page.tsx`
   - Use `generateStaticParams` if static export needs pre-rendered routes
   - Create a client component for interactivity if needed

5. **Styling:**
   - Do NOT create new global CSS classes unless absolutely necessary
   - Use Tailwind utilities and inline style strings
   - If creating a reusable card style, extract it as a shared component, not a CSS class

### Adding a New Shared Component

- Place in `components/shared/` if it's business-logic related
- Place in `components/ui/` only if it's a primitive UI element (use shadcn's `npx shadcn add`)
- Export named functions (not default exports, matching existing pattern)
- Accept `className?: string` and merge with `cn()`

### Modifying Existing Modules

- **Dashboard KPIs:** Edit `app/(dashboard)/dashboard/page.tsx` — safe to add/remove cards
- **Auth logic:** Edit `context/AuthContext.tsx` — keep the same interface to avoid breaking consumers
- **Mock data:** Add to `data/mockData.ts`, but don't remove existing entities that other services depend on
- **Services:** Keep the `APP_CONFIG.USE_MOCK` branch; both branches must return the same type

---

## K. AI Development Rules For Future Modules

### Absolute Rules

1. **Never remove or refactor `app/globals.css` without preserving all custom class definitions** (`.lp-*`, `.nb-*`, `.cursor-*`, `.orb`, etc.).
2. **Never change `APP_CONFIG` structure** — the `USE_MOCK` boolean and `API_BASE_URL` string must remain.
3. **Never remove `localStorage` auth keys** (`user`, `token`) or change their format.
4. **Never remove existing shadcn/ui components** from `components/ui/` — they are dependencies of existing pages.
5. **Never change the `next.config.mjs` export settings** (`output: 'export'`, `images.unoptimized`).
6. **Always preserve the `(dashboard)` route group** and its `layout.tsx` auth guard.

### Type Safety Rules

7. All new mock data must have exported TypeScript interfaces in `data/mockData.ts`.
8. All new services must accept and return typed `Promise<T>`.
9. Use `type` (not `interface`) for entity shapes to match existing convention.

### UI Consistency Rules

10. **Use `PageWrapper`** for every new dashboard page.
11. **Use `DataTable`** for any tabular list view.
12. **Use `StatusBadge`** for any status field.
13. **Use `SkeletonLoader`** for every loading state.
14. **Primary CTA buttons** must use the brand gradient: `linear-gradient(135deg, #0ea5e9, #6366f1)`.
15. **All new pages must be dark-mode compatible** — use `oklch(var(--primary))` or shadcn CSS variables.
16. **All icons must come from `lucide-react`**, sized per convention (14px buttons, 16px nav).

### Data & State Rules

17. **All new services MUST follow the mock/real toggle pattern.**
18. **Mock mode services MUST simulate network delay** (`setTimeout(resolve, 200-400)`).
19. **Mock mode MUST mutate arrays in place** (`.push()`, `.splice()`, spread update) to match existing behavior.
20. **New entities needing role access MUST be added to** `rolePermissions` and `roleMenuConfig` in `mockData.ts`.

### Code Style Rules

21. Use `"use client"` at the top of every interactive page component.
22. Import order: React/Next → shadcn/ui → shared components → hooks → services → data types → utils → icons.
23. Use module-level style string variables for repeated complex Tailwind classes (see `inputCls` pattern).
24. Use `toast` from `sonner` (not `useToast`) for notifications.
25. Use `cn()` from `@/lib/utils` for conditional class merging.

### Testing Assumptions

26. The app runs in **mock mode only** — no real backend exists.
27. **localStorage persists across reloads** — auth survives refresh.
28. **Static export** means no API routes, no SSR data fetching, no server components for data (except `generateStaticParams`).
29. **All dashboard pages require authentication** — the layout guard handles this.
30. **Role-based menu filtering** happens in Sidebar — new pages won't appear for restricted roles unless added to `roleMenuConfig`.

---

## Appendix: Key File Quick Reference

| Purpose | File |
|---------|------|
| Entry point / auth redirect | `app/page.tsx` |
| Root layout & providers | `app/layout.tsx` |
| Dashboard shell | `app/(dashboard)/layout.tsx` |
| Login page | `app/login/page.tsx` |
| Sidebar navigation | `components/layout/Sidebar.tsx` |
| Top navbar | `components/layout/Navbar.tsx` |
| Page header wrapper | `components/layout/PageWrapper.tsx` |
| Auth state & permissions | `context/AuthContext.tsx` |
| Notification state | `context/NotificationContext.tsx` |
| All data & types | `data/mockData.ts` |
| Mock/API toggle | `config/appConfig.ts` |
| Shared utilities | `lib/utils.ts` |
| Global styles & theme | `app/globals.css` |
| Tailwind config | `tailwind.config.ts` |
| shadcn config | `components.json` |

---

*End of Architecture Document.*
