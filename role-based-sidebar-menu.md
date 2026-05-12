# LogisticsPro — Role-Based Sidebar Menu Guide

> **Principle:** SuperAdmin manages the platform, CompanyAdmin manages one company, and operational roles (Manager, Dispatcher, Operator, Agent, Staff) get progressively narrower access scoped to their function.

---

## Quick Reference — All Users

| ID | Name | Role | Username | Password | Dashboard Route |
|---|---|---|---|---|---|
| `usr-001` | Rajesh Kumar | `SuperAdmin` | `superadmin` | `admin123` | `/admin/dashboard` |
| `usr-002` | Priya Sharma | `Manager` | `ops_manager` | `ops123` | `/manager/dashboard` |
| `usr-003` | Amit Patel | `Dispatcher` | `dispatch` | `dispatch123` | `/ops/dashboard` |
| `usr-004` | Sunita Reddy | `Agent` (Warehouse) | `warehouse` | `warehouse123` | `/agent/dashboard` |
| `usr-005` | Mohammed Khan | `Agent` (Driver) | `driver01` | `driver123` | `/agent/dashboard` |
| `usr-006` | Ananya Gupta | `Agent` (Finance) | `finance` | `finance123` | `/agent/dashboard` |
| `usr-007` | Vikram Singh | `Staff` | `support` | `support123` | `/staff/dashboard` |
| `usr-008` | Vikram Sharma | `CompanyAdmin` | `company_admin` | `admin123` | `/company/dashboard` |
| `usr-009` | Rajesh Verma | `Operator` | `operator01` | `operator123` | `/ops/dashboard` |
| `usr-010` | Neha Tripathi | `Staff` | `staff01` | `staff123` | `/staff/dashboard` |

---

## Auth Service — Role to Dashboard Map

```ts
// services/authService.ts
const ROLE_DASHBOARD_MAP = {
  SuperAdmin:   '/admin/dashboard',
  CompanyAdmin: '/company/dashboard',
  Manager:      '/manager/dashboard',
  Dispatcher:   '/ops/dashboard',
  Operator:     '/ops/dashboard',
  Agent:        '/agent/dashboard',
  Staff:        '/staff/dashboard',
};
```

---

## usr-001 — Rajesh Kumar `SuperAdmin`

**Login:** `superadmin` / `admin123`  
**Dashboard:** `/admin/dashboard`  
**Tenancy:** No Company, No Organization, No Agent

| Group | Menu | Route | Description |
|---|---|---|---|
| — | Dashboard | `/admin/dashboard` | Platform overview and KPIs |
| **Organization Management** | Companies | `/admin/org/companies` | View and manage all companies |
| | Organizations | `/admin/org/organizations` | View and manage organizations |
| | Company Types | `/admin/org/company-types` | Define company types and categories |
| | Subscription Plans | `/admin/org/subscription-plans` | Manage subscription tiers and pricing |
| | Approvals | `/admin/org/approvals` | Approve pending registrations |
| **User & Access** | Users | `/admin/users/all` | Manage all platform users |
| | Roles & Permissions | `/admin/users/roles` | Define roles and permissions |
| | RBAC Matrix | `/admin/users/rbac-matrix` | View permission matrix |
| | Login Activity | `/admin/users/login-activity` | Track user login history |
| **Logistics Masters** | Carriers | `/admin/logistics/carriers` | Manage shipping carriers |
| | Ports | `/admin/logistics/ports` | Manage seaports |
| | Airports | `/admin/logistics/airports` | Manage airports |
| | Container Types | `/admin/logistics/container-types` | Define container specifications |
| | Incoterms | `/admin/logistics/incoterms` | Manage trade terms |
| | Transport Modes | `/admin/logistics/transport-modes` | Configure transport methods |
| **Operations Monitoring** | All Shipments | `/admin/ops/shipments` | View all shipments across companies |
| | Container Tracking | `/admin/ops/container-tracking` | Track containers |
| | BOL Monitoring | `/admin/ops/bol-monitoring` | Monitor bills of lading |
| | Carrier Tracking | `/admin/ops/carrier-tracking` | Track carrier performance |
| | Dispatch Monitoring | `/admin/ops/dispatch-monitoring` | Monitor dispatches |
| | Fleet Monitoring | `/admin/ops/fleet-monitoring` | Monitor fleet operations |
| | Warehouse Monitoring | `/admin/ops/warehouse-monitoring` | Monitor warehouse operations |
| **Finance & Billing** | Subscription Billing | `/admin/finance/subscription-billing` | Manage subscriptions |
| | Invoices | `/admin/finance/invoices` | View and manage invoices |
| | Revenue | `/admin/finance/revenue` | Revenue analytics |
| | Taxes | `/admin/finance/taxes` | Tax management |
| **Reports & Analytics** | Platform Reports | `/admin/reports/platform` | Platform-wide reports |
| | Shipment Analytics | `/admin/reports/shipment-analytics` | Shipment analysis |
| | Revenue Analytics | `/admin/reports/revenue-analytics` | Revenue analysis |
| | SLA Reports | `/admin/reports/sla` | SLA compliance reports |
| **Workflow & Customization** | Custom Fields | `/admin/workflow/custom-fields` | Define custom fields |
| | Custom Statuses | `/admin/workflow/custom-statuses` | Create custom statuses |
| | Workflow Builder | `/admin/workflow/builder` | Build custom workflows |
| | Email Templates | `/admin/workflow/email-templates` | Manage email templates |
| | Notification Templates | `/admin/workflow/notification-templates` | Manage notifications |
| **System Configuration** | Settings | `/admin/system/settings` | Global settings |
| | Integrations | `/admin/system/integrations` | Manage integrations |
| | API Config | `/admin/system/api-config` | API configuration |
| | Security Settings | `/admin/system/security` | Security configuration |
| **Audit & Security** | Audit Logs | `/admin/audit/logs` | View audit logs |
| | Error Logs | `/admin/audit/error-logs` | View error logs |
| | Access Logs | `/admin/audit/access-logs` | View access logs |
| | System Activity | `/admin/audit/system-activity` | Monitor system activity |

---

## usr-008 — Vikram Sharma `CompanyAdmin`

**Login:** `company_admin` / `admin123`  
**Dashboard:** `/company/dashboard`  
**Tenancy:** `cmp-001`, No Organization, No Agent  
**Scope:** Full control within one company — no platform-level settings

| Group | Menu | Route | Description |
|---|---|---|---|
| — | Dashboard | `/company/dashboard` | Company overview and KPIs |
| **Shipments** | Shipments | `/company/shipments` | Manage all company shipments |
| | Orders | `/company/orders` | Manage orders |
| | Bill of Lading | `/company/bol` | Manage BOL documents |
| | Container Tracking | `/company/container-tracking` | Track containers |
| **Dispatch & Fleet** | Dispatch Board | `/company/dispatch` | Manage dispatches |
| | Drivers | `/company/drivers` | Manage drivers |
| | Fleet | `/company/fleet` | Manage fleet vehicles |
| **Warehouse** | Warehouse | `/company/warehouse` | Warehouse operations |
| | Inventory | `/company/inventory` | Manage inventory |
| **Customers & Agents** | Customers | `/company/customers` | Manage customers |
| | Agents | `/company/agents` | Manage agents |
| **Finance** | Invoices | `/company/finance/invoices` | View and manage invoices |
| | Payments | `/company/finance/payments` | Track payments |
| | Expenses | `/company/finance/expenses` | Track expenses |
| **Reports** | Shipment Reports | `/company/reports/shipments` | Shipment-level reporting |
| | Revenue Reports | `/company/reports/revenue` | Revenue analysis |
| | Performance Reports | `/company/reports/performance` | Performance KPIs |
| **Users & Settings** | Company Users | `/company/users` | Manage company users |
| | Roles | `/company/roles` | Manage company roles |
| | Notifications | `/company/notifications` | Notification preferences |
| | Settings | `/company/settings` | Company settings |

---

## usr-002 — Priya Sharma `Manager`

**Login:** `ops_manager` / `ops123`  
**Dashboard:** `/manager/dashboard`  
**Tenancy:** `cmp-001`, `org-001`, `agt-001`  
**Scope:** Full operational oversight — no user management or company settings

| Group | Menu | Route | Description |
|---|---|---|---|
| — | Dashboard | `/manager/dashboard` | Operational overview and KPIs |
| **Shipments** | Shipments | `/manager/shipments` | View and manage shipments |
| | Orders | `/manager/orders` | View and manage orders |
| | BOL | `/manager/bol` | Bill of lading management |
| **Dispatch & Fleet** | Dispatch Board | `/manager/dispatch` | Manage dispatch assignments |
| | Drivers | `/manager/drivers` | View and manage drivers |
| | Fleet | `/manager/fleet` | View and manage fleet |
| **Warehouse** | Warehouse | `/manager/warehouse` | Warehouse operations |
| **Customers** | Customers | `/manager/customers` | View and manage customers |
| **Reports** | Shipment Reports | `/manager/reports/shipments` | Shipment-level reporting |
| | Performance Reports | `/manager/reports/performance` | Team performance KPIs |
| | SLA Reports | `/manager/reports/sla` | SLA compliance tracking |
| **Misc** | Notifications | `/manager/notifications` | Manage notifications |
| | Settings | `/manager/settings` | Profile settings only |

---

## usr-003 — Amit Patel `Dispatcher`
## usr-009 — Rajesh Verma `Operator`

**Login (Dispatcher):** `dispatch` / `dispatch123`  
**Login (Operator):** `operator01` / `operator123`  
**Dashboard:** `/ops/dashboard`  
**Scope:** Movement and logistics execution only — both roles share the same menu

> **Note:** Both roles share route base `/ops/`. A single layout component handles both.

| Group | Menu | Route | Description |
|---|---|---|---|
| — | Dashboard | `/ops/dashboard` | Dispatch and fleet overview |
| **Shipments** | Shipments | `/ops/shipments` | View assigned shipments |
| | Container Tracking | `/ops/container-tracking` | Track container movements |
| **Dispatch** | Dispatch Board | `/ops/dispatch` | Manage dispatch assignments |
| | Drivers | `/ops/drivers` | View driver status and assignments |
| | Fleet | `/ops/fleet` | View fleet and vehicle status |
| **Misc** | Notifications | `/ops/notifications` | Operational notifications |

---

## usr-004 — Sunita Reddy `Agent` (Warehouse)
## usr-005 — Mohammed Khan `Agent` (Driver)
## usr-006 — Ananya Gupta `Agent` (Finance)

**Login (Warehouse):** `warehouse` / `warehouse123`  
**Login (Driver):** `driver01` / `driver123`  
**Login (Finance):** `finance` / `finance123`  
**Dashboard:** `/agent/dashboard`  
**Scope:** Task-scoped access — KPI cards on dashboard should adapt based on `agentType`

> **Recommended fix in `mockData.ts`:** Add `agentType: 'warehouse' | 'driver' | 'finance'` to each Agent user so dashboard KPI cards and page-level guards can render role-appropriate content.

| Group | Menu | Route | Description |
|---|---|---|---|
| — | Dashboard | `/agent/dashboard` | Agent overview (adapts by agentType) |
| **Shipments** | My Shipments | `/agent/shipments` | View assigned shipments |
| | Orders | `/agent/orders` | View related orders |
| **Warehouse** | Warehouse | `/agent/warehouse` | Warehouse tasks and inventory |
| **Customers** | Customers | `/agent/customers` | View customer records |
| **Finance** | Invoices | `/agent/finance/invoices` | View invoices |
| | Payments | `/agent/finance/payments` | View payment records |
| **Reports** | My Reports | `/agent/reports` | Personal performance reports |
| **Misc** | Notifications | `/agent/notifications` | Task and alert notifications |

---

## usr-007 — Vikram Singh `Staff`
## usr-010 — Neha Tripathi `Staff`

**Login (Support):** `support` / `support123`  
**Login (Staff):** `staff01` / `staff123`  
**Dashboard:** `/staff/dashboard`  
**Scope:** Read-heavy, data entry assistance — no management or configuration access

| Group | Menu | Route | Description |
|---|---|---|---|
| — | Dashboard | `/staff/dashboard` | Staff task overview |
| **Shipments** | Shipments | `/staff/shipments` | View shipments (read + data entry) |
| | Orders | `/staff/orders` | View and assist with orders |
| **Customers** | Customers | `/staff/customers` | View customer records |
| **Warehouse** | Warehouse | `/staff/warehouse` | View warehouse data |
| **Finance** | Invoices | `/staff/finance/invoices` | View invoices (read only) |
| **Reports** | Reports | `/staff/reports` | View available reports |
| **Misc** | Notifications | `/staff/notifications` | Notifications and alerts |

---

## mockData.ts — Role Menu Access Map

```ts
// data/mockData.ts
export const ROLE_MENU_ACCESS = {
  SuperAdmin: [
    '/admin/dashboard',
    '/admin/org/companies', '/admin/org/organizations', '/admin/org/company-types',
    '/admin/org/subscription-plans', '/admin/org/approvals',
    '/admin/users/all', '/admin/users/roles', '/admin/users/rbac-matrix', '/admin/users/login-activity',
    '/admin/logistics/carriers', '/admin/logistics/ports', '/admin/logistics/airports',
    '/admin/logistics/container-types', '/admin/logistics/incoterms', '/admin/logistics/transport-modes',
    '/admin/ops/shipments', '/admin/ops/container-tracking', '/admin/ops/bol-monitoring',
    '/admin/ops/carrier-tracking', '/admin/ops/dispatch-monitoring', '/admin/ops/fleet-monitoring',
    '/admin/ops/warehouse-monitoring',
    '/admin/finance/subscription-billing', '/admin/finance/invoices', '/admin/finance/revenue', '/admin/finance/taxes',
    '/admin/reports/platform', '/admin/reports/shipment-analytics', '/admin/reports/revenue-analytics', '/admin/reports/sla',
    '/admin/workflow/custom-fields', '/admin/workflow/custom-statuses', '/admin/workflow/builder',
    '/admin/workflow/email-templates', '/admin/workflow/notification-templates',
    '/admin/system/settings', '/admin/system/integrations', '/admin/system/api-config', '/admin/system/security',
    '/admin/audit/logs', '/admin/audit/error-logs', '/admin/audit/access-logs', '/admin/audit/system-activity',
  ],
  CompanyAdmin: [
    '/company/dashboard',
    '/company/shipments', '/company/orders', '/company/bol', '/company/container-tracking',
    '/company/dispatch', '/company/drivers', '/company/fleet',
    '/company/warehouse', '/company/inventory',
    '/company/customers', '/company/agents',
    '/company/finance/invoices', '/company/finance/payments', '/company/finance/expenses',
    '/company/reports/shipments', '/company/reports/revenue', '/company/reports/performance',
    '/company/users', '/company/roles', '/company/notifications', '/company/settings',
  ],
  Manager: [
    '/manager/dashboard',
    '/manager/shipments', '/manager/orders', '/manager/bol',
    '/manager/dispatch', '/manager/drivers', '/manager/fleet',
    '/manager/warehouse',
    '/manager/customers',
    '/manager/reports/shipments', '/manager/reports/performance', '/manager/reports/sla',
    '/manager/notifications', '/manager/settings',
  ],
  Dispatcher: [
    '/ops/dashboard',
    '/ops/shipments', '/ops/container-tracking',
    '/ops/dispatch', '/ops/drivers', '/ops/fleet',
    '/ops/notifications',
  ],
  Operator: [
    '/ops/dashboard',
    '/ops/shipments', '/ops/container-tracking',
    '/ops/dispatch', '/ops/drivers', '/ops/fleet',
    '/ops/notifications',
  ],
  Agent: [
    '/agent/dashboard',
    '/agent/shipments', '/agent/orders',
    '/agent/warehouse',
    '/agent/customers',
    '/agent/finance/invoices', '/agent/finance/payments',
    '/agent/reports',
    '/agent/notifications',
  ],
  Staff: [
    '/staff/dashboard',
    '/staff/shipments', '/staff/orders',
    '/staff/customers',
    '/staff/warehouse',
    '/staff/finance/invoices',
    '/staff/reports',
    '/staff/notifications',
  ],
};
```

---

## Source Files

| File | Purpose |
|---|---|
| `data/mockData.ts` | User records, `ROLE_MENU_ACCESS` map, mock data |
| `data/super-admin-menu.ts` | SuperAdmin sidebar menu definition |
| `components/layout/SuperAdminSidebar.tsx` | SuperAdmin sidebar component |
| `components/layout/CompanyAdminSidebar.tsx` | CompanyAdmin sidebar component |
| `components/layout/Sidebar.tsx` | Shared sidebar for Manager / Dispatcher / Operator / Agent / Staff |
| `services/authService.ts` | Login, role detection, dashboard redirect |
