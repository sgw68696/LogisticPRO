# LogisticsPro — Role-Based Sidebar Menu Guide

> **Principle:** SuperAdmin manages the platform, CompanyAdmin manages one company, and operational roles (Manager, Dispatcher, Operator, Agent, Staff) get progressively narrower access scoped to their function. CustomerPortal is read-only self-service. DriverApp is mobile-first.

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
| `usr-011` | Customs Officer | `CustomsAgent` | `customs01` | `customs123` | `/customs/dashboard` |
| `usr-012` | Port Officer | `PortAgent` | `port01` | `port123` | `/port/dashboard` |
| `usr-013` | Customer (Guest) | `CustomerPortal` | `customer01` | `cust123` | `/portal/dashboard` |
| `usr-014` | Internal Auditor | `AuditorReadOnly` | `auditor01` | `audit123` | `/audit/dashboard` |

---

## Auth Service — Role to Dashboard Map

```ts
// services/authService.ts
const ROLE_DASHBOARD_MAP = {
  SuperAdmin:      '/admin/dashboard',
  CompanyAdmin:    '/company/dashboard',
  Manager:         '/manager/dashboard',
  Dispatcher:      '/ops/dashboard',
  Operator:        '/ops/dashboard',
  Agent:           '/agent/dashboard',   // adapts by agentType
  Staff:           '/staff/dashboard',
  CustomsAgent:    '/customs/dashboard',
  PortAgent:       '/port/dashboard',
  CustomerPortal:  '/portal/dashboard',
  AuditorReadOnly: '/audit/dashboard',
};
```

---

## Shipment Lifecycle — Stage Map

> Every shipment passes through these stages. Sidebar items and document requirements adapt per stage.

```
Booking → Confirmed → Picked Up → In Transit →
At Port/Airport → Customs Clearance → Out for Delivery → Delivered → Closed
```

| Stage | Who Acts | Key Documents |
|---|---|---|
| Booking | CompanyAdmin, Manager | Rate Card, Booking Form |
| Confirmed | CompanyAdmin, Dispatcher | Booking Confirmation |
| Picked Up | Driver, Warehouse Agent | Packing List, GRN |
| In Transit | Dispatcher, Operator | BOL, Carrier Tracking |
| At Port/Airport | PortAgent | Cargo Manifest, AWB / BOL |
| Customs Clearance | CustomsAgent | Customs Declaration, COO, DGD |
| Out for Delivery | Driver | Trip Sheet, POD |
| Delivered | Driver, Warehouse Agent | Signed POD |
| Closed | Finance Agent | Invoice, Payment Record |

---

## Transport Mode Context

> Add `transportMode` to every shipment. Sidebar document requirements and tracking fields adapt per mode.

| Mode | Key Fields | Tracking Ref | Extra Documents |
|---|---|---|---|
| **Road** | Vehicle No., Driver, Route | GPS / Trip ID | Trip Sheet, Toll Receipts |
| **Air Freight** | Airline, Flight No. | AWB Number | Air Waybill, Cargo Manifest |
| **Sea Freight** | Vessel, Voyage No., Port | IMO / Container No. | BOL, Arrival Notice |
| **Rail** | Train No., Wagon No. | Rail Consignment No. | Rail Waybill |
| **Multimodal** | All modes in sequence | Master Tracking ID | All above, Handoff Records |
| **Last-Mile / Courier** | Courier, Bag No. | Tracking No. | POD, Delivery Slip |

---

## usr-001 — Rajesh Kumar `SuperAdmin`

**Login:** `superadmin` / `admin123`
**Dashboard:** `/admin/dashboard`
**Tenancy:** No Company, No Organization, No Agent

### Dashboard KPIs
> Total Companies · Active Shipments · MRR · Platform Uptime · Open Approvals

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
| | HS Code Library | `/admin/logistics/hs-codes` | Manage HS codes for customs |
| | Country Restrictions | `/admin/logistics/restrictions` | Import/export country rules |
| | Dangerous Goods Rules | `/admin/logistics/dg-rules` | DG classification and rules |
| **Operations Monitoring** | All Shipments | `/admin/ops/shipments` | View all shipments across companies |
| | Live Map | `/admin/ops/live-map` | Real-time fleet and shipment map |
| | Container Tracking | `/admin/ops/container-tracking` | Track containers |
| | BOL Monitoring | `/admin/ops/bol-monitoring` | Monitor bills of lading |
| | Carrier Tracking | `/admin/ops/carrier-tracking` | Track carrier performance |
| | Dispatch Monitoring | `/admin/ops/dispatch-monitoring` | Monitor dispatches |
| | Fleet Monitoring | `/admin/ops/fleet-monitoring` | Monitor fleet operations |
| | Warehouse Monitoring | `/admin/ops/warehouse-monitoring` | Monitor warehouse operations |
| | SLA Breach Alerts | `/admin/ops/sla-alerts` | Live SLA breach and delay alerts |
| **Bookings & Rates** | All Bookings | `/admin/bookings` | View all bookings across companies |
| | Rate Cards | `/admin/rates/cards` | Manage global rate cards |
| | Contract Rates | `/admin/rates/contracts` | Manage carrier contracts |
| **Compliance & Customs** | Customs Declarations | `/admin/compliance/customs` | Monitor all customs declarations |
| | Import/Export Licenses | `/admin/compliance/licenses` | Manage licenses and permits |
| | Compliance Reports | `/admin/compliance/reports` | Regulatory compliance reports |
| **Finance & Billing** | Subscription Billing | `/admin/finance/subscription-billing` | Manage subscriptions |
| | Invoices | `/admin/finance/invoices` | View and manage invoices |
| | Revenue | `/admin/finance/revenue` | Revenue analytics |
| | Taxes | `/admin/finance/taxes` | Tax management |
| **Reports & Analytics** | Platform Reports | `/admin/reports/platform` | Platform-wide reports |
| | Shipment Analytics | `/admin/reports/shipment-analytics` | On-time %, delay trends |
| | Revenue Analytics | `/admin/reports/revenue-analytics` | Revenue and cost analysis |
| | Carrier Performance | `/admin/reports/carrier-performance` | Carrier score and SLA |
| | Warehouse Throughput | `/admin/reports/warehouse` | Warehouse KPI analytics |
| | SLA Reports | `/admin/reports/sla` | SLA compliance reports |
| **Workflow & Customization** | Custom Fields | `/admin/workflow/custom-fields` | Define custom fields |
| | Custom Statuses | `/admin/workflow/custom-statuses` | Create custom statuses |
| | Workflow Builder | `/admin/workflow/builder` | Build custom workflows |
| | Email Templates | `/admin/workflow/email-templates` | Manage email templates |
| | Notification Templates | `/admin/workflow/notification-templates` | Manage notifications |
| | Document Types | `/admin/workflow/document-types` | Define document categories |
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

### Dashboard KPIs
> Active Shipments · Pending Invoices · Fleet On-Road · Warehouse Utilization % · Bookings This Month

| Group | Menu | Route | Description |
|---|---|---|---|
| — | Dashboard | `/company/dashboard` | Company overview and KPIs |
| **Bookings & Rates** | New Booking | `/company/bookings/new` | Create a new shipment booking |
| | Booking Requests | `/company/bookings/requests` | Manage pending booking requests |
| | All Bookings | `/company/bookings` | View all bookings |
| | Rate Cards | `/company/rates/cards` | View and apply rate cards |
| | Spot Rate Requests | `/company/rates/spot` | Request spot quotes from carriers |
| | Contract Rates | `/company/rates/contracts` | Manage carrier contract rates |
| **Shipments** | Shipments | `/company/shipments` | Manage all company shipments |
| | Orders | `/company/orders` | Manage orders |
| | Bill of Lading | `/company/bol` | Manage BOL documents |
| | Container Tracking | `/company/container-tracking` | Track containers |
| | Live Map | `/company/live-map` | Real-time map of all shipments |
| | SLA Alerts | `/company/sla-alerts` | Active breach and delay alerts |
| **Documents** | All Documents | `/company/documents` | All shipment documents |
| | BOL | `/company/documents/bol` | Bills of Lading |
| | Packing Lists | `/company/documents/packing-lists` | Packing list management |
| | Commercial Invoices | `/company/documents/commercial-invoices` | Commercial invoice docs |
| | Certificates of Origin | `/company/documents/coo` | COO management |
| | Insurance Certificates | `/company/documents/insurance` | Insurance docs |
| | POD | `/company/documents/pod` | Proof of delivery records |
| **Compliance & Customs** | Customs Declarations | `/company/compliance/customs` | Manage customs declarations |
| | HS Codes | `/company/compliance/hs-codes` | HS code lookup |
| | Import/Export Licenses | `/company/compliance/licenses` | Company licenses and permits |
| | Dangerous Goods | `/company/compliance/dg` | DG shipment management |
| **Dispatch & Fleet** | Dispatch Board | `/company/dispatch` | Manage dispatches |
| | Drivers | `/company/drivers` | Manage drivers |
| | Driver Documents | `/company/fleet/driver-docs` | License expiry, permits |
| | Fleet | `/company/fleet` | Manage fleet vehicles |
| | Vehicle Documents | `/company/fleet/vehicle-docs` | RC, insurance, permits |
| | Live GPS Tracking | `/company/fleet/live-map` | Real-time vehicle locations |
| | Trip History | `/company/fleet/trips` | Completed trip logs |
| | Maintenance Schedule | `/company/fleet/maintenance` | Service and repair tracking |
| | Fuel Logs | `/company/fleet/fuel` | Fuel consumption records |
| **Warehouse** | Inbound (GRN) | `/company/warehouse/inbound` | Goods received notes |
| | Outbound (GDN) | `/company/warehouse/outbound` | Goods dispatch notes |
| | Stock Positions | `/company/warehouse/stock` | Current inventory levels |
| | Bin / Rack Locations | `/company/warehouse/locations` | Storage location map |
| | Cycle Count | `/company/warehouse/cycle-count` | Stocktake and audits |
| | Damage Reports | `/company/warehouse/damage` | Damaged goods records |
| | Cold Chain | `/company/warehouse/cold-chain` | Temperature monitoring |
| | Inventory | `/company/inventory` | Manage inventory |
| **Customers & Agents** | Customers | `/company/customers` | Manage customers |
| | Agents | `/company/agents` | Manage agents |
| **Finance** | Invoices | `/company/finance/invoices` | View and manage invoices |
| | Payments | `/company/finance/payments` | Track payments |
| | Expenses | `/company/finance/expenses` | Track expenses |
| | Reconciliation | `/company/finance/reconciliation` | Payment reconciliation |
| **Reports** | Shipment Reports | `/company/reports/shipments` | Shipment-level reporting |
| | Revenue Reports | `/company/reports/revenue` | Revenue and cost analysis |
| | Performance Reports | `/company/reports/performance` | Performance KPIs |
| | Carrier Performance | `/company/reports/carrier-performance` | Carrier score and SLA |
| | Warehouse Throughput | `/company/reports/warehouse` | Warehouse KPI analytics |
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

### Dashboard KPIs
> Shipments This Week · SLA Breach Count · Drivers On Duty · Open Orders · Pending Dispatches

| Group | Menu | Route | Description |
|---|---|---|---|
| — | Dashboard | `/manager/dashboard` | Operational overview and KPIs |
| **Bookings** | New Booking | `/manager/bookings/new` | Create a new shipment booking |
| | All Bookings | `/manager/bookings` | View and manage bookings |
| | Rate Cards | `/manager/rates/cards` | View available rate cards |
| **Shipments** | Shipments | `/manager/shipments` | View and manage shipments |
| | Orders | `/manager/orders` | View and manage orders |
| | BOL | `/manager/bol` | Bill of lading management |
| | Live Map | `/manager/live-map` | Real-time shipment and fleet map |
| | SLA Alerts | `/manager/sla-alerts` | Live breach and delay alerts |
| **Documents** | Documents | `/manager/documents` | View all shipment documents |
| **Dispatch & Fleet** | Dispatch Board | `/manager/dispatch` | Manage dispatch assignments |
| | Drivers | `/manager/drivers` | View and manage drivers |
| | Fleet | `/manager/fleet` | View and manage fleet |
| | Live GPS | `/manager/fleet/live-map` | Real-time vehicle tracking |
| | Trip History | `/manager/fleet/trips` | Completed trip logs |
| | Maintenance | `/manager/fleet/maintenance` | Maintenance schedule |
| | Fuel Logs | `/manager/fleet/fuel` | Fuel consumption records |
| **Warehouse** | Inbound (GRN) | `/manager/warehouse/inbound` | Goods received notes |
| | Outbound (GDN) | `/manager/warehouse/outbound` | Goods dispatch notes |
| | Stock Positions | `/manager/warehouse/stock` | Current stock levels |
| | Damage Reports | `/manager/warehouse/damage` | Damage records |
| **Customers** | Customers | `/manager/customers` | View and manage customers |
| **Compliance** | Customs Declarations | `/manager/compliance/customs` | View customs status |
| | Dangerous Goods | `/manager/compliance/dg` | DG shipment view |
| **Finance** | Financial Overview | `/manager/finance/overview` | P&L at org level |
| **Reports** | Shipment Reports | `/manager/reports/shipments` | Shipment-level reporting |
| | Performance Reports | `/manager/reports/performance` | Team performance KPIs |
| | Carrier Performance | `/manager/reports/carrier-performance` | Carrier score and SLA |
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

### Dashboard KPIs
> Pending Dispatches · Drivers Available · Vehicles In Transit · Delayed Shipments

| Group | Menu | Route | Description |
|---|---|---|---|
| — | Dashboard | `/ops/dashboard` | Dispatch and fleet overview |
| **Shipments** | Shipments | `/ops/shipments` | View assigned shipments |
| | Container Tracking | `/ops/container-tracking` | Track container movements |
| | SLA Alerts | `/ops/sla-alerts` | Active breach and delay alerts |
| **Dispatch** | Dispatch Board | `/ops/dispatch` | Manage dispatch assignments |
| | Drivers | `/ops/drivers` | View driver status and assignments |
| | Fleet | `/ops/fleet` | View fleet and vehicle status |
| | Live Map | `/ops/live-map` | Real-time vehicle tracking map |
| | Trip History | `/ops/fleet/trips` | Completed trip logs |
| **Documents** | Documents | `/ops/documents` | View shipment documents (read only) |
| **Misc** | Notifications | `/ops/notifications` | Operational notifications |

---

## usr-004 — Sunita Reddy `Agent` (Warehouse)
## usr-005 — Mohammed Khan `Agent` (Driver)
## usr-006 — Ananya Gupta `Agent` (Finance)

**Login (Warehouse):** `warehouse` / `warehouse123`
**Login (Driver):** `driver01` / `driver123`
**Login (Finance):** `finance` / `finance123`
**Dashboard:** `/agent/dashboard`
**Scope:** Task-scoped access — KPI cards and visible menu items adapt based on `agentType`

> **`agentType` drives sidebar visibility. Use the table below to guard page-level routes.**

| Menu Item | `warehouse` | `driver` | `finance` |
|---|---|---|---|
| My Shipments | ✅ | ✅ | ✅ |
| Orders | ✅ | ❌ | ✅ |
| Inbound / GRN | ✅ | ❌ | ❌ |
| Outbound / GDN | ✅ | ❌ | ❌ |
| Stock Positions | ✅ | ❌ | ❌ |
| Damage Reports | ✅ | ❌ | ❌ |
| My Trips | ❌ | ✅ | ❌ |
| POD Upload | ❌ | ✅ | ❌ |
| Live Navigation | ❌ | ✅ | ❌ |
| Fuel / Expense Claims | ❌ | ✅ | ❌ |
| Invoices | ❌ | ❌ | ✅ |
| Payments | ❌ | ❌ | ✅ |
| Reconciliation | ❌ | ❌ | ✅ |
| Customers | ✅ | ❌ | ✅ |
| Documents | ✅ | ✅ | ✅ |
| My Reports | ✅ | ✅ | ✅ |
| Notifications | ✅ | ✅ | ✅ |

### Dashboard KPIs (by agentType)

| agentType | KPI Cards |
|---|---|
| `warehouse` | GRNs Today · Pending Outbound · Stock Alerts · Damage Reports |
| `driver` | Today's Trips · KM Driven · Deliveries Completed · Pending PODs |
| `finance` | Invoices Due · Payments Received Today · Overdue Count · Reconciled % |

### Full Menu Table

| Group | Menu | Route | Description |
|---|---|---|---|
| — | Dashboard | `/agent/dashboard` | Agent overview (adapts by agentType) |
| **Shipments** | My Shipments | `/agent/shipments` | View assigned shipments |
| | Orders | `/agent/orders` | View related orders |
| **Warehouse** | Inbound (GRN) | `/agent/warehouse/inbound` | Receive goods, create GRN |
| | Outbound (GDN) | `/agent/warehouse/outbound` | Dispatch goods, create GDN |
| | Stock Positions | `/agent/warehouse/stock` | Current stock levels |
| | Bin / Rack Locations | `/agent/warehouse/locations` | Storage location view |
| | Damage Reports | `/agent/warehouse/damage` | Log and view damage records |
| **Driver** | My Trips | `/agent/trips` | Today's and upcoming trips |
| | POD Upload | `/agent/pod` | Proof of delivery capture (photo + signature) |
| | Live Navigation | `/agent/map` | GPS navigation assist |
| | Fuel / Expense Claims | `/agent/expenses` | Fuel, toll, and expense claims |
| **Customers** | Customers | `/agent/customers` | View customer records |
| **Finance** | Invoices | `/agent/finance/invoices` | View invoices |
| | Payments | `/agent/finance/payments` | View payment records |
| | Reconciliation | `/agent/finance/reconciliation` | Payment reconciliation |
| **Documents** | Documents | `/agent/documents` | View and upload shipment documents |
| **Reports** | My Reports | `/agent/reports` | Personal performance reports |
| **Misc** | Notifications | `/agent/notifications` | Task and alert notifications |

---

## usr-007 — Vikram Singh `Staff`
## usr-010 — Neha Tripathi `Staff`

**Login (Support):** `support` / `support123`
**Login (Staff):** `staff01` / `staff123`
**Dashboard:** `/staff/dashboard`
**Scope:** Data entry and read access — all write actions go through approval queue

### Dashboard KPIs
> Tasks Assigned · Documents Pending Upload · Orders to Process · Approval Queue Count

> **Note:** Staff can create and upload, but changes enter an **approval queue** before going live.

| Group | Menu | Route | Description |
|---|---|---|---|
| — | Dashboard | `/staff/dashboard` | Staff task overview |
| **Shipments** | Shipments | `/staff/shipments` | View shipments + create pending entries |
| | Orders | `/staff/orders` | View and assist with orders |
| **Customers** | Customers | `/staff/customers` | View customer records |
| **Warehouse** | Warehouse | `/staff/warehouse` | View warehouse data |
| | Damage Reports | `/staff/warehouse/damage` | File damage report (pending approval) |
| **Documents** | Documents | `/staff/documents` | Upload shipment documents |
| **Finance** | Invoices | `/staff/finance/invoices` | View invoices (read only) |
| **Reports** | Reports | `/staff/reports` | View available reports |
| **Misc** | Notifications | `/staff/notifications` | Notifications and alerts |

---

## usr-011 — Customs Officer `CustomsAgent`

**Login:** `customs01` / `customs123`
**Dashboard:** `/customs/dashboard`
**Tenancy:** `cmp-001`, scoped to assigned shipments
**Scope:** Customs, compliance, and regulatory documentation only

### Dashboard KPIs
> Declarations Pending · Cleared Today · Holds / Queries · HS Code Lookups

| Group | Menu | Route | Description |
|---|---|---|---|
| — | Dashboard | `/customs/dashboard` | Customs activity overview |
| **Customs** | Declarations | `/customs/declarations` | View and file customs declarations |
| | Pending Clearance | `/customs/pending` | Shipments awaiting clearance |
| | Cleared Shipments | `/customs/cleared` | Completed clearances |
| | Holds & Queries | `/customs/holds` | Shipments on hold or queried |
| **Compliance** | HS Code Lookup | `/customs/hs-codes` | Search and apply HS codes |
| | Import/Export Licenses | `/customs/licenses` | View applicable licenses |
| | Dangerous Goods | `/customs/dg` | DG declarations and rules |
| | Country Restrictions | `/customs/restrictions` | View import/export restrictions |
| **Documents** | Customs Documents | `/customs/documents` | Declarations, COO, DGD |
| | Commercial Invoices | `/customs/documents/invoices` | View commercial invoices |
| | Certificates of Origin | `/customs/documents/coo` | View and file COO |
| **Reports** | Clearance Reports | `/customs/reports` | Customs activity reports |
| **Misc** | Notifications | `/customs/notifications` | Customs alerts and updates |

---

## usr-012 — Port Officer `PortAgent`

**Login:** `port01` / `port123`
**Dashboard:** `/port/dashboard`
**Tenancy:** `cmp-001`, scoped to assigned port / airport
**Scope:** Port and airport operations — vessel/flight arrivals, cargo handling

### Dashboard KPIs
> Vessels/Flights Arriving Today · Cargo Pending Offload · Containers In Port · Berths Occupied

| Group | Menu | Route | Description |
|---|---|---|---|
| — | Dashboard | `/port/dashboard` | Port activity overview |
| **Arrivals & Departures** | Vessel Schedule | `/port/vessels` | Vessel arrival and departure schedule |
| | Flight Schedule | `/port/flights` | Flight arrival and departure schedule |
| | Berth Allocation | `/port/berths` | Manage berth assignments |
| **Cargo** | Container List | `/port/containers` | Containers in port |
| | Cargo Manifest | `/port/manifests` | View cargo manifests |
| | Offload / Load Log | `/port/cargo-log` | Cargo handling records |
| **Finance** | Port Charges | `/port/charges` | Port handling charges |
| **Documents** | Port Documents | `/port/documents` | Arrival notices, manifests |
| **Reports** | Port Reports | `/port/reports` | Port activity reports |
| **Misc** | Notifications | `/port/notifications` | Port alerts and updates |

---

## usr-013 — Customer `CustomerPortal`

**Login:** `customer01` / `cust123`
**Dashboard:** `/portal/dashboard`
**Tenancy:** Scoped to their own shipments only
**Scope:** Self-service read-only — track shipments, download documents, raise queries

> **Note:** No internal data visible. Customers only see their own shipments and invoices.

### Dashboard KPIs
> Active Shipments · Delivered This Month · Pending Invoices · Open Queries

| Group | Menu | Route | Description |
|---|---|---|---|
| — | Dashboard | `/portal/dashboard` | Shipment and invoice overview |
| **My Shipments** | Shipments | `/portal/shipments` | Track all my shipments |
| | Shipment Detail | `/portal/shipments/:id` | Detailed stage-by-stage tracking |
| | Live Tracking | `/portal/tracking` | Real-time shipment location |
| **Bookings** | New Booking Request | `/portal/bookings/new` | Request a new shipment booking |
| | My Bookings | `/portal/bookings` | View all my bookings |
| **Documents** | My Documents | `/portal/documents` | Download BOL, invoice, POD |
| **Finance** | My Invoices | `/portal/invoices` | View and download invoices |
| | Payment History | `/portal/payments` | View payment records |
| **Support** | Raise a Query | `/portal/support/new` | Submit a new query or complaint |
| | My Queries | `/portal/support` | Track open and closed queries |
| **Misc** | Notifications | `/portal/notifications` | Shipment and invoice alerts |

---

## usr-014 — Internal Auditor `AuditorReadOnly`

**Login:** `auditor01` / `audit123`
**Dashboard:** `/audit/dashboard`
**Tenancy:** No Company — cross-company read access
**Scope:** Full read access across all data — no write permissions whatsoever

### Dashboard KPIs
> Companies Audited · Open Findings · Audit Reports This Month · Access Log Alerts

| Group | Menu | Route | Description |
|---|---|---|---|
| — | Dashboard | `/audit/dashboard` | Audit activity overview |
| **Operations** | All Shipments | `/audit/shipments` | Read-only view of all shipments |
| | All Dispatches | `/audit/dispatches` | Read-only dispatch records |
| | Fleet Records | `/audit/fleet` | Read-only fleet data |
| | Warehouse Records | `/audit/warehouse` | Read-only warehouse data |
| **Finance** | Invoices | `/audit/finance/invoices` | Read-only invoice view |
| | Payments | `/audit/finance/payments` | Read-only payment records |
| | Expenses | `/audit/finance/expenses` | Read-only expense records |
| **Compliance** | Customs Declarations | `/audit/compliance/customs` | Read-only customs data |
| | License Records | `/audit/compliance/licenses` | Read-only license data |
| **Audit Logs** | Audit Logs | `/audit/logs` | Full audit trail |
| | Access Logs | `/audit/access-logs` | User access history |
| | Error Logs | `/audit/error-logs` | System error records |
| **Reports** | Audit Reports | `/audit/reports` | Compliance and audit reports |

---

## mockData.ts — Role Menu Access Map

```ts
// data/mockData.ts

export type AgentType = 'warehouse' | 'driver' | 'finance' | 'customs';

export const ROLE_MENU_ACCESS = {

  SuperAdmin: [
    '/admin/dashboard',
    '/admin/org/companies', '/admin/org/organizations', '/admin/org/company-types',
    '/admin/org/subscription-plans', '/admin/org/approvals',
    '/admin/users/all', '/admin/users/roles', '/admin/users/rbac-matrix', '/admin/users/login-activity',
    '/admin/logistics/carriers', '/admin/logistics/ports', '/admin/logistics/airports',
    '/admin/logistics/container-types', '/admin/logistics/incoterms', '/admin/logistics/transport-modes',
    '/admin/logistics/hs-codes', '/admin/logistics/restrictions', '/admin/logistics/dg-rules',
    '/admin/ops/shipments', '/admin/ops/live-map', '/admin/ops/container-tracking',
    '/admin/ops/bol-monitoring', '/admin/ops/carrier-tracking', '/admin/ops/dispatch-monitoring',
    '/admin/ops/fleet-monitoring', '/admin/ops/warehouse-monitoring', '/admin/ops/sla-alerts',
    '/admin/bookings', '/admin/rates/cards', '/admin/rates/contracts',
    '/admin/compliance/customs', '/admin/compliance/licenses', '/admin/compliance/reports',
    '/admin/finance/subscription-billing', '/admin/finance/invoices', '/admin/finance/revenue', '/admin/finance/taxes',
    '/admin/reports/platform', '/admin/reports/shipment-analytics', '/admin/reports/revenue-analytics',
    '/admin/reports/carrier-performance', '/admin/reports/warehouse', '/admin/reports/sla',
    '/admin/workflow/custom-fields', '/admin/workflow/custom-statuses', '/admin/workflow/builder',
    '/admin/workflow/email-templates', '/admin/workflow/notification-templates', '/admin/workflow/document-types',
    '/admin/system/settings', '/admin/system/integrations', '/admin/system/api-config', '/admin/system/security',
    '/admin/audit/logs', '/admin/audit/error-logs', '/admin/audit/access-logs', '/admin/audit/system-activity',
  ],

  CompanyAdmin: [
    '/company/dashboard',
    '/company/bookings/new', '/company/bookings/requests', '/company/bookings',
    '/company/rates/cards', '/company/rates/spot', '/company/rates/contracts',
    '/company/shipments', '/company/orders', '/company/bol', '/company/container-tracking',
    '/company/live-map', '/company/sla-alerts',
    '/company/documents', '/company/documents/bol', '/company/documents/packing-lists',
    '/company/documents/commercial-invoices', '/company/documents/coo',
    '/company/documents/insurance', '/company/documents/pod',
    '/company/compliance/customs', '/company/compliance/hs-codes',
    '/company/compliance/licenses', '/company/compliance/dg',
    '/company/dispatch', '/company/drivers', '/company/fleet',
    '/company/fleet/driver-docs', '/company/fleet/vehicle-docs', '/company/fleet/live-map',
    '/company/fleet/trips', '/company/fleet/maintenance', '/company/fleet/fuel',
    '/company/warehouse/inbound', '/company/warehouse/outbound', '/company/warehouse/stock',
    '/company/warehouse/locations', '/company/warehouse/cycle-count',
    '/company/warehouse/damage', '/company/warehouse/cold-chain', '/company/inventory',
    '/company/customers', '/company/agents',
    '/company/finance/invoices', '/company/finance/payments',
    '/company/finance/expenses', '/company/finance/reconciliation',
    '/company/reports/shipments', '/company/reports/revenue', '/company/reports/performance',
    '/company/reports/carrier-performance', '/company/reports/warehouse',
    '/company/users', '/company/roles', '/company/notifications', '/company/settings',
  ],

  Manager: [
    '/manager/dashboard',
    '/manager/bookings/new', '/manager/bookings', '/manager/rates/cards',
    '/manager/shipments', '/manager/orders', '/manager/bol',
    '/manager/live-map', '/manager/sla-alerts',
    '/manager/documents',
    '/manager/dispatch', '/manager/drivers', '/manager/fleet',
    '/manager/fleet/live-map', '/manager/fleet/trips',
    '/manager/fleet/maintenance', '/manager/fleet/fuel',
    '/manager/warehouse/inbound', '/manager/warehouse/outbound',
    '/manager/warehouse/stock', '/manager/warehouse/damage',
    '/manager/customers',
    '/manager/compliance/customs', '/manager/compliance/dg',
    '/manager/finance/overview',
    '/manager/reports/shipments', '/manager/reports/performance',
    '/manager/reports/carrier-performance', '/manager/reports/sla',
    '/manager/notifications', '/manager/settings',
  ],

  Dispatcher: [
    '/ops/dashboard',
    '/ops/shipments', '/ops/container-tracking', '/ops/sla-alerts',
    '/ops/dispatch', '/ops/drivers', '/ops/fleet',
    '/ops/live-map', '/ops/fleet/trips',
    '/ops/documents',
    '/ops/notifications',
  ],

  Operator: [
    '/ops/dashboard',
    '/ops/shipments', '/ops/container-tracking', '/ops/sla-alerts',
    '/ops/dispatch', '/ops/drivers', '/ops/fleet',
    '/ops/live-map', '/ops/fleet/trips',
    '/ops/documents',
    '/ops/notifications',
  ],

  Agent: [
    '/agent/dashboard',
    '/agent/shipments', '/agent/orders',
    // warehouse agentType
    '/agent/warehouse/inbound', '/agent/warehouse/outbound', '/agent/warehouse/stock',
    '/agent/warehouse/locations', '/agent/warehouse/damage',
    // driver agentType
    '/agent/trips', '/agent/pod', '/agent/map', '/agent/expenses',
    // finance agentType
    '/agent/finance/invoices', '/agent/finance/payments', '/agent/finance/reconciliation',
    // shared
    '/agent/customers',
    '/agent/documents',
    '/agent/reports',
    '/agent/notifications',
  ],

  // Use agentType to guard page-level access within Agent routes (see agentType table above)

  Staff: [
    '/staff/dashboard',
    '/staff/shipments', '/staff/orders',
    '/staff/customers',
    '/staff/warehouse', '/staff/warehouse/damage',
    '/staff/documents',
    '/staff/finance/invoices',
    '/staff/reports',
    '/staff/notifications',
  ],

  CustomsAgent: [
    '/customs/dashboard',
    '/customs/declarations', '/customs/pending', '/customs/cleared', '/customs/holds',
    '/customs/hs-codes', '/customs/licenses', '/customs/dg', '/customs/restrictions',
    '/customs/documents', '/customs/documents/invoices', '/customs/documents/coo',
    '/customs/reports',
    '/customs/notifications',
  ],

  PortAgent: [
    '/port/dashboard',
    '/port/vessels', '/port/flights', '/port/berths',
    '/port/containers', '/port/manifests', '/port/cargo-log',
    '/port/charges',
    '/port/documents',
    '/port/reports',
    '/port/notifications',
  ],

  CustomerPortal: [
    '/portal/dashboard',
    '/portal/shipments', '/portal/shipments/:id', '/portal/tracking',
    '/portal/bookings/new', '/portal/bookings',
    '/portal/documents',
    '/portal/invoices', '/portal/payments',
    '/portal/support/new', '/portal/support',
    '/portal/notifications',
  ],

  AuditorReadOnly: [
    '/audit/dashboard',
    '/audit/shipments', '/audit/dispatches', '/audit/fleet', '/audit/warehouse',
    '/audit/finance/invoices', '/audit/finance/payments', '/audit/finance/expenses',
    '/audit/compliance/customs', '/audit/compliance/licenses',
    '/audit/logs', '/audit/access-logs', '/audit/error-logs',
    '/audit/reports',
  ],

};
```

---

## Source Files

| File | Purpose |
|---|---|
| `data/mockData.ts` | User records, `ROLE_MENU_ACCESS` map, `agentType`, mock data |
| `data/transportModes.ts` | Air / Sea / Road / Rail mode configs and required fields |
| `data/documentTypes.ts` | BOL, POD, COO, DGD and other document category definitions |
| `data/super-admin-menu.ts` | SuperAdmin sidebar menu definition |
| `components/layout/SuperAdminSidebar.tsx` | SuperAdmin sidebar component |
| `components/layout/CompanyAdminSidebar.tsx` | CompanyAdmin sidebar component |
| `components/layout/Sidebar.tsx` | Shared sidebar for Manager / Dispatcher / Operator / Agent / Staff |
| `components/layout/CustomsPortalSidebar.tsx` | CustomsAgent sidebar component |
| `components/layout/PortAgentSidebar.tsx` | PortAgent sidebar component |
| `components/layout/CustomerPortalSidebar.tsx` | CustomerPortal sidebar — read-only self-service |
| `components/layout/AuditorSidebar.tsx` | AuditorReadOnly sidebar — full read, no write |
| `components/layout/DriverSidebar.tsx` | Mobile-first sidebar for Agent (driver agentType) |
| `services/authService.ts` | Login, role detection, dashboard redirect |
| `services/shipmentService.ts` | Shipment CRUD and stage transitions |
| `services/documentService.ts` | Document upload, download, and e-sign |
| `services/trackingService.ts` | Live GPS and carrier API tracking |
| `services/notificationService.ts` | Push, email, and in-app alert delivery |
