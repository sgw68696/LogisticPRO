# Company Admin Architecture & Menus

## Role

**`CompanyAdmin`** — the main operational owner of a company within the multi-tenant LogisticsPro ERP.

- Route namespace: `/company/*`
- Dashboard: `/company/dashboard`
- Sidebar accent: `#38bdf8` (cyan/blue)
- Mock login: `company_admin` / `admin123`

---

## Route Guard (`app/company/layout.tsx`)

```txt
useAuth() → check isAuthenticated → check role === 'CompanyAdmin'
  ├─ unauthenticated  → redirect /login
  ├─ wrong role       → redirect via getCompanyRouteRedirect()
  └─ authenticated    → render layout
```

Layout renders:

```
┌──────────────────────────────────────────┐
│ AppSidebar (roleConfig + accessibleMenus) │
│ ┌────────────────────────────────────────┐│
│ │ Navbar (top bar)                       ││
│ │ <main>{children}</main>                ││
│ └────────────────────────────────────────┘│
└──────────────────────────────────────────┘
```

---

## Sidebar Branding (`data/menu/sidebar-roles.ts`)

```ts
companyAdminRoleConfig = {
  roleLabel: 'CompanyAdmin',
  brandName: 'LogisticsPro',
  brandHighlight: 'Pro',
  logoSrc: '/LogisticsProLogo-bg.png',
  homeHref: '/company/dashboard',
  accentColor: '#38bdf8',
}
```

---

## Menu Assembly Pipeline

```
companyAdminMenu (66 items, 11 sections)
        │
        ▼
+ COMPANY_TYPE_MENU_MAP[companyType]
  (0 items for standard | 12 items for non-standard types)
        │
        ▼
mergeMenuItems() — deduplicates by id
        │
        ▼
Filter by user.assignedMenus (if present)
        │
        ▼
Final accessibleMenus[] → AppSidebar
```

Defined in `hooks/use-accessible-menus.ts` — `useAccessibleMenus()` hook.

Base menu: `data/menu/company-admin-menu.ts`
Company type fragments: `data/company-type-menus.ts`
Company type definitions: `types/company-operational-types.ts`

---

## Base Menu Structure (11 Sections, 66 Items)

### 1. Dashboard
```
ID: dashboard
Label: Dashboard
Icon: LayoutDashboard
Href: /company/dashboard
```

### 2. Bookings & Rates
```
ID: bookings-rates
Icon: PackagePlus
Children (6):
  ├─ New Booking         /company/bookings/new
  ├─ Booking Requests    /company/bookings/requests
  ├─ All Bookings        /company/bookings
  ├─ Rate Cards          /company/rates/cards
  ├─ Spot Rate Requests  /company/rates/spot
  └─ Contract Rates      /company/rates/contracts
```

### 3. Shipments
```
ID: shipments
Icon: Truck
Children (6):
  ├─ Shipments           /company/shipments
  ├─ Orders              /company/orders
  ├─ Bill of Lading      /company/bol
  ├─ Container Tracking  /company/container-tracking
  ├─ Live Map            /company/live-map
  └─ SLA Alerts          /company/sla-alerts
```

### 4. Documents
```
ID: documents
Icon: FileArchive
Children (7):
  ├─ All Documents       /company/documents
  ├─ BOL                 /company/documents/bol
  ├─ Packing Lists       /company/documents/packing-lists
  ├─ Commercial Invoices /company/documents/commercial-invoices
  ├─ Certificates of Origin /company/documents/coo
  ├─ Insurance Certificates /company/documents/insurance
  └─ POD                 /company/documents/pod
```

### 5. Compliance & Customs
```
ID: compliance-customs
Icon: ShieldCheck
Children (4):
  ├─ Customs Declarations   /company/compliance/customs
  ├─ HS Codes               /company/compliance/hs-codes
  ├─ Import/Export Licenses /company/compliance/licenses
  └─ Dangerous Goods        /company/compliance/dg
```

### 6. Dispatch & Fleet
```
ID: dispatch-fleet
Icon: Route
Children (9):
  ├─ Dispatch Board      /company/dispatch
  ├─ Drivers             /company/drivers
  ├─ Driver Documents    /company/fleet/driver-docs
  ├─ Fleet               /company/fleet
  ├─ Vehicle Documents   /company/fleet/vehicle-docs
  ├─ Live GPS Tracking   /company/fleet/live-map
  ├─ Trip History        /company/fleet/trips
  ├─ Maintenance         /company/fleet/maintenance
  └─ Fuel Logs           /company/fleet/fuel
```

### 7. Warehouse
```
ID: warehouse
Icon: Warehouse
Children (8):
  ├─ Inbound (GRN)       /company/warehouse/inbound
  ├─ Outbound (GDN)      /company/warehouse/outbound
  ├─ Stock Positions     /company/warehouse/stock
  ├─ Bin/Rack Locations  /company/warehouse/locations
  ├─ Cycle Count         /company/warehouse/cycle-count
  ├─ Damage Reports      /company/warehouse/damage
  ├─ Cold Chain          /company/warehouse/cold-chain
  └─ Inventory           /company/inventory
```

### 8. Customers & Agents
```
ID: customers-agents
Icon: BriefcaseBusiness
Children (2):
  ├─ Customers           /company/customers
  └─ Agents              /company/agents
```

### 9. Finance
```
ID: finance
Icon: Landmark
Children (4):
  ├─ Invoices            /company/finance/invoices
  ├─ Payments            /company/finance/payments
  ├─ Expenses            /company/finance/expenses
  └─ Reconciliation      /company/finance/reconciliation
```

### 10. Reports
```
ID: reports
Icon: Gauge
Children (5):
  ├─ Shipment Reports     /company/reports/shipments
  ├─ Revenue Reports      /company/reports/revenue
  ├─ Performance Reports  /company/reports/performance
  ├─ Carrier Performance  /company/reports/carrier-performance
  └─ Warehouse Throughput /company/reports/warehouse
```

### 11. Users & Settings
```
ID: users-settings
Icon: Settings
Children (4):
  ├─ Company Users       /company/users
  ├─ Roles               /company/roles
  ├─ Notifications       /company/notifications
  └─ Settings            /company/settings
```

---

## Company Type Modules (12 extra menu items)

Appended to the base menu when `companyType` is non-standard.

| ID | Label | Icon | Href |
|----|-------|------|------|
| `ct-home` | Home | Home | /company/home |
| `ct-planning` | Planning List | ClipboardList | /company/planning |
| `ct-production` | Production Line List | LayoutPanelTop | /company/production-lines |
| `ct-shipment-lines` | Shipment Line List | Container | /company/shipment-lines |
| `ct-delivery-lines` | Delivery Line List | Truck | /company/delivery-lines |
| `ct-documents` | Operational Documents | FileSpreadsheet | /company/operational-documents |
| `ct-carrier-tracking` | Carrier Tracking | Map | /company/carrier-tracking |
| `ct-contracts` | Contract Holders | FileText | /company/contract-holders |
| `ct-edi` | EDI List | Network | /company/edi |
| `ct-container-reports` | Container Report | ClipboardCheck | /company/container-reports |
| `ct-ata-update` | Update ATA | Calendar | /company/ata-update |
| `ct-reporting` | Reporting | BarChart3 | /company/reporting |

### Type → Module mapping

| Company Type | Extra Modules |
|---|---|
| `standard` | (none) |
| `custom_agent` | All 12 |
| `destination_agent` | All 12 |
| `origin_agent` | All 12 |
| `transporter` | All 12 |
| `trucking_agent` | All 12 |

---

## Company Types (`types/company-operational-types.ts`)

| Slug | Label | Description | Color |
|---|---|---|---|
| `standard` | Standard | General logistics company | `#38bdf8` |
| `custom_agent` | Custom Agent | Customs clearance and brokerage | `#f59e0b` |
| `destination_agent` | Destination Agent | Destination-side logistics | `#10b981` |
| `origin_agent` | Origin Agent | Origin-side logistics | `#8b5cf6` |
| `transporter` | Transporter | Multi-modal transport | `#f43f5e` |
| `trucking_agent` | Trucking Agent | Trucking and road freight | `#14b8a6` |

---

## Permission Matrix (`config/permissions.ts`)

CompanyAdmin has full CRUD+export on most domains, with these exceptions:

| Module | View | Create | Edit | Delete | Export |
|---|---|---|---|---|---|
| companies | ✓ | ✗ | ✓ | ✗ | ✓ |
| organizations | ✓ | ✓ | ✓ | ✓ | ✓ |
| agents | ✓ | ✓ | ✓ | ✓ | ✓ |
| transport | ✓ | ✓ | ✓ | ✓ | ✓ |
| dashboard | ✓ | ✗ | ✗ | ✗ | ✗ |
| shipments | ✓ | ✓ | ✓ | ✗ | ✓ |
| orders | ✓ | ✓ | ✓ | ✓ | ✓ |
| fleet | ✓ | ✓ | ✓ | ✓ | ✓ |
| drivers | ✓ | ✓ | ✓ | ✓ | ✓ |
| dispatch | ✓ | ✓ | ✓ | ✓ | ✓ |
| warehouse | ✓ | ✓ | ✓ | ✓ | ✓ |
| customers | ✓ | ✓ | ✓ | ✓ | ✓ |
| finance | ✓ | ✓ | ✓ | ✓ | ✓ |
| reports | ✓ | ✓ | ✓ | ✗ | ✓ |
| users | ✓ | ✓ | ✓ | ✓ | ✓ |
| settings | ✓ | ✓ | ✓ | ✗ | — |
| notifications | ✓ | ✗ | ✗ | ✗ | — |

---

## Route Access (`ROLE_MENU_ACCESS`)

50 route paths authorized for CompanyAdmin — every path under `/company/` plus sub-routes for bookings, rates, shipments, documents, compliance, dispatch, fleet, warehouse, finance, reports, users, roles, notifications, settings.

---

## Agent Management (`/company/agents`)

CompanyAdmin can:

- **Create agents** — name, email, phone, agent type (warehouse/driver/finance/customs/port/tracking/transport)
- **Edit agents** — update profile, change status (Active/Inactive/Suspended)
- **Delete agents** — remove from company
- **Assign module access** — checkbox-based menu assignment panel showing all available modules (base 11 sections + 12 company-type modules)

Each agent's `assignedMenus` array controls which sidebar items they see when logged in as that agent. The sidebar is filtered dynamically by `useAccessibleMenus()` when `user.assignedMenus` is present.

---

## AppSidebar Component (`components/layout/Sidebar/AppSidebar.tsx`)

- **Props:** `role: SidebarRoleConfig`, `menuItems: MenuItem[]`
- **Collapsible:** 280px expanded, 72px collapsed
- **Active detection:** exact href match or starts-with for parent sections
- **Nested menus:** recursive render with expand/collapse, left border indent
- **Styling:** Dark theme (`#050d1a`), cyan accent, gradient active indicators, custom scrollbar
- **Footer:** user name, role label, logout button

### MenuItem type

```ts
interface MenuItem {
  id: string;
  label: string;
  href?: string;
  icon: LucideIcon;
  children?: MenuItem[];
}
```

### SidebarRoleConfig type

```ts
interface SidebarRoleConfig {
  roleLabel: string;
  brandName: string;
  brandHighlight?: string;
  logoSrc: string;
  homeHref: string;
  accentColor?: string;
}
```

---

## All `/company/*` page routes (68 files)

```
agents/                    documents/packing-lists/   planning/
ata-update/                documents/pod/             production-lines/
bol/                       drivers/                   rates/cards/
bookings/                  edi/                       rates/contracts/
bookings/new/              finance/expenses/          rates/spot/
bookings/requests/         finance/invoices/          reports/carrier-performance/
carrier-tracking/          finance/payments/          reports/performance/
compliance/customs/        finance/reconciliation/    reports/revenue/
compliance/dg/             fleet/                     reports/shipments/
compliance/hs-codes/       fleet/driver-docs/         reports/warehouse/
compliance/licenses/       fleet/fuel/                reporting/
container-reports/         fleet/live-map/            roles/
container-tracking/        fleet/maintenance/         settings/
contract-holders/          fleet/trips/               shipment-lines/
customers/                 fleet/vehicle-docs/        shipments/
dashboard/                 home/                      sla-alerts/
delivery-lines/            inventory/                 users/
dispatch/                  live-map/                  warehouse/cold-chain/
documents/                 notifications/             warehouse/cycle-count/
documents/bol/             operational-documents/     warehouse/damage/
documents/commercial-      orders/                    warehouse/inbound/
  invoices/                                           warehouse/locations/
documents/coo/                                         warehouse/outbound/
documents/insurance/                                   warehouse/stock/
```

---

## Key Files Reference

| File | Purpose |
|---|---|
| `app/company/layout.tsx` | Route guard + sidebar + navbar layout |
| `data/menu/company-admin-menu.ts` | Base menu definition (66 items) |
| `data/menu/sidebar-roles.ts` | Sidebar branding configs |
| `data/company-type-menus.ts` | Company type module menu fragments |
| `hooks/use-accessible-menus.ts` | Menu merging + filtering pipeline |
| `types/company-operational-types.ts` | Company type enum + metadata |
| `components/layout/Sidebar/AppSidebar.tsx` | Reusable sidebar component |
| `components/layout/Sidebar/AppSidebar.types.ts` | MenuItem + SidebarRoleConfig types |
| `config/permissions.ts` | Permission matrix |
| `data/mockCompanyTypeData.ts` | Mock data for company type modules |
| `app/company/agents/page.tsx` | Agent management + menu assignment UI |
