# LogisticPro — Frontend Data & Schema Analysis

> **Generated:** 2026-05-14  
> **Source:** Complete frontend codebase analysis  
> **Purpose:** Backend database schema blueprint extracted from UI/UX code, mock data, and type definitions

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Production-Grade Database Tables](#2-production-grade-database-tables)
   - [Multi-Tenancy & Organization](#21-multi-tenancy--organization)
   - [User & Access Management](#22-user--access-management)
   - [Logistics Masters](#23-logistics-masters)
   - [Operations — Bookings, Shipments, Orders](#24-operations--bookings-shipments-orders)
   - [Transport Assets — Fleet, Drivers, Warehouse](#25-transport-assets--fleet-drivers-warehouse)
   - [Finance & Billing](#26-finance--billing)
   - [Rates & Contracts](#27-rates--contracts)
   - [Compliance & Customs](#28-compliance--customs)
3. [Enum & Status Definitions](#3-enum--status-definitions)
4. [Role Hierarchy & Permissions Matrix](#4-role-hierarchy--permissions-matrix)
5. [Sidebar Menu Structure Per Role](#5-sidebar-menu-structure-per-role)
6. [Mock / Demo / Temporary Data](#6-mock--demo--temporary-data)
7. [Duplicate & Conflicting Data Structures](#7-duplicate--conflicting-data-structures)
8. [Reusable Entities & Relationships](#8-reusable-entities--relationships)
9. [API Service Layer Patterns](#9-api-service-layer-patterns)
10. [Dashboard Metrics & Analytics](#10-dashboard-metrics--analytics)

---

## 1. Architecture Overview

| Property | Value |
|---|---|
| **Framework** | Next.js 16 (App Router) + React 19 |
| **Language** | TypeScript |
| **State** | React Context (Auth, Notification) |
| **API Layer** | 14 service files with mock/real toggle via `APP_CONFIG.USE_MOCK` |
| **Tenancy** | Multi-tenant: Company > Organization > Department |
| **Roles** | 11 distinct user roles |
| **Auth** | Local mock auth service (username/password in mock data) |
| **Base URL** | `https://your-api-base-url.com/api/v1` |

### Data Flow

```
Pages/Components
    ↕ imports mock data OR calls service
Service Layer (14 services)
    ↕ USE_MOCK ? mockData : fetch(API_BASE_URL)
Mock Data Layer (data/mockData.ts)
    ↕ 20+ mock arrays, 30+ TypeScript interfaces
```

---

## 2. Production-Grade Database Tables

### 2.1 Multi-Tenancy & Organization

#### `companies` — Core Tenant Table

| Field | Type | Sample Value | Source |
|---|---|---|---|
| `id` | UUID / VARCHAR | `cmp-001` | `data/mockData.ts` |
| `name` | VARCHAR(255) | `TechLogistics India` | `data/mockData.ts` |
| `registration_type` | ENUM('self-service','admin-created') | `self-service` | `data/mockData.ts` |
| `registration_status` | ENUM('Draft','Submitted','Approved','Rejected') | `Approved` | `data/mockData.ts`, `companyService.ts` |
| `status` | ENUM('Active','Pending','Suspended','Inactive') | `Active` | `data/mockData.ts`, `companyService.ts` |
| `email` | VARCHAR(255) | `admin@techlogistics.com` | `data/mockData.ts` |
| `phone` | VARCHAR(50) | `+91 9876543210` | `data/mockData.ts` |
| `registered_address` | TEXT | `123 Business Park, MG Road` | `data/mockData.ts` |
| `city` | VARCHAR(100) | `Bangalore` | `data/mockData.ts` |
| `state` | VARCHAR(100) | `Karnataka` | `data/mockData.ts` |
| `pincode` | VARCHAR(20) | `560001` | `data/mockData.ts` |
| `country` | VARCHAR(100) | `India` | `data/mockData.ts` |
| `tax_id` | VARCHAR(100) | `TAX123456` | `data/mockData.ts` |
| `business_type` | ENUM('Freight','Express','Courier','Logistics','Mixed') | `Logistics` | `data/mockData.ts`, `companyService.ts` |
| `registration_date` | TIMESTAMP | `2024-06-15T00:00:00Z` | `data/mockData.ts` |
| `approval_date` | TIMESTAMP NULL | `2024-06-20T00:00:00Z` | `data/mockData.ts` |
| `approved_by` | UUID NULL (references users) | `usr-001` | `data/mockData.ts` |
| `logo` | VARCHAR(500) NULL | `null` | `data/mockData.ts` |
| `website` | VARCHAR(255) NULL | `https://techlogistics.com` | `data/mockData.ts` |
| `contact_person` | VARCHAR(255) | `Rajesh Kumar` | `data/mockData.ts` |
| `contact_phone` | VARCHAR(50) | `+91 9876543210` | `data/mockData.ts` |
| `max_organizations` | INTEGER | `5` | `data/mockData.ts` |
| `max_agents` | INTEGER | `50` | `data/mockData.ts` |
| `current_organizations` | INTEGER | `2` | `data/mockData.ts` |
| `current_agents` | INTEGER | `15` | `data/mockData.ts` |
| `billing_cycle` | ENUM('Monthly','Quarterly','Yearly') | `Monthly` | `data/mockData.ts`, `companyService.ts` |
| `plan` | ENUM('Starter','Professional','Enterprise') | `Professional` | `data/mockData.ts`, `companyService.ts` |
| `created_at` | TIMESTAMP | `2024-06-15T00:00:00Z` | `data/mockData.ts` |
| `updated_at` | TIMESTAMP | `2024-06-20T00:00:00Z` | `data/mockData.ts` |

**References:** `data/mockData.ts:22-53`, `services/companyService.ts`, `components/shared/StatusBadge.tsx`, `app/admin/org/companies/page.tsx`

#### `company_documents` — Company Document Uploads

| Field | Type | Sample |
|---|---|---|
| `id` | UUID | — |
| `company_id` | UUID FK → companies | `cmp-001` |
| `type` | VARCHAR(50) | `registration`, `tax` |
| `url` | VARCHAR(500) | `/docs/reg-001.pdf` |
| `verified` | BOOLEAN | `true` |
| `uploaded_at` | TIMESTAMP | `2024-06-15T00:00:00Z` |

#### `subscription_plans` (from Super Admin UI)

| Field | Type | Source |
|---|---|---|
| `id` | UUID | `app/admin/org/subscription-plans/page.tsx` |
| `name` | VARCHAR(100) | Plan name |
| `tier` | ENUM('Starter','Professional','Enterprise') | 'Starter' |
| `price` | DECIMAL(10,2) | — |
| `max_organizations` | INTEGER | — |
| `max_agents` | INTEGER | — |
| `features` | JSONB | Feature list |

**Note:** Referenced in Super Admin menu `data/super-admin-menu.ts:74`. No explicit type — only UI route exists.

#### `organizations` — Company Sub-Entities

| Field | Type | Sample Value | Source |
|---|---|---|---|
| `id` | UUID | `org-001` | `data/mockData.ts` |
| `company_id` | UUID FK → companies | `cmp-001` | `data/mockData.ts` |
| `name` | VARCHAR(255) | `Bangalore Regional Office` | `data/mockData.ts` |
| `type` | ENUM('Regional','Department','Branch','Division') | `Regional` | `data/mockData.ts` |
| `status` | ENUM('Active','Pending','Suspended','Inactive') | `Active` | `data/mockData.ts` |
| `parent_organization_id` | UUID NULL FK → organizations | `null` | `data/mockData.ts` |
| `address` | TEXT | `123 Business Park, MG Road` | `data/mockData.ts` |
| `city` | VARCHAR(100) | `Bangalore` | `data/mockData.ts` |
| `state` | VARCHAR(100) | `Karnataka` | `data/mockData.ts` |
| `pincode` | VARCHAR(20) | `560001` | `data/mockData.ts` |
| `manager_id` | UUID FK → users | `usr-002` | `data/mockData.ts` |
| `agent_count` | INTEGER | `8` | `data/mockData.ts` |
| `created_at` | TIMESTAMP | `2024-06-20T00:00:00Z` | `data/mockData.ts` |
| `updated_at` | TIMESTAMP | `2024-06-20T00:00:00Z` | `data/mockData.ts` |

**References:** `data/mockData.ts:55-70`, `services/organizationService.ts`, `app/admin/org/organizations/page.tsx`

#### `company_types` (from Super Admin UI)

| Field | Type | Source |
|---|---|---|
| `id` | UUID | `app/admin/org/company-types/page.tsx` |
| `name` | VARCHAR(100) | — |
| `description` | TEXT | — |
| `category` | VARCHAR(50) | — |

**Note:** Referenced in Super Admin menu. Route exists but types not defined in mock data file.

---

### 2.2 User & Access Management

#### `users` — Unified User Table (All Roles)

| Field | Type | Sample Value | Source |
|---|---|---|---|
| `id` | UUID | `usr-001` | `data/mockData.ts` |
| `name` | VARCHAR(255) | `Rajesh Kumar` | `data/mockData.ts` |
| `username` | VARCHAR(100) UNIQUE | `superadmin` | `data/mockData.ts`, `authService.ts` |
| `password` | VARCHAR(255) | `admin123` | `data/mockData.ts` (hashed in production) |
| `email` | VARCHAR(255) | `rajesh.kumar@logisticspro.com` | `data/mockData.ts` |
| `phone` | VARCHAR(50) | `+91 98765 43210` | `data/mockData.ts` |
| `role` | ENUM(see Roles section) | `SuperAdmin` | `data/mockData.ts` |
| `agent_type` | ENUM('warehouse','driver','finance') NULL | `null` | `data/mockData.ts` |
| `status` | ENUM('Active','Inactive') | `Active` | `data/mockData.ts` |
| `company_id` | UUID NULL FK → companies | `null` | `data/mockData.ts` |
| `organization_id` | UUID NULL FK → organizations | `null` | `data/mockData.ts` |
| `agent_id` | UUID NULL FK → agents | `null` | `data/mockData.ts` |
| `avatar` | VARCHAR(10) | `RK` | `data/mockData.ts` |
| `dashboard_route` | VARCHAR(255) | `/admin/dashboard` | `data/mockData.ts`, `ROLE_DASHBOARD_MAP` |
| `menu_access` | TEXT[] / JSONB | `['/admin/dashboard','/admin/org/companies',...]` | `data/mockData.ts`, `ROLE_MENU_ACCESS` |
| `last_login` | TIMESTAMP | `2025-01-15T09:30:00Z` | `data/mockData.ts` |
| `created_at` | TIMESTAMP | `2024-01-01T00:00:00Z` | `data/mockData.ts` |

**References:** `data/mockData.ts:538-558`, `services/authService.ts`, `services/userService.ts`, `context/AuthContext.tsx`, `utils/permissions.ts`

#### `login_activity` — Audit Trail

| Field | Type | Source |
|---|---|---|
| `id` | UUID | `app/admin/users/login-activity/page.tsx` |
| `user_id` | UUID FK → users | — |
| `ip_address` | VARCHAR(45) | — |
| `user_agent` | TEXT | — |
| `login_at` | TIMESTAMP | — |
| `status` | ENUM('Success','Failed') | — |

#### `roles` — Role Definitions

Frontend defines 11 roles statically in `data/mockData.ts`. See [Section 4](#4-role-hierarchy--permissions-matrix) for full details.

| Field | Type | Sample |
|---|---|---|
| `id` | UUID | — |
| `name` | ENUM (11 roles) | `SuperAdmin` |
| `description` | VARCHAR(255) | `Full platform access` |
| `scope` | ENUM('platform','company','organization') | `platform` |
| `is_system_role` | BOOLEAN | `true` |
| `created_at` | TIMESTAMP | — |

**Source:** `app/admin/users/roles/page.tsx:61-77` (`ROLE_META`), `data/mockData.ts:6-9`

#### `permissions` — Granular Module Permissions

| Field | Type | Sample | Source |
|---|---|---|---|
| `role_id` | UUID FK → roles | `SuperAdmin` | `data/permissions-matrix.ts` |
| `module` | VARCHAR(50) | `companies` | `data/permissions-matrix.ts:252-270` |
| `can_view` | BOOLEAN | `true` | `data/permissions-matrix.ts` |
| `can_create` | BOOLEAN | `true` | `data/permissions-matrix.ts` |
| `can_edit` | BOOLEAN | `true` | `data/permissions-matrix.ts` |
| `can_delete` | BOOLEAN | `true` | `data/permissions-matrix.ts` |
| `can_export` | BOOLEAN | `true` | `data/permissions-matrix.ts` |
| `can_import` | BOOLEAN | `false` | `data/permissions-matrix.ts` |

**17 Modules:** companies, organizations, agents, transport, dashboard, shipments, orders, fleet, drivers, dispatch, warehouse, customers, finance, reports, users, settings, notifications

**Note:** There are **two separate permission systems** in the frontend — see [Section 7](#7-duplicate--conflicting-data-structures).

---

### 2.3 Logistics Masters

#### `transport_types`

| Field | Type | Sample | Source |
|---|---|---|---|
| `id` | UUID | `tt-001` | `data/mockData.ts` |
| `company_id` | UUID FK → companies | `cmp-001` | `data/mockData.ts` |
| `name` | ENUM('Land','Air','Water') | `Land` | `data/mockData.ts` |
| `status` | ENUM('Active','Inactive') | `Active` | `data/mockData.ts` |
| `created_at` | TIMESTAMP | — | `data/mockData.ts` |

**Reference:** `data/mockData.ts:72-78`

#### `transport_categories`

| Field | Type | Sample | Source |
|---|---|---|---|
| `id` | UUID | `tc-001` | `data/mockData.ts` |
| `company_id` | UUID FK → companies | `cmp-001` | `data/mockData.ts` |
| `transport_type_id` | UUID FK → transport_types | `tt-001` | `data/mockData.ts` |
| `name` | VARCHAR(255) | `Heavy Truck` | `data/mockData.ts` |
| `description` | TEXT | `Large cargo trucks...` | `data/mockData.ts` |
| `specifications` | JSONB | `{"axles":3,"length":"20m"}` | `data/mockData.ts` |
| `capacity` | DECIMAL(10,2) | `25000` | `data/mockData.ts` |
| `capacity_unit` | ENUM('kg','cubic_meters','tons','units') | `kg` | `data/mockData.ts` |
| `max_speed` | DECIMAL NULL | `100` | `data/mockData.ts` |
| `fuel_type` | VARCHAR(50) NULL | `Diesel` | `data/mockData.ts` |
| `created_at` | TIMESTAMP | — | `data/mockData.ts` |

**Reference:** `data/mockData.ts:80-92`

#### `transport_items`

| Field | Type | Sample | Source |
|---|---|---|---|
| `id` | UUID | `ti-001` | `data/mockData.ts` |
| `company_id` | UUID FK → companies | `cmp-001` | `data/mockData.ts` |
| `category_id` | UUID FK → transport_categories | `tc-001` | `data/mockData.ts` |
| `name` | VARCHAR(255) | `Tire Set` | `data/mockData.ts` |
| `description` | TEXT | `Set of 10 truck tires...` | `data/mockData.ts` |
| `quantity` | INTEGER | `50` | `data/mockData.ts` |
| `unit` | VARCHAR(50) | `set` | `data/mockData.ts` |
| `specification` | JSONB | `{"brand":"Bridgestone"}` | `data/mockData.ts` |
| `price` | DECIMAL(10,2) | `15000` | `data/mockData.ts` |
| `created_at` | TIMESTAMP | — | `data/mockData.ts` |

**Reference:** `data/mockData.ts:94-105`

#### `carriers` (from Super Admin UI)

| Field | Type | Source |
|---|---|---|
| `id` | UUID | `app/admin/logistics/carriers/page.tsx` |
| `name` | VARCHAR(255) | — |
| `code` | VARCHAR(50) | — |
| `mode` | ENUM('Land','Air','Water') | — |
| `status` | ENUM('Active','Inactive') | — |
| `contact` | VARCHAR(255) | — |
| `rating` | DECIMAL(2,1) | — |

#### `ports` (from Super Admin UI)

| Field | Type | Source |
|---|---|---|
| `id` | UUID | `app/admin/logistics/ports/page.tsx` |
| `name` | VARCHAR(255) | — |
| `code` | VARCHAR(10) | — |
| `type` | ENUM('Seaport','River Port','Dry Port','Yacht Port') | `app/admin/logistics/ports/page.tsx:112` |
| `status` | ENUM('Active','Inactive','Under Maintenance') | `app/admin/logistics/ports/page.tsx:119` |
| `country` | VARCHAR(100) | — |
| `city` | VARCHAR(100) | — |
| `capacity` | INTEGER | — |

#### `airports` (from Super Admin UI)

| Field | Type | Source |
|---|---|---|
| `id` | UUID | `app/admin/logistics/airports/page.tsx` |
| `name` | VARCHAR(255) | — |
| `code` (IATA) | VARCHAR(10) | — |
| `code` (ICAO) | VARCHAR(10) | — |
| `city` | VARCHAR(100) | — |
| `country` | VARCHAR(100) | — |
| `status` | ENUM('Active','Inactive') | — |

#### `incoterms` (from Super Admin UI)

| Field | Type | Source |
|---|---|---|
| `code` | VARCHAR(10) PK | `EXW`, `FOB`, `CIF`, `DDP` |
| `name` | VARCHAR(255) | — |
| `group` | ENUM('E','F','C','D') | `app/admin/logistics/incoterms/page.tsx:214` |
| `description` | TEXT | — |
| `seller_obligation` | ENUM('Minimal','Partial','Major','Full') | `app/admin/logistics/incoterms/page.tsx:194` |
| `transport_scope` | ENUM('Any','Water Only') | — |

#### `container_types` (from Super Admin UI)

| Field | Type | Source |
|---|---|---|
| `id` | UUID | `app/admin/logistics/container-types/page.tsx` |
| `code` | VARCHAR(20) | `20GP`, `40GP`, `40HC`, `45HC`, `20RF`, `40RF` |
| `type` | ENUM('Standard','High Cube','Refrigerated','Open Top','Flat Rack','Tank') | — |
| `length` | DECIMAL | — |
| `width` | DECIMAL | — |
| `height` | DECIMAL | — |
| `max_weight` | DECIMAL | — |
| `capacity` | DECIMAL | — |

**Cargo types referenced:** `app/admin/ops/container-tracking/page.tsx:51` — CRUDE, LNG, LPG, CHEMICAL, DRY_BULK

#### `transport_modes` (from Super Admin UI)

| Field | Type | Source |
|---|---|---|
| `id` | UUID | `app/admin/logistics/transport-modes/page.tsx` |
| `name` | VARCHAR(100) | — |
| `category` | ENUM('Land','Air','Water','Rail','Multimodal','Last-Mile') | `role-based-sidebar-menu2.md` |

---

### 2.4 Operations — Bookings, Shipments, Orders

#### `bookings` — Company Admin Bookings

Used across: `app/company/bookings/page.tsx`, `app/admin/bookings/page.tsx`, `app/company/bookings/requests/page.tsx`

| Field | Type | Sample | Source |
|---|---|---|---|
| `id` | UUID | `BKG-2025-001` | `app/company/bookings/page.tsx` |
| `booking_number` | VARCHAR(50) | `BKG-2025-001` | `app/company/bookings/page.tsx` |
| `customer` | VARCHAR(255) | `Tech Solutions Pvt Ltd` | `app/company/bookings/page.tsx` |
| `service_type` | ENUM('Express','Standard','Freight') | `Express` | `mockData.ts`, all booking pages |
| `mode` | ENUM('Road','Air','Sea','Rail') | `Road` | `app/company/bookings/page.tsx` |
| `origin` | VARCHAR(255) | `Bangalore, India` | `app/company/bookings/page.tsx` |
| `destination` | VARCHAR(255) | `Mumbai, India` | `app/company/bookings/page.tsx` |
| `weight` | DECIMAL(10,2) | `450` | `app/company/bookings/page.tsx` |
| `dimensions` | VARCHAR(50) | `120x80x60` | `app/company/bookings/page.tsx` |
| `status` | ENUM(BookingStatus) | `Confirmed` | see [Section 3](#3-enum--status-definitions) |
| `priority` | ENUM('High','Medium','Low') | `High` | `app/company/bookings/page.tsx` |
| `estimated_delivery` | DATE | `2025-01-18` | `app/company/bookings/page.tsx` |
| `actual_delivery` | DATE NULL | `null` | `app/company/bookings/page.tsx` |
| `price` | DECIMAL(10,2) | `48500` | `app/company/bookings/page.tsx` |
| `currency` | VARCHAR(10) | `INR` | `app/company/bookings/page.tsx` |
| `carrier` | VARCHAR(255) | `BlueDart Freight` | `app/company/bookings/page.tsx` |
| `tracking_number` | VARCHAR(100) | `TRK-BD-001` | `app/company/bookings/page.tsx` |
| `created_at` | TIMESTAMP | `2025-01-08` | `app/company/bookings/page.tsx` |
| `created_by` | UUID FK → users | `user-001` | `app/company/bookings/page.tsx` |

**Booking Requests** (`app/company/bookings/requests/page.tsx`):
- Additional fields: `requested_date`, `required_by`, `notes`
- Statuses: `Pending`, `Approved`, `Rejected`

#### `shipments` — Core Shipment Entity (Bounded Context)

| Field | Type | Sample | Source |
|---|---|---|---|
| `id` | UUID | `shp-001` | `data/mockData.ts` |
| `tracking_number` | VARCHAR(100) | `LOG-2025-10001` | `data/mockData.ts` |
| `sender_name` | VARCHAR(255) | `Tech Solutions Pvt Ltd` | `data/mockData.ts` |
| `sender_phone` | VARCHAR(50) | `+91 9876543210` | `data/mockData.ts` |
| `sender_email` | VARCHAR(255) | `sender@company.com` | `data/mockData.ts` |
| `receiver_name` | VARCHAR(255) | `Sharma & Sons` | `data/mockData.ts` |
| `receiver_phone` | VARCHAR(50) | `+91 9876543211` | `data/mockData.ts` |
| `receiver_email` | VARCHAR(255) | `receiver@business.com` | `data/mockData.ts` |
| `pickup_address` | TEXT | `123 MG Road, Mumbai` | `data/mockData.ts` |
| `delivery_address` | TEXT | `456 Brigade, Bangalore` | `data/mockData.ts` |
| `package_weight` | DECIMAL(10,2) | `25` | `data/mockData.ts` |
| `package_dimensions` | VARCHAR(50) | `30x20x15 cm` | `data/mockData.ts` |
| `package_type` | VARCHAR(50) | `Box` | `data/mockData.ts` |
| `service_type` | ENUM('Express','Standard','Freight') | `Express` | `data/mockData.ts` |
| `status` | ENUM(ShipmentStatus) | `In Transit` | see [Section 3](#3-enum--status-definitions) |
| `assigned_driver` | UUID NULL FK → drivers | `drv-001` | `data/mockData.ts` |
| `assigned_vehicle` | UUID NULL FK → vehicles | `veh-001` | `data/mockData.ts` |
| `estimated_delivery` | TIMESTAMP | `2025-01-18` | `data/mockData.ts` |
| `actual_delivery` | TIMESTAMP NULL | `2025-01-17` | `data/mockData.ts` |
| `created_at` | TIMESTAMP | `2025-01-01` | `data/mockData.ts` |
| `updated_at` | TIMESTAMP | — | `data/mockData.ts` |
| `notes` | TEXT | `Handle with care` | `data/mockData.ts` |
| `proof_of_delivery` | VARCHAR(500) NULL | `/pod/signature.png` | `data/mockData.ts` |

#### `shipment_timeline` — Shipment Status History

| Field | Type | Sample | Source |
|---|---|---|---|
| `id` | UUID | — | `data/mockData.ts` |
| `shipment_id` | UUID FK → shipments | `shp-001` | `data/mockData.ts` |
| `status` | VARCHAR(50) | `Order Created` | `data/mockData.ts` |
| `timestamp` | TIMESTAMP | `2025-01-01T10:00:00Z` | `data/mockData.ts` |
| `location` | VARCHAR(255) | `System` | `data/mockData.ts` |
| `notes` | TEXT | `Shipment order created` | `data/mockData.ts` |

#### `orders` — Customer Orders

| Field | Type | Sample | Source |
|---|---|---|---|
| `id` | UUID | `ord-001` | `data/mockData.ts` |
| `order_id` | VARCHAR(50) | `ORD-2025-01001` | `data/mockData.ts` |
| `customer_id` | UUID FK → customers | `cust-001` | `data/mockData.ts` |
| `customer_name` | VARCHAR(255) | `Tech Solutions` | `data/mockData.ts` |
| `total_amount` | DECIMAL(10,2) | `45000` | `data/mockData.ts` |
| `status` | ENUM(OrderStatus) | `Confirmed` | see [Section 3](#3-enum--status-definitions) |
| `payment_status` | ENUM(PaymentStatus) | `Paid` | see [Section 3](#3-enum--status-definitions) |
| `shipment_id` | UUID NULL FK → shipments | `shp-001` | `data/mockData.ts` |
| `created_at` | TIMESTAMP | — | `data/mockData.ts` |
| `updated_at` | TIMESTAMP | — | `data/mockData.ts` |

#### `order_items`

| Field | Type | Sample |
|---|---|---|
| `id` | UUID | — |
| `order_id` | UUID FK → orders | — |
| `name` | VARCHAR(255) | `Laptop` |
| `quantity` | INTEGER | `2` |
| `price` | DECIMAL(10,2) | `15000` |

---

### 2.5 Transport Assets — Fleet, Drivers, Warehouse

#### `vehicles` — Land Transport (Full Model)

| Field | Type | Sample | Source |
|---|---|---|---|
| `id` | UUID | `veh-001` | `data/mockData.ts` |
| `company_id` | UUID FK → companies | `cmp-001` | `data/mockData.ts` |
| `organization_id` | UUID NULL FK → organizations | `org-001` | `data/mockData.ts` |
| `category_id` | UUID FK → transport_categories | `tc-001` | `data/mockData.ts` |
| `registration_number` | VARCHAR(50) | `MH 12 AB 1234` | `data/mockData.ts` |
| `chassis_number` | VARCHAR(100) | `TATA123456789ABC` | `data/mockData.ts` |
| `engine_number` | VARCHAR(100) | `TEM789123456` | `data/mockData.ts` |
| `make` | VARCHAR(100) | `Tata` | `data/mockData.ts` |
| `model` | VARCHAR(100) | `407` | `data/mockData.ts` |
| `year` | INTEGER | `2020` | `data/mockData.ts` |
| `color` | VARCHAR(50) | `White` | `data/mockData.ts` |
| `fuel_type` | ENUM('Petrol','Diesel','CNG','Electric') | `Diesel` | `data/mockData.ts` |
| `capacity` | DECIMAL(10,2) | `3000` | `data/mockData.ts` |
| `capacity_unit` | ENUM('kg','liters','cubic_meters') | `kg` | `data/mockData.ts` |
| `status` | ENUM(VehicleStatus) | `Available` | see [Section 3](#3-enum--status-definitions) |
| `owner` | VARCHAR(255) | `TechLogistics India` | `data/mockData.ts` |
| `insurance_number` | VARCHAR(100) | `INS123456` | `data/mockData.ts` |
| `insurance_expiry` | DATE | `2025-12-31` | `data/mockData.ts` |
| `pollution_certificate` | VARCHAR(100) | `PC789456` | `data/mockData.ts` |
| `pollution_expiry` | DATE | `2025-06-30` | `data/mockData.ts` |
| `current_driver` | UUID NULL FK → drivers | `drv-001` | `data/mockData.ts` |
| `total_distance` | DECIMAL(10,2) | `145000` | `data/mockData.ts` |
| `last_service_date` | DATE | `2024-12-15` | `data/mockData.ts` |
| `next_service_due` | DATE | `2025-03-15` | `data/mockData.ts` |
| `purchase_date` | DATE | `2020-06-10` | `data/mockData.ts` |
| `created_at` | TIMESTAMP | — | `data/mockData.ts` |
| `updated_at` | TIMESTAMP | — | `data/mockData.ts` |

**Simplified Fleet Model** (used in dashboards): `data/mockData.ts:454-466`

**Vehicle types:** `Truck`, `Van`, `Bike`, `Tempo` (from `mockData.ts:457`)

**References:** `data/mockData.ts:110-140` (full), `data/mockData.ts:454-466` (simplified), `services/fleetService.ts`, `app/admin/ops/fleet-monitoring/page.tsx`

#### `maintenance_records`

| Field | Type | Sample | Source |
|---|---|---|---|
| `id` | UUID | `mtn-001` | `data/mockData.ts` |
| `vehicle_id` | UUID FK → vehicles | `veh-001` | `data/mockData.ts` |
| `date` | DATE | `2024-12-15` | `data/mockData.ts` |
| `type` | ENUM('Regular','Repair','Emergency') | `Regular` | `data/mockData.ts` |
| `description` | TEXT | `Oil change and brake check` | `data/mockData.ts` |
| `cost` | DECIMAL(10,2) | `5000` | `data/mockData.ts` |
| `next_due_date` | DATE | `2025-03-15` | `data/mockData.ts` |
| `performed_by` | VARCHAR(255) | `Workshop A` | `data/mockData.ts` |

#### `fuel_records`

| Field | Type | Sample | Source |
|---|---|---|---|
| `id` | UUID | `fl-001` | `data/mockData.ts` |
| `vehicle_id` | UUID FK → vehicles | `veh-001` | `data/mockData.ts` |
| `date` | DATE | `2025-01-14` | `data/mockData.ts` |
| `quantity` | DECIMAL(10,2) | `80` | `data/mockData.ts` |
| `cost` | DECIMAL(10,2) | `7200` | `data/mockData.ts` |
| `odometer` | INTEGER | `145000` | `data/mockData.ts` |
| `fuel_type` | VARCHAR(50) | `Diesel` | `data/mockData.ts` |
| `location` | VARCHAR(255) | `Mumbai Fuel Station` | `data/mockData.ts` |

#### `aircraft` — Air Transport

| Field | Type | Sample | Source |
|---|---|---|---|
| `id` | UUID | `air-001` | `data/mockData.ts` |
| `company_id` | UUID FK → companies | `cmp-001` | `data/mockData.ts` |
| `organization_id` | UUID NULL | `org-001` | `data/mockData.ts` |
| `category_id` | UUID | `ac-001` | `data/mockData.ts` |
| `registration_number` | VARCHAR(50) | `VT-ABC` | `data/mockData.ts` |
| `manufacturer` | VARCHAR(100) | `Boeing` | `data/mockData.ts` |
| `model` | VARCHAR(100) | `737 Freighter` | `data/mockData.ts` |
| `manufacture_year` | INTEGER | `2015` | `data/mockData.ts` |
| `serial_number` | VARCHAR(100) | `BB737F001` | `data/mockData.ts` |
| `capacity` | DECIMAL(10,2) | `25000` | `data/mockData.ts` |
| `capacity_unit` | ENUM('kg','cubic_meters') | `kg` | `data/mockData.ts` |
| `max_flight_hours` | INTEGER | `75000` | `data/mockData.ts` |
| `current_flight_hours` | INTEGER | `45230` | `data/mockData.ts` |
| `max_altitude` | INTEGER | `43000` | `data/mockData.ts` |
| `cruise_speed` | INTEGER | `500` | `data/mockData.ts` |
| `range` | INTEGER | `5400` | `data/mockData.ts` |
| `fuel_capacity` | DECIMAL(10,2) | `26730` | `data/mockData.ts` |
| `status` | ENUM('Available','On Route','Maintenance','Grounded') | `Available` | `data/mockData.ts` |
| `airworthiness_expiry` | DATE | `2025-12-31` | `data/mockData.ts` |
| `last_inspection` | DATE | `2024-11-15` | `data/mockData.ts` |
| `next_inspection_due` | DATE | `2025-05-15` | `data/mockData.ts` |
| `crew` | JSONB | `{"pilotId":"crew-001",...}` | `data/mockData.ts` |

**Reference:** `data/mockData.ts:167-197`

#### `ships` — Water Transport

| Field | Type | Sample | Source |
|---|---|---|---|
| `id` | UUID | `ship-001` | `data/mockData.ts` |
| `company_id` | UUID FK → companies | `cmp-001` | `data/mockData.ts` |
| `vessel_name` | VARCHAR(255) | `TechCargo Express` | `data/mockData.ts` |
| `imo_number` | VARCHAR(50) | `9876543` | `data/mockData.ts` |
| `call_sign` | VARCHAR(20) | `TCEX` | `data/mockData.ts` |
| `flag` | VARCHAR(100) | `India` | `data/mockData.ts` |
| `gross_tonnage` | DECIMAL(10,2) | `50000` | `data/mockData.ts` |
| `dead_weight_tonnage` | DECIMAL(10,2) | `65000` | `data/mockData.ts` |
| `length` | DECIMAL(10,2) | `225` | `data/mockData.ts` |
| `breadth` | DECIMAL(10,2) | `32` | `data/mockData.ts` |
| `container_capacity` | INTEGER | `3500` | `data/mockData.ts` |
| `speed` | DECIMAL(5,2) | `22` | `data/mockData.ts` |
| `status` | ENUM('Active','Inactive','Maintenance','Docked','Decommissioned') | `Active` | `data/mockData.ts` |
| `current_location` | JSONB | `{"lat":19.076,"lng":72.877}` | `data/mockData.ts` |

**Reference:** `data/mockData.ts:214-256`

#### `drivers`

| Field | Type | Sample | Source |
|---|---|---|---|
| `id` | UUID | `drv-001` | `data/mockData.ts` |
| `driver_id` | VARCHAR(50) | `DRV-001` | `data/mockData.ts` |
| `name` | VARCHAR(255) | `Ramesh Kumar` | `data/mockData.ts` |
| `phone` | VARCHAR(50) | `+91 9876543210` | `data/mockData.ts` |
| `email` | VARCHAR(255) | `ramesh.kumar@logisticspro.com` | `data/mockData.ts` |
| `license_number` | VARCHAR(100) | `DL12345678` | `data/mockData.ts` |
| `vehicle_assigned` | UUID NULL FK → vehicles | `veh-001` | `data/mockData.ts` |
| `status` | ENUM(DriverStatus) | `Active` | see [Section 3](#3-enum--status-definitions) |
| `rating` | DECIMAL(2,1) | `4.5` | `data/mockData.ts` |
| `total_trips` | INTEGER | `350` | `data/mockData.ts` |
| `join_date` | DATE | `2022-06-15` | `data/mockData.ts` |

**Reference:** `data/mockData.ts:468-482`, `services/driverService.ts`

#### `warehouses`

| Field | Type | Sample | Source |
|---|---|---|---|
| `id` | UUID | `wh-001` | `data/mockData.ts` |
| `warehouse_id` | VARCHAR(50) | `WH-MUM-001` | `data/mockData.ts` |
| `name` | VARCHAR(255) | `Mumbai Central Hub` | `data/mockData.ts` |
| `location` | TEXT | `Plot 45, MIDC...` | `data/mockData.ts` |
| `city` | VARCHAR(100) | `Mumbai` | `data/mockData.ts` |
| `capacity` | INTEGER | `50000` | `data/mockData.ts` |
| `current_stock` | INTEGER | `35000` | `data/mockData.ts` |
| `manager` | VARCHAR(255) | `Arun Mehta` | `data/mockData.ts` |
| `contact` | VARCHAR(50) | `+91 9876543210` | `data/mockData.ts` |

**Reference:** `data/mockData.ts:484-497`, `services/warehouseService.ts`

#### `warehouse_inventory`

| Field | Type | Sample |
|---|---|---|
| `sku` | VARCHAR(100) | `SKU-MUM-0001` |
| `warehouse_id` | UUID FK → warehouses | `wh-001` |
| `product_name` | VARCHAR(255) | `Electronics Box` |
| `category` | VARCHAR(100) | `Electronics` |
| `quantity` | INTEGER | `350` |
| `location` | VARCHAR(100) | `Rack A-12` |
| `last_updated` | TIMESTAMP | — |

#### `warehouse_logs` (Inbound/Outbound)

| Field | Type | Sample |
|---|---|---|
| `id` | UUID | — |
| `warehouse_id` | UUID FK → warehouses | `wh-001` |
| `type` | ENUM('inbound','outbound') | `inbound` |
| `date` | DATE | `2025-01-14` |
| `items_count` | INTEGER | `500` |
| `reference` | VARCHAR(255) | `Delhi Hub` or destination |

#### `cargo` — Shipment-Level Cargo (Multi-Modal)

| Field | Type | Sample | Source |
|---|---|---|---|
| `id` | UUID | `cargo-001` | `data/mockData.ts` |
| `company_id` | UUID FK → companies | `cmp-001` | `data/mockData.ts` |
| `organization_id` | UUID NULL | `org-001` | `data/mockData.ts` |
| `cargo_number` | VARCHAR(50) | `CARGO-2025-001` | `data/mockData.ts` |
| `description` | TEXT | `Electronics Export` | `data/mockData.ts` |
| `weight` | DECIMAL(10,2) | `15000` | `data/mockData.ts` |
| `weight_unit` | ENUM('kg','tons','lbs') | `kg` | `data/mockData.ts` |
| `volume` | DECIMAL(10,2) | `25` | `data/mockData.ts` |
| `volume_unit` | ENUM('cubic_meters','cubic_feet') | `cubic_meters` | `data/mockData.ts` |
| `type` | ENUM('General','Hazmat','Perishable','Fragile','Temperature Controlled') | `General` | `data/mockData.ts` |
| `package_count` | INTEGER | `250` | `data/mockData.ts` |
| `transport_mode` | ENUM('Land','Air','Water') | `Water` | `data/mockData.ts` |
| `status` | ENUM('Pending','Loaded','In Transit','Delivered','Damaged','Lost') | `In Transit` | `data/mockData.ts` |
| `insurance_amount` | DECIMAL(12,2) | `5000000` | `data/mockData.ts` |
| `insurance_provider` | VARCHAR(255) | `Global Insurance Corp` | `data/mockData.ts` |

**Reference:** `data/mockData.ts:288-325`

#### `cargo_items` — Contents Manifest

| Field | Type | Sample |
|---|---|---|
| `id` | UUID | `ci-001` |
| `cargo_id` | UUID FK → cargo | `cargo-001` |
| `description` | VARCHAR(255) | `Laptop Computers` |
| `quantity` | INTEGER | `100` |
| `unit` | VARCHAR(50) | `units` |
| `weight` | DECIMAL(10,2) | `10000` |
| `hs_code` | VARCHAR(20) | `8471.30` |
| `hazmat_class` | VARCHAR(50) NULL | `null` |
| `estimated_value` | DECIMAL(12,2) | `3000000` |

#### `shipment_legs` — Multi-Modal Route Segments

| Field | Type | Sample |
|---|---|---|
| `id` | UUID | `leg-001` |
| `cargo_id` | UUID FK → cargo | `cargo-001` |
| `leg_number` | INTEGER | `1` |
| `origin` | VARCHAR(255) | `Bangalore` |
| `destination` | VARCHAR(255) | `Mumbai Port` |
| `transport_type` | ENUM('Land','Air','Water') | `Land` |
| `vehicle_id` | UUID NULL | `veh-001` |
| `aircraft_id` | UUID NULL | `null` |
| `ship_id` | UUID NULL | `null` |
| `driver_id` | UUID NULL | `drv-001` |
| `departure_date` | TIMESTAMP | `2025-01-10` |
| `estimated_arrival` | TIMESTAMP | `2025-01-12` |
| `actual_arrival` | TIMESTAMP NULL | `2025-01-12` |
| `status` | ENUM('Scheduled','In Transit','Completed','Delayed','Cancelled') | `Completed` |

---

### 2.6 Finance & Billing

#### `invoices`

| Field | Type | Sample | Source |
|---|---|---|---|
| `id` | UUID | `inv-001` | `data/mockData.ts` |
| `invoice_id` | VARCHAR(50) | `INV-2025-01001` | `data/mockData.ts` |
| `customer_id` | UUID FK → customers | `cust-001` | `data/mockData.ts` |
| `customer_name` | VARCHAR(255) | `Tech Solutions` | `data/mockData.ts` |
| `shipment_id` | UUID NULL FK → shipments | `shp-001` | `data/mockData.ts` |
| `order_id` | UUID NULL FK → orders | `ord-001` | `data/mockData.ts` |
| `amount` | DECIMAL(10,2) | `12500` | `data/mockData.ts` |
| `status` | ENUM(InvoiceStatus) | `Unpaid` | see [Section 3](#3-enum--status-definitions) |
| `due_date` | DATE | `2025-01-30` | `data/mockData.ts` |
| `paid_date` | DATE NULL | `2025-01-25` | `data/mockData.ts` |
| `created_at` | TIMESTAMP | `2025-01-15` | `data/mockData.ts` |

**Reference:** `data/mockData.ts:523-536`, `services/financeService.ts`

#### `invoice_items`

| Field | Type | Sample |
|---|---|---|
| `id` | UUID | — |
| `invoice_id` | UUID FK → invoices | `inv-001` |
| `description` | VARCHAR(255) | `Express Delivery Charge` |
| `quantity` | INTEGER | `2` |
| `rate` | DECIMAL(10,2) | `1500` |
| `amount` | DECIMAL(10,2) | `3000` |

#### `expenses` (from Company Admin Pages)

| Field | Type | Sample | Source |
|---|---|---|---|
| `id` | VARCHAR(50) | `EXP-001` | `CompanyAdminPages.tsx:149-155` |
| `category` | VARCHAR(100) | `Fuel` | `CompanyAdminPages.tsx` |
| `vendor` | VARCHAR(255) | `Mumbai Fuel Station` | `CompanyAdminPages.tsx` |
| `amount` | DECIMAL(10,2) | `7200` | `CompanyAdminPages.tsx` |
| `status` | ENUM('Paid','Unpaid') | `Paid` | `CompanyAdminPages.tsx` |
| `date` | DATE | `2025-01-14` | `CompanyAdminPages.tsx` |

---

### 2.7 Rates & Contracts

#### `rate_cards`

Used in: `app/company/rates/cards/page.tsx`, `app/admin/rates/cards/page.tsx`

| Field | Type | Sample | Source |
|---|---|---|---|
| `id` | UUID | `rate-001` | `app/company/rates/cards/page.tsx` |
| `name` | VARCHAR(255) | `Express Domestic - BLR to MUM` | `app/company/rates/cards/page.tsx` |
| `code` | VARCHAR(50) | `EXP-DOM-001` | `app/company/rates/cards/page.tsx` |
| `service_type` | ENUM('Express','Standard','Freight') | `Express` | `app/company/rates/cards/page.tsx` |
| `mode` | ENUM('Road','Air','Sea','Rail') | `Road` | `app/company/rates/cards/page.tsx` |
| `origin` | VARCHAR(255) | `Bangalore` | `app/company/rates/cards/page.tsx` |
| `destination` | VARCHAR(255) | `Mumbai` | `app/company/rates/cards/page.tsx` |
| `base_rate` | DECIMAL(10,2) | `42.00` | `app/company/rates/cards/page.tsx` |
| `rate_per_kg` | DECIMAL(10,2) | `2.25` | `app/company/rates/cards/page.tsx` |
| `min_weight` | DECIMAL(10,2) | `0.5` | `app/company/rates/cards/page.tsx` |
| `max_weight` | DECIMAL(10,2) | `50` | `app/company/rates/cards/page.tsx` |
| `delivery_time` | VARCHAR(50) | `24 hours` | `app/company/rates/cards/page.tsx` |
| `currency` | VARCHAR(10) | `INR` | `app/company/rates/cards/page.tsx` |
| `status` | ENUM('Active','Inactive','Draft','Expired') | `Active` | `app/company/rates/cards/page.tsx` |
| `valid_from` | DATE | `2025-01-01` | `app/company/rates/cards/page.tsx` |
| `valid_to` | DATE | `2025-12-31` | `app/company/rates/cards/page.tsx` |
| `fuel_surcharge` | DECIMAL(5,2) | `5.5` | `app/company/rates/cards/page.tsx` |
| `insurance_rate` | DECIMAL(5,2) | `1.2` | `app/company/rates/cards/page.tsx` |
| `min_charge` | DECIMAL(10,2) | `350` | `app/company/rates/cards/page.tsx` |

#### `contract_rates`

Used in: `app/company/rates/contracts/page.tsx`, `app/admin/rates/contracts/page.tsx`

| Field | Type | Sample | Source |
|---|---|---|---|
| `id` | UUID | `contract-001` | `app/company/rates/contracts/page.tsx` |
| `contract_number` | VARCHAR(50) | `CTR-2025-001` | `app/company/rates/contracts/page.tsx` |
| `title` | VARCHAR(255) | `BlueDart Annual Express` | `app/company/rates/contracts/page.tsx` |
| `carrier_id` | UUID FK → carriers | `carrier-001` | `app/company/rates/contracts/page.tsx` |
| `carrier_name` | VARCHAR(255) | `BlueDart Freight` | `app/company/rates/contracts/page.tsx` |
| `service_type` | ENUM('Express','Standard','Freight') | `Express` | `app/company/rates/contracts/page.tsx` |
| `mode` | ENUM('Road','Air','Sea','Rail') | `Road` | `app/company/rates/contracts/page.tsx` |
| `routes` | TEXT[] (JSONB) | `["Bangalore-Mumbai","Mumbai-Delhi"]` | `app/company/rates/contracts/page.tsx` |
| `base_rate` | DECIMAL(10,2) | `38.50` | `app/company/rates/contracts/page.tsx` |
| `rate_per_kg` | DECIMAL(10,2) | `1.85` | `app/company/rates/contracts/page.tsx` |
| `min_weight` | DECIMAL(10,2) | `0.5` | `app/company/rates/contracts/page.tsx` |
| `max_weight` | DECIMAL(10,2) | `50` | `app/company/rates/contracts/page.tsx` |
| `currency` | VARCHAR(10) | `INR` | `app/company/rates/contracts/page.tsx` |
| `status` | ENUM('Active','Expired','Pending','Draft') | `Active` | `app/company/rates/contracts/page.tsx` |
| `start_date` | DATE | `2025-01-01` | `app/company/rates/contracts/page.tsx` |
| `end_date` | DATE | `2025-12-31` | `app/company/rates/contracts/page.tsx` |
| `volume_discount` | DECIMAL(5,2) | `15` | `app/company/rates/contracts/page.tsx` |
| `contract_type` | VARCHAR(100) | `Master Agreement` | `app/company/rates/contracts/page.tsx` |
| `renewal_terms` | ENUM('Automatic','Manual') | `Automatic` | `app/company/rates/contracts/page.tsx` |
| `payment_terms` | VARCHAR(100) | `Net 30 days` | `app/company/rates/contracts/page.tsx` |
| `service_level` | ENUM('Premium','Standard','Economy') | `Premium` | `app/company/rates/contracts/page.tsx` |

#### `spot_rates`

Used in: `app/company/rates/spot/page.tsx`

| Field | Type | Sample | Source |
|---|---|---|---|
| `id` | UUID | `SPOT-2025-001` | `app/company/rates/spot/page.tsx` |
| `customer` | VARCHAR(255) | `Tech Solutions Pvt Ltd` | `app/company/rates/spot/page.tsx` |
| `mode` | ENUM('Road','Air','Sea','Rail') | `Road` | `app/company/rates/spot/page.tsx` |
| `origin` | VARCHAR(255) | `Bangalore` | `app/company/rates/spot/page.tsx` |
| `destination` | VARCHAR(255) | `Mumbai` | `app/company/rates/spot/page.tsx` |
| `weight` | DECIMAL(10,2) | `450` | `app/company/rates/spot/page.tsx` |
| `target_rate` | DECIMAL(10,2) | `38000` | `app/company/rates/spot/page.tsx` |
| `quoted_rate` | DECIMAL(10,2) NULL | `36500` | `app/company/rates/spot/page.tsx` |
| `currency` | VARCHAR(10) | `INR` | `app/company/rates/spot/page.tsx` |
| `status` | ENUM('Pending','Quoted','Accepted','Declined','Expired') | `Quoted` | `app/company/rates/spot/page.tsx` |
| `priority` | ENUM('High','Medium','Low') | `High` | `app/company/rates/spot/page.tsx` |
| `requested_date` | DATE | `2025-01-18` | `app/company/rates/spot/page.tsx` |
| `valid_until` | DATE | `2025-01-20` | `app/company/rates/spot/page.tsx` |
| `carrier` | VARCHAR(255) NULL | `BlueDart Freight` | `app/company/rates/spot/page.tsx` |
| `transit_time` | VARCHAR(50) NULL | `2 days` | `app/company/rates/spot/page.tsx` |

---

### 2.8 Compliance & Customs

#### `customs_declarations`

Used in: `app/admin/compliance/customs/page.tsx`, `app/manager/compliance/customs/page.tsx`

| Field | Type | Sample | Source |
|---|---|---|---|
| `id` | UUID | `CUS-2025-001` | `app/admin/compliance/customs/page.tsx` |
| `declaration_number` | VARCHAR(50) | `DEC-2025-001` | — |
| `company_id` | UUID FK → companies | `cmp-001` | — |
| `cargo_id` | UUID FK → cargo | `cargo-001` | — |
| `type` | ENUM('Import','Export','Transit') | `Export` | `app/admin/compliance/customs/page.tsx:171` |
| `status` | ENUM('Pending','Cleared','Held','Rejected','Released') | `Cleared` | `app/admin/compliance/customs/page.tsx:151` |
| `risk_level` | ENUM('Low','Medium','High') | `Low` | `app/admin/compliance/customs/page.tsx:162` |
| `declared_value` | DECIMAL(12,2) | `500000` | — |
| `customs_duty` | DECIMAL(12,2) | `75000` | — |
| `filed_date` | DATE | `2025-01-10` | — |
| `clearance_date` | DATE NULL | `2025-01-12` | — |

#### `licenses`

Used in: `app/admin/compliance/licenses/page.tsx`

| Field | Type | Sample | Source |
|---|---|---|---|
| `id` | UUID | `LIC-001` | `app/admin/compliance/licenses/page.tsx` |
| `license_number` | VARCHAR(100) | `IEC-12345` | — |
| `type` | ENUM('Import','Export','Both') | `Import` | `app/admin/compliance/licenses/page.tsx:169` |
| `company_id` | UUID FK → companies | `cmp-001` | — |
| `status` | ENUM('Active','Expired','Suspended','Revoked','Pending Renewal') | `Active` | `app/admin/compliance/licenses/page.tsx:149` |
| `risk_level` | ENUM('Low','Medium','High') | `Low` | `app/admin/compliance/licenses/page.tsx:160` |
| `issuing_authority` | VARCHAR(255) | `DGFT` | — |
| `issued_date` | DATE | `2024-01-01` | — |
| `expiry_date` | DATE | `2025-12-31` | — |

#### `hs_codes`

Referenced in: `app/admin/logistics/hs-codes` (route exists), `data/mockData.ts` cargo items have `hsCode` field.

| Field | Type | Sample |
|---|---|---|
| `code` | VARCHAR(20) PK | `8471.30` |
| `description` | TEXT | `Laptop Computers` |
| `section` | VARCHAR(100) | — |
| `chapter` | VARCHAR(100) | — |

---

## 3. Enum & Status Definitions

### 3.1 Core Enums (from `data/mockData.ts`)

```typescript
// Company
CompanyStatus     = 'Active' | 'Pending' | 'Suspended' | 'Inactive'
RegistrationStatus = 'Draft' | 'Submitted' | 'Approved' | 'Rejected'
BusinessType      = 'Freight' | 'Express' | 'Courier' | 'Logistics' | 'Mixed'
BillingCycle      = 'Monthly' | 'Quarterly' | 'Yearly'
Plan              = 'Starter' | 'Professional' | 'Enterprise'
RegistrationType  = 'self-service' | 'admin-created'

// Organization
OrgType           = 'Regional' | 'Department' | 'Branch' | 'Division'

// Users & Roles
UserRole          = 'SuperAdmin' | 'CompanyAdmin' | 'Manager'
                  | 'Dispatcher' | 'Operator' | 'Agent' | 'Staff'
                  | 'CustomsAgent' | 'PortAgent' | 'CustomerPortal' | 'AuditorReadOnly'
AgentType         = 'warehouse' | 'driver' | 'finance'
PermissionAction  = 'view' | 'create' | 'edit' | 'delete'

// Logistics
TransportMode     = 'Land' | 'Air' | 'Water'
TransportModeExt  = 'Road' | 'Air' | 'Sea' | 'Rail' | 'Multimodal' | 'Last-Mile'
                  // Road/Air/Sea/Rail used in company pages, Multimodal/Last-Mile in docs
```

### 3.2 Status Enums (from `data/mockData.ts` and all pages)

```typescript
// Shipments (7 states) — used in all shipment/booking contexts
ShipmentStatus    = 'Pending' | 'Picked Up' | 'In Transit' | 'Out for Delivery'
                  | 'Delivered' | 'Cancelled' | 'Failed'

// Orders (6 states)
OrderStatus       = 'Draft' | 'Confirmed' | 'Processing' | 'Shipped'
                  | 'Delivered' | 'Returned'

// Payments (4 states)
PaymentStatus     = 'Pending' | 'Paid' | 'Partial' | 'Refunded'

// Vehicles (4 states) — land transport
VehicleStatus     = 'Available' | 'On Route' | 'Maintenance' | 'Inactive'

// Aircraft (4 states) — air transport
AircraftStatus    = 'Available' | 'On Route' | 'Maintenance' | 'Grounded'

// Ships (5 states) — water transport
ShipStatus        = 'Active' | 'Inactive' | 'Maintenance' | 'Docked' | 'Decommissioned'

// Drivers (4 states)
DriverStatus      = 'Active' | 'On Duty' | 'Off Duty' | 'Suspended'

// Invoices (4 states)
InvoiceStatus     = 'Unpaid' | 'Paid' | 'Overdue' | 'Cancelled'

// Cargo (6 states)
CargoStatus       = 'Pending' | 'Loaded' | 'In Transit' | 'Delivered'
                  | 'Damaged' | 'Lost'

// Leg/Segment (5 states)
LegStatus         = 'Scheduled' | 'In Transit' | 'Completed' | 'Delayed' | 'Cancelled'

// Booking-specific (6 states, from company pages)
BookingStatus     = 'Pending' | 'Confirmed' | 'In Transit' | 'Delivered'
                  | 'Cancelled'  // + 'Approved' | 'Rejected' for requests

// Rate Cards (4 states)
RateCardStatus    = 'Active' | 'Inactive' | 'Draft' | 'Expired'

// Contracts (4 states)
ContractStatus    = 'Active' | 'Expired' | 'Pending' | 'Draft'

// Spot Rates (5 states)
SpotRateStatus    = 'Pending' | 'Quoted' | 'Accepted' | 'Declined' | 'Expired'

// Customs (5 states)
CustomsStatus     = 'Pending' | 'Cleared' | 'Held' | 'Rejected' | 'Released'

// Licenses (5 states)
LicenseStatus     = 'Active' | 'Expired' | 'Suspended' | 'Revoked' | 'Pending Renewal'

// Agent (3 states)
AgentStatus       = 'Active' | 'Inactive' | 'Suspended'

// User (2 states)
UserStatus        = 'Active' | 'Inactive'

// Customer (2 states)
CustomerType      = 'Individual' | 'Business'

// Maintenance (3 types)
MaintenanceType   = 'Regular' | 'Repair' | 'Emergency'

// Notifications (6 types)
NotificationType  = 'shipment_delayed' | 'payment_overdue' | 'maintenance_due'
                  | 'driver_off_duty' | 'new_order' | 'low_stock'

// Incoterm Groups (4 states, from app/admin/logistics/incoterms)
IncotermGroup     = 'E' | 'F' | 'C' | 'D'
SellerObligation  = 'Minimal' | 'Partial' | 'Major' | 'Full'
TransportScope    = 'Any' | 'Water Only'

// Ports (4 types, from app/admin/logistics/ports)
PortType          = 'Seaport' | 'River Port' | 'Dry Port' | 'Yacht Port'
PortStatus        = 'Active' | 'Inactive' | 'Under Maintenance'

// Ship Crew Designations (from Ship interface)
CrewDesignation   = 'Captain' | 'Chief Officer' | 'Engineer' | 'Cook' | 'Sailor' | 'Other'

// Inspection types (from CargoInspection)
InspectionType    = 'Pre-Shipment' | 'During Transit' | 'Post-Delivery'

// Service levels (from contracts)
ServiceLevel      = 'Premium' | 'Standard' | 'Economy'

// Priority levels (consistent across all pages)
Priority          = 'High' | 'Medium' | 'Low'

// Currency (used across all rates/pricing)
Currency          = 'INR' | 'USD'  // Primary: INR, Secondary: USD

// Cargo types (from containers page)
CargoType         = 'General' | 'Hazmat' | 'Perishable' | 'Fragile'
                  | 'Temperature Controlled'

// Vehicle fuel types
FuelType          = 'Petrol' | 'Diesel' | 'CNG' | 'Electric'

// Capacity units
CapacityUnit      = 'kg' | 'liters' | 'cubic_meters'
WeightUnit        = 'kg' | 'tons' | 'lbs'
VolumeUnit        = 'cubic_meters' | 'cubic_feet'
```

### 3.3 Status Color Mappings (Consolidated from all pages)

**StatusBadge component** (`components/shared/StatusBadge.tsx:10-44`) handles 28 statuses:
- Shipment: Pending, Picked Up, In Transit, Out for Delivery, Delivered, Cancelled, Failed
- Order: Draft, Confirmed, Processing, Shipped, Returned
- Payment: Paid, Partial, Refunded, Unpaid, Overdue
- Vehicle: Available, On Route, Maintenance, Inactive
- Driver: Active, On Duty, Off Duty, Suspended
- User/Customer: Individual, Business

**Color convention** (consistent across ~70 Record mappings in the codebase):
- `blue` — Confirmed, Picked Up, On Route, Quoted
- `green` — Delivered, Active, Paid, Approved, Available
- `red` — Cancelled, Failed, Overdue, Rejected, Expired, Suspended, Declined
- `yellow/amber` — In Transit, Pending, Medium, Out for Delivery, Maintenance
- `gray` — Pending, Draft, Off Duty, Inactive, Unpaid
- `indigo` — In Transit (shipment), Processing
- `purple` — Express (service type), Refunded
- `orange` — Expired, High (risk), Low Stock
- `sky/cyan` — Air mode, Freight
- `green` — Low priority, Delivered

---

## 4. Role Hierarchy & Permissions Matrix

### 4.1 Role Definitions

| # | Role | Scope | Dashboard Route | Description |
|---|---|---|---|---|
| 1 | `SuperAdmin` | Platform-wide | `/admin/dashboard` | Full platform access |
| 2 | `CompanyAdmin` | Company-wide | `/company/dashboard` | Full control within company |
| 3 | `Manager` | Organization | `/manager/dashboard` | Team & operations management |
| 4 | `Dispatcher` | Operations | `/ops/dashboard` | Dispatch & routing |
| 5 | `Operator` | Operations | `/ops/dashboard` | Vehicle/transport operations |
| 6 | `Agent` | Functional | `/agent/dashboard` | Warehouse, driver, or finance execution |
| 7 | `Staff` | Support | `/staff/dashboard` | Limited operational access |
| 8 | `CustomsAgent` | Compliance | `/customs/dashboard` | Customs operations |
| 9 | `PortAgent` | Port | `/port/dashboard` | Port operations |
| 10 | `CustomerPortal` | Customer | `/portal/dashboard` | Self-service customer |
| 11 | `AuditorReadOnly` | Read-only | `/audit/dashboard` | Audit & compliance review |

### 4.2 Permission Matrix (17 Modules, 11 Roles)

Source: `data/permissions-matrix.ts:20-247`

| Module | SuperAdmin | CompanyAdmin | Manager | Dispatcher | Operator | Agent | Staff | CustomsAgent | PortAgent | CustomerPortal | AuditorReadOnly |
|---|---|---|---|---|---|---|---|---|---|---|---|
| companies | CRUD+E/I | R+E | R | — | — | — | — | — | — | — | R+E |
| organizations | CRUD+E | CRUD+E | — | — | — | — | — | — | — | — | R+E |
| agents | CRUD+E | CRUD+E | CR+E | — | — | — | — | — | — | — | R+E |
| transport | CRUD+E | CRUD+E | R | — | — | — | — | — | — | — | R+E |
| dashboard | R | R | R | R | R | R | R | R | R | R | R |
| shipments | CR+E+I | CR+E | CR+E | R+E | R+E | CR+E | CR+E | R+E | R+E | R | R+E |
| orders | CRUD+E | CRUD+E | CR+E | R | R | CR+E | CR+E | — | — | CR | R+E |
| fleet | CRUD+E | CRUD+E | CR+E | R | R | — | — | — | — | — | R+E |
| drivers | CRUD+E | CRUD+E | CR+E | R | R | — | — | — | — | — | R+E |
| dispatch | CRUD+E | CRUD+E | CR+E | CR+E | CR+E | — | — | — | — | — | R+E |
| warehouse | CRUD+E | CRUD+E | CR+E | — | — | CR+E | CR+E | — | — | — | R+E |
| customers | CRUD+E | CRUD+E | CR+E | — | — | CR+E | CR+E | — | — | — | R+E |
| finance | CRUD+E | CRUD+E | R | — | — | R | R | — | R | R | R+E |
| reports | CR+E | CR+E | CR+E | — | — | R+E | R | R+E | R+E | — | R+E |
| users | CRUD+E | CRUD+E | — | — | — | — | — | — | — | — | R+E |
| settings | CRUD | CRU | RU | — | — | — | — | — | — | — | — |
| notifications | R | R | R | R | R | R | R | R | R | R | R |

**Key:** C=create, R=view, U=edit, D=delete, E=export, I=import, — = no access

**Agent sub-types** (warehouse/driver/finance) further filter menu visibility by `agentType` in `AgentSidebar.tsx`.

---

## 5. Sidebar Menu Structure Per Role

### 5.1 Menu Architecture

Each role has:
1. A **data file** defining menu items (some are separate files, others inline in sidebar components)
2. A **sidebar component** rendering the menu
3. A **layout file** providing the shell

| Role | Data File | Sidebar Component | Layout |
|---|---|---|---|
| **SuperAdmin** | `data/super-admin-menu.ts` | `SuperAdminSidebar.tsx` | `app/admin/layout.tsx` |
| **CompanyAdmin** | inline in component | `CompanyAdminSidebar.tsx` | `app/company/layout.tsx` |
| **Manager** | `data/manager-menu.ts` | `ManagerSidebar.tsx` | `app/manager/layout.tsx` |
| **Dispatcher/Operator** | inline in component | `OpsSidebar.tsx` | `app/ops/layout.tsx` |
| **Agent** | inline in component | `AgentSidebar.tsx` | `app/agent/layout.tsx` |
| **Staff** | inline in component | `StaffSidebar.tsx` | `app/staff/layout.tsx` |
| **CustomerPortal** | `data/customer-portal-menu.ts` | `CustomerPortalSidebar.tsx` | `app/portal/layout.tsx` |
| **AuditorReadOnly** | `data/auditor-menu.ts` | `AuditorSidebar.tsx` | `app/audit/layout.tsx` |
| **CustomsAgent** | inline in component | `CustomsSidebar.tsx` | `app/customs/layout.tsx` |
| **PortAgent** | inline in component | `PortSidebar.tsx` | `app/port/layout.tsx` |

### 5.2 SuperAdmin Menu (12 Groups, ~50 Routes)

```
Dashboard              → /admin/dashboard
Organization Management
  ├─ Companies         → /admin/org/companies
  ├─ Organizations     → /admin/org/organizations
  ├─ Company Types     → /admin/org/company-types
  ├─ Subscription Plans→ /admin/org/subscription-plans
  └─ Approvals         → /admin/org/approvals
User & Access
  ├─ Users             → /admin/users/all
  ├─ Roles & Permissions → /admin/users/roles
  ├─ RBAC Matrix       → /admin/users/rbac-matrix
  └─ Login Activity    → /admin/users/login-activity
Logistics Masters
  ├─ Carriers          → /admin/logistics/carriers
  ├─ Ports             → /admin/logistics/ports
  ├─ Airports          → /admin/logistics/airports
  ├─ Container Types   → /admin/logistics/container-types
  ├─ Incoterms         → /admin/logistics/incoterms
  └─ Transport Modes   → /admin/logistics/transport-modes
Operations Monitoring
  ├─ All Shipments     → /admin/ops/shipments
  ├─ Container Tracking→ /admin/ops/container-tracking
  ├─ BOL Monitoring    → /admin/ops/bol-monitoring
  ├─ Carrier Tracking  → /admin/ops/carrier-tracking
  ├─ Dispatch Monitoring → /admin/ops/dispatch-monitoring
  ├─ Fleet Monitoring  → /admin/ops/fleet-monitoring
  └─ Warehouse Monitoring → /admin/ops/warehouse-monitoring
Bookings & Rates
  ├─ All Bookings      → /admin/bookings
  ├─ Rate Cards        → /admin/rates/cards
  └─ Contract Rates    → /admin/rates/contracts
Finance & Billing
  ├─ Subscription Billing → /admin/finance/subscription-billing
  ├─ Invoices          → /admin/finance/invoices
  ├─ Revenue           → /admin/finance/revenue
  └─ Taxes             → /admin/finance/taxes
Compliance & Customs
  ├─ Customs Declarations → /admin/compliance/customs
  ├─ Import/Export Licenses → /admin/compliance/licenses
  └─ Compliance Reports → /admin/compliance/reports
Reports & Analytics
  ├─ Platform Reports  → /admin/reports/platform
  ├─ Shipment Analytics→ /admin/reports/shipment-analytics
  ├─ Revenue Analytics → /admin/reports/revenue-analytics
  └─ SLA Reports       → /admin/reports/sla
Workflow & Customization
  ├─ Custom Fields     → /admin/workflow/custom-fields
  ├─ Custom Statuses   → /admin/workflow/custom-statuses
  ├─ Workflow Builder  → /admin/workflow/builder
  ├─ Email Templates   → /admin/workflow/email-templates
  └─ Notification Templates → /admin/workflow/notification-templates
System Configuration
  ├─ Settings          → /admin/system/settings
  ├─ Integrations      → /admin/system/integrations
  ├─ API Config        → /admin/system/api-config
  └─ Security Settings → /admin/system/security
Audit & Security
  ├─ Audit Logs        → /admin/audit/logs
  ├─ Error Logs        → /admin/audit/error-logs
  ├─ Access Logs       → /admin/audit/access-logs
  └─ System Activity   → /admin/audit/system-activity
```

### 5.3 CompanyAdmin Menu (from `CompanyAdminSidebar.tsx`)

```
Dashboard              → /company/dashboard
Bookings
  ├─ New Booking       → /company/bookings/new
  ├─ Booking Requests  → /company/bookings/requests
  └─ All Bookings      → /company/bookings
Rates
  ├─ Rate Cards        → /company/rates/cards
  ├─ Spot Rates        → /company/rates/spot
  └─ Contract Rates    → /company/rates/contracts
Shipments / Orders / BOL / Container Tracking / Live Map / SLA Alerts
Documents (7 types) / Compliance (3 types)
Dispatch & Fleet (6 sub-modules) / Warehouse (7 sub-modules)
Finance (4 types) / Reports (5 types)
Users / Roles / Notifications / Settings
```

### 5.4 Route Access Matrix (`ROLE_MENU_ACCESS` in `data/mockData.ts:809-931`)

Each role has an explicit list of allowed route paths. This is the route-level authorization:
- **SuperAdmin**: 50+ routes
- **CompanyAdmin**: 55+ routes  
- **Manager**: 30+ routes
- **Dispatcher/Operator**: 11 routes
- **Agent**: 17 routes
- **Staff**: 10 routes
- **CustomsAgent**: 11 routes
- **PortAgent**: 10 routes
- **CustomerPortal**: 11 routes
- **AuditorReadOnly**: 13 routes

---

## 6. Mock / Demo / Temporary Data

### 6.1 Primary Mock Data (`data/mockData.ts`)

| Array | Count | Type | Production Relevance |
|---|---|---|---|
| `mockCompanies` | 2 | `Company[]` | **PRODUCTION** — core entity |
| `mockOrganizations` | 2 | `Organization[]` | **PRODUCTION** — core entity |
| `mockAgents` | 1 | `Agent[]` | **PRODUCTION** — core entity |
| `mockTransportTypes` | 3 | `TransportType[]` | **PRODUCTION** — master data |
| `mockTransportCategories` | 2 | `TransportCategory[]` | **PRODUCTION** — master data |
| `mockTransportItems` | 1 | `TransportItem[]` | **DEMO** — item registry |
| `mockUsers` | 14 | `MockUser[]` | **PRODUCTION** — core entity (passwords are mock) |
| `mockShipments` | 55 | `Shipment[]` | **PRODUCTION** — core entity |
| `mockOrders` | 25 | `Order[]` | **PRODUCTION** — core entity |
| `mockVehicles` | 2 | `Vehicle[]` | **PRODUCTION** — core entity |
| `mockAircraft` | 2 | `Aircraft[]` | **PRODUCTION** — transport asset |
| `mockShips` | 2 | `Ship[]` | **PRODUCTION** — transport asset |
| `mockCargo` | 2 | `Cargo[]` | **PRODUCTION** — shipment cargo |
| `mockDrivers` | 22 | `Driver[]` | **PRODUCTION** — core entity |
| `mockWarehouses` | 5 | `Warehouse[]` | **PRODUCTION** — core entity |
| `mockCustomers` | 32 | `Customer[]` | **PRODUCTION** — core entity |
| `mockInvoices` | 45 | `Invoice[]` | **PRODUCTION** — core entity |
| `mockNotifications` | 12 | `Notification[]` | **PRODUCTION** — notification system |
| `mockAnalytics` | 1 | object | **DERIVED** — computed from live data |
| `ROLE_DASHBOARD_MAP` | 11 | `Record` | **PRODUCTION** — role config |
| `ROLE_MENU_ACCESS` | 11 | `Record` | **PRODUCTION** — route config |
| `roleMenuConfig` | 11 | `Record` | **DUPLICATE** — see Section 7 |
| `rolePermissions` | 11 | nested `Record` | **DUPLICATE** — see Section 7 |

### 6.2 Pages with Inline Mock Data (Temporary / Demo)

| File | Data | Records | Status |
|---|---|---|---|
| `app/company/bookings/page.tsx` | `companyBookingsData` | 10 | **Production-ready table** |
| `app/company/bookings/requests/page.tsx` | `mockRequests` | 7 | **Production-ready table** |
| `app/company/rates/cards/page.tsx` | `mockRateCards` | 7 | **Production-ready table** |
| `app/company/rates/contracts/page.tsx` | `mockContracts` | 6 | **Production-ready table** |
| `app/company/rates/spot/page.tsx` | `mockSpotRequests` | 7 | **Production-ready table** |
| `app/company/live-map/page.tsx` | `liveAssets`, `stageCounts`, `exceptions`, `messages`, `statsData` | 6+4+3+4+5 | **DEMO** — needs real-time API |
| `app/admin/bookings/page.tsx` | `mockBookingsData` | 3 | **Production-ready table** |
| `app/admin/rates/cards/page.tsx` | `mockRateCards` | 4 | **Production-ready table** |
| `app/admin/rates/contracts/page.tsx` | `mockContractRates` | 4 | **Production-ready table** |
| `app/admin/compliance/customs/page.tsx` | `mockCustomsDeclarations` | 4 | **Production-ready table** |
| `app/admin/compliance/licenses/page.tsx` | `mockLicenses` | 5 | **Production-ready table** |
| `app/admin/compliance/reports/page.tsx` | `mockComplianceReports` | 4 | **Production-ready table** |
| `app/manager/` (17 files) | Various `mock*` arrays | ~5-8 each | **TEMP** — all need API integration |
| `app/(dashboard)/` (multiple) | Chart/stat inline data | varies | **DEMO** — chart data from analytics |
| `app/audit/dashboard/page.tsx` | `kpiData`, `accessAlerts` | 4+4 | **DEMO** |
| `app/portal/dashboard/page.tsx` | `kpiData` | 4 | **DEMO** |

### 6.3 Helper Data

```typescript
// From data/mockData.ts
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Indore', 'Jaipur'];
const addresses = ['123 MG Road...', '456 Brigade...', ...]; // 10 addresses

// Used for generating random names
const senderNames = ['Tech Solutions Pvt Ltd', 'Global Traders', 'Sunrise Industries', 'Metro Supplies', 'Elite Electronics'];
const receiverNames = ['Sharma & Sons', 'City Mart', 'Fashion Hub', 'Quick Retail', 'Prime Distributors'];
const driverNames = 22 Indian names
const businessNames = 15 business names
const individualNames = 15 individual names
const productNames = ['Laptop', 'Mobile Phone', 'Tablet', 'Headphones', ...] // 8 products
const serviceDescriptions = ['Express Delivery Charge', 'Standard Shipping Fee', ...] // 6 items
```

---

## 7. Duplicate & Conflicting Data Structures

### 7.1 Two Separate Permission Systems

There are **two independent permission systems** in the frontend:

| Aspect | System A (`permissions-matrix.ts`) | System B (`mockData.ts:rolePermissions`) |
|---|---|---|
| **Location** | `data/permissions-matrix.ts:20-247` | `data/mockData.ts:1734-1855` |
| **Structure** | `Record<UserRole, RolePermissions>` with 17 modules | `Record<UserRole, Record<string, {view,create,edit,delete}>>` |
| **Modules** | 17 modules (incl. companies, transport, dispatch, etc.) | Variable per role (SuperAdmin: 8 modules, CompanyAdmin: 11, etc.) |
| **Extra actions** | Has `export`, `import` actions | Only `view/create/edit/delete` |
| **Used by** | `PermissionMatrix.tsx` component, RBAC pages | `AuthContext.tsx` via `hasPermission()` |
| **Conflicts** | SuperAdmin: companies → CRUD+E/I vs. companies → view+create+edit+delete | — |

**Recommendation:** Consolidate into one system using the `permissions-matrix.ts` format (which is more complete with `export`/`import`).

### 7.2 `roleMenuConfig` vs `ROLE_MENU_ACCESS`

| Aspect | `roleMenuConfig` | `ROLE_MENU_ACCESS` |
|---|---|---|
| **Location** | `mockData.ts:1719-1731` | `mockData.ts:809-931` |
| **Type** | Module key strings (e.g., `'dashboard', 'shipments'`) | Full route paths (e.g., `'/company/shipments'`) |
| **Used by** | `AuthContext.tsx` → `allowedMenuItems` | `mockUsers[].menuAccess` |
| **Inconsistency** | `roleMenuConfig['SuperAdmin']` has 8 items but `ROLE_MENU_ACCESS['SuperAdmin']` has 50+ | — |

**Recommendation:** Use route paths as source of truth; module keys are redundant.

### 7.3 Two Vehicle Interfaces

```typescript
// Full model (data/mockData.ts:110-140) — 28 fields
interface Vehicle { id, companyId, organizationId, categoryId, registrationNumber, ... }

// Simplified model (data/mockData.ts:454-466) — 12 fields  
interface Vehicle { id, vehicleId, type, licensePlate, model, capacity, status, ... }
```

Both are named `Vehicle` — the simplified one is used in dashboard lists, the full model is used in admin/company fleet pages.

### 7.4 Booking Status Inconsistency

| Page | Statuses Used |
|---|---|
| `app/admin/bookings/page.tsx` | Confirmed, In Transit, Delivered, Cancelled |
| `app/company/bookings/page.tsx` | Pending, Confirmed, In Transit, Delivered, Cancelled |
| `app/company/bookings/requests/page.tsx` | Pending, Approved, Rejected |
| `ShipmentStatus` (mockData.ts) | Pending, Picked Up, In Transit, Out for Delivery, Delivered, Cancelled, Failed |

Bookings use a subset of ShipmentStatus with different naming. Need alignment.

### 7.5 Currency Handling

- Rate cards use `INR` and `USD` as strings
- Booking prices stored as number with separate `currency` field
- Some admin KPI cards hardcode USD/INR display formats
- No centralized currency exchange or formatting utility

### 7.6 Date Format Inconsistency

- `data/mockData.ts` uses ISO 8601 strings (`2025-01-15T10:30:00Z`)
- Page-level mock data uses date-only strings (`'2025-01-18'`)
- Some pages call `new Date().toLocaleDateString('en-IN', ...)` inline
- No centralized date formatting utility

---

## 8. Reusable Entities & Relationships

### 8.1 Entity Relationship Diagram (Key Relationships)

```
companies ──── has ──── organizations (1:N)
companies ──── has ──── users (1:N)
companies ──── has ──── customers (1:N)
companies ──── has ──── transport_types (1:N)
companies ──── has ──── vehicles (1:N)
companies ──── has ──── aircraft (1:N)
companies ──── has ──── ships (1:N)
companies ──── has ──── warehouses (1:N)
companies ──── has ──── rate_cards (1:N)
companies ──── has ──── contract_rates (1:N)
companies ──── has ──── agents (1:N)

organizations ── has ──── users (1:N)
organizations ── has ──── vehicles (1:N)
organizations ── has ──── warehouses (1:N)

users ───────── has ──── role (N:1)
users ───────── assigns ──── agents (1:N)
users ───────── creates ──── bookings (1:N)

bookings ────── references ──── carriers (N:1)
bookings ────── maps to ──── shipments (1:1)
bookings ────── belongs to ──── companies (N:1)

shipments ───── assigned to ──── drivers (N:1)
shipments ───── assigned to ──── vehicles (N:1)
shipments ───── has ──── timeline (1:N)
shipments ───── has ──── cargo (1:N)
shipments ───── invoiced as ──── invoices (1:N)

cargo ───────── has ──── cargo_items (1:N)
cargo ───────── has ──── shipment_legs (1:N)
cargo ───────── has ──── inspections (1:N)
cargo ───────── has ──── temperature_logs (1:N)

vehicles ────── has ──── maintenance_records (1:N)
vehicles ────── has ──── fuel_records (1:N)

orders ──────── contains ──── order_items (1:N)
orders ──────── references ──── shipments (N:1)
orders ──────── references ──── customers (N:1)

invoices ────── has ──── invoice_items (1:N)
invoices ────── references ──── customers (N:1)
invoices ────── references ──── shipments (N:1)
invoices ────── references ──── orders (N:1)

rate_cards ──── defines ──── pricing per route
contract_rates ── negotiated with ──── carriers
spot_rates ──── requests quotes ──── carriers

customs_declarations ── references ──── cargo (1:1)
licenses ────── issued to ──── companies (N:1)
```

### 8.2 Shared Components (UI Layer)

| Component | Location | Purpose |
|---|---|---|
| `DataTable<T>` | `components/shared/DataTable.tsx` | Generic sortable, paginated table |
| `KPICard` | `components/shared/KPICard.tsx` | Metric card with icon, trend, hover |
| `StatusBadge` | `components/shared/StatusBadge.tsx` | Color-coded status pill (28 statuses) |
| `RoleBadge` | `components/shared/RoleBadge.tsx` | Role display badge (11 roles) |
| `EmptyState` | `components/shared/EmptyState.tsx` | Empty state with icon/action |
| `SkeletonLoader` | `components/shared/SkeletonLoader.tsx` | Loading states (card/table/list/text) |
| `PermissionMatrix` | `components/shared/PermissionMatrix.tsx` | RBAC matrix editor/display |
| `ProtectedRoute` | `components/shared/ProtectedRoute.tsx` | Route guard by role |
| `PageWrapper` | `components/layout/PageWrapper.tsx` | Page shell with title/desc/actions |
| `ThemeKPICard` | `components/ui/theme-kpi-card.tsx` | Alternative themed KPI card |

---

## 9. API Service Layer Patterns

### 9.1 Service Architecture

All services follow the same pattern:

```typescript
// Pattern used by all 14 services
import { APP_CONFIG } from '@/config/appConfig';
import { mockData } from '@/data/mockData';

export async function someFunction(params): Promise<Result> {
  if (APP_CONFIG.USE_MOCK) {
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, delay));
    // Filter/sort/transform mock data
    return result;
  }
  // Real API call
  const response = await fetch(`${APP_CONFIG.API_BASE_URL}/endpoint`, {
    method: '...',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  return response.json();
}
```

### 9.2 Services Summary

| Service | API Endpoint (implied) | Primary Entity | Mock Data Used |
|---|---|---|---|
| `authService.ts` | `/auth/login`, `/auth/logout` | User | `mockUsers`, `ROLE_DASHBOARD_MAP` |
| `companyService.ts` | `/companies` | Company | `mockCompanies` |
| `organizationService.ts` | `/organizations` | Organization | `mockOrganizations` |
| `agentService.ts` | `/agents` | Agent | `mockAgents` + hardcoded permissions |
| `userService.ts` | `/users` | User | `mockUsers`, `rolePermissions` |
| `shipmentService.ts` | `/shipments` | Shipment | `mockShipments` |
| `orderService.ts` | `/orders` | Order | `mockOrders` |
| `fleetService.ts` | `/fleet/vehicles` | Vehicle | `mockVehicles` |
| `driverService.ts` | `/drivers` | Driver | `mockDrivers` |
| `warehouseService.ts` | `/warehouses` | Warehouse | `mockWarehouses` |
| `customerService.ts` | `/customers` | Customer | `mockCustomers` |
| `financeService.ts` | `/invoices`, `/analytics` | Invoice | `mockInvoices`, `mockAnalytics` |
| `reportService.ts` | `/reports` | Analytics | `mockAnalytics` + all mock data |
| `transportService.ts` | `/transport/types` | TransportType | `mockTransportTypes` |

### 9.3 API Endpoint Estimation

| Endpoint | Method | Purpose |
|---|---|---|
| `POST /api/v1/auth/login` | POST | Login |
| `POST /api/v1/auth/logout` | POST | Logout |
| `GET /api/v1/companies` | GET | List companies |
| `POST /api/v1/companies` | POST | Create company |
| `PUT /api/v1/companies/:id` | PUT | Update company |
| `DELETE /api/v1/companies/:id` | DELETE | Delete company |
| `GET /api/v1/organizations` | GET | List organizations |
| `POST /api/v1/organizations` | POST | Create organization |
| `GET /api/v1/agents` | GET | List agents |
| `POST /api/v1/agents` | POST | Create agent |
| `GET /api/v1/users` | GET | List users |
| `GET /api/v1/shipments` | GET | List shipments (with filters) |
| `GET /api/v1/shipments/:id` | GET | Get shipment detail |
| `PATCH /api/v1/shipments/:id/status` | PATCH | Update shipment status |
| `GET /api/v1/orders` | GET | List orders |
| `GET /api/v1/vehicles` | GET | List vehicles |
| `GET /api/v1/drivers` | GET | List drivers |
| `GET /api/v1/warehouses` | GET | List warehouses |
| `GET /api/v1/warehouses/:id/inventory` | GET | Get warehouse inventory |
| `GET /api/v1/customers` | GET | List customers |
| `GET /api/v1/invoices` | GET | List invoices |
| `GET /api/v1/invoices/:id` | GET | Get invoice detail |
| `GET /api/v1/analytics/overview` | GET | Dashboard KPI summary |
| `GET /api/v1/analytics/shipment-trend` | GET | Shipment trend data |
| `GET /api/v1/analytics/revenue` | GET | Revenue analytics |
| `GET /api/v1/bookings` | GET | List bookings |
| `POST /api/v1/bookings` | POST | Create booking |
| `GET /api/v1/rate-cards` | GET | List rate cards |
| `GET /api/v1/contract-rates` | GET | List contract rates |
| `GET /api/v1/spot-rates` | GET | List spot rate requests |
| `POST /api/v1/spot-rates/:id/quote` | POST | Submit quote |

---

## 10. Dashboard Metrics & Analytics

### 10.1 KPI Summary (from `mockAnalytics.kpiSummary`)

| Metric | Value | Source |
|---|---|---|
| Total Shipments | 3,600 | `data/mockData.ts:1693` |
| Active Deliveries | 580 | `data/mockData.ts:1694` |
| Pending Pickups | 180 | `data/mockData.ts:1695` |
| Revenue This Month | ₹1,750,000 | `data/mockData.ts:1696` |
| On-Time Delivery Rate | 94.5% | `data/mockData.ts:1697` |
| Fleet Utilization | 78.3% | `data/mockData.ts:1698` |

### 10.2 Chart Data Shapes

```typescript
// Shipment Trend (line chart, 30 data points)
interface ShipmentTrend {
  date: string;      // '2024-12-17'
  shipments: number; // random 30-80
  delivered: number; // random 20-60
}

// Status Distribution (pie chart, 6 values)
interface StatusDistribution {
  status: string; // 'Delivered' | 'In Transit' | 'Out for Delivery' | 'Pending' | 'Failed' | 'Cancelled'
  count: number;  // 2450, 580, 320, 180, 45, 25
  color: string;  // hex color
}

// Monthly Revenue (bar chart, 6 months)
interface MonthlyRevenue {
  month: string;    // 'Aug' | 'Sep' | 'Oct' | 'Nov' | 'Dec' | 'Jan'
  revenue: number;  // 1250000-1890000
  expenses: number; // 850000-1150000
}

// Revenue by Region (bar chart, 5 regions)
interface RevenueByRegion {
  region: string;   // 'West' | 'North' | 'South' | 'East' | 'Central'
  revenue: number;  // 1850000-4500000
}

// Fleet Utilization (bar chart, 4 vehicle types)
interface FleetUtilization {
  type: string;   // 'Truck' | 'Van' | 'Bike' | 'Tempo'
  total: number;
  active: number;
  maintenance: number;
}

// Driver Performance (top 10 drivers)
interface DriverPerformance {
  name: string;
  trips: number;
  rating: number;     // 3.0-5.0
  onTimeRate: number; // 85-99.9%
}

// KPI Card metrics used in dashboards
interface KPIMetric {
  title: string;
  value: string | number;
  icon: string;       // icon component name
  trend?: { value: number; isPositive: boolean };
}
```

### 10.3 Dashboard Pages and Their Metrics

| Page | Key Metrics |
|---|---|
| Super Admin Dashboard | Total Companies, Active Shipments, Revenue, On-Time Rate |
| Company Admin Dashboard | Active Shipments, Pending Invoices, Fleet On-Road, Warehouse Utilization, Bookings This Month |
| Company Bookings | Total, Pending, Confirmed, In Transit, Delivered, Total Revenue |
| Company Booking Requests | Total Requests, Pending, Approved, Rejected, Urgent |
| Company Rate Cards | Total Cards, Active, Inactive, Avg Base Rate |
| Company Contract Rates | Total Contracts, Active, Draft, Expired, Avg Discount |
| Company Spot Rates | Total Requests, Pending, Quoted, Accepted, Conversion Rate |
| Manager Dashboard | Shipments, Fleet, Warehouse, Financial, SLA metrics |
| Operations Dashboard | Active Shipments, Fleet Status, Driver Status, Alerts |
| Agent Dashboard | Task-specific KPIs based on agent type |

---

## Appendix: Status Color Reference

Complete mapping of all status-to-color patterns across the codebase (~70 Record mappings consolidated):

| Category | Value | CSS Class Pattern (Light) | CSS Class Pattern (Dark) |
|---|---|---|---|
| Shipment | `Pending` | `bg-gray-100 text-gray-800` | `dark:bg-gray-800 dark:text-gray-300` |
| Shipment | `Picked Up` | `bg-blue-100 text-blue-800` | `dark:bg-blue-900/30 dark:text-blue-400` |
| Shipment | `In Transit` | `bg-indigo-100 text-indigo-800` | `dark:bg-indigo-900/30 dark:text-indigo-400` |
| Shipment | `Out for Delivery` | `bg-amber-100 text-amber-800` | `dark:bg-amber-900/30 dark:text-amber-400` |
| Shipment | `Delivered` | `bg-green-100 text-green-800` | `dark:bg-green-900/30 dark:text-green-400` |
| Shipment | `Cancelled` | `bg-red-100 text-red-800` | `dark:bg-red-900/30 dark:text-red-400` |
| Shipment | `Failed` | `bg-red-100 text-red-800` | `dark:bg-red-900/30 dark:text-red-400` |
| Payment | `Paid` | `bg-green-100 text-green-800` | `dark:bg-green-900/30 dark:text-green-400` |
| Payment | `Unpaid` | `bg-gray-100 text-gray-800` | `dark:bg-gray-800 dark:text-gray-300` |
| Payment | `Overdue` | `bg-red-100 text-red-800` | `dark:bg-red-900/30 dark:text-red-400` |
| Vehicle | `Available` | `bg-green-100 text-green-800` | `dark:bg-green-900/30 dark:text-green-400` |
| Vehicle | `On Route` | `bg-blue-100 text-blue-800` | `dark:bg-blue-900/30 dark:text-blue-400` |
| Vehicle | `Maintenance` | `bg-amber-100 text-amber-800` | `dark:bg-amber-900/30 dark:text-amber-400` |
| Driver | `Active` | `bg-green-100 text-green-800` | `dark:bg-green-900/30 dark:text-green-400` |
| Driver | `On Duty` | `bg-blue-100 text-blue-800` | `dark:bg-blue-900/30 dark:text-blue-400` |
| Driver | `Off Duty` | `bg-gray-100 text-gray-800` | `dark:bg-gray-800 dark:text-gray-300` |
| User | `Active` | `bg-green-100 text-green-800` | `dark:bg-green-900/30 dark:text-green-400` |
| User | `Inactive` | `bg-gray-100 text-gray-800` | `dark:bg-gray-800 dark:text-gray-300` |
| Priority | `High` | `bg-red-100 text-red-800` | `dark:bg-red-900/30 dark:text-red-400` |
| Priority | `Medium` | `bg-yellow-100 text-yellow-800` | `dark:bg-yellow-900/30 dark:text-yellow-400` |
| Priority | `Low` | `bg-green-100 text-green-800` | `dark:bg-green-900/30 dark:text-green-400` |
| Mode | `Road` | `bg-amber-100 text-amber-800` | `dark:bg-amber-900/30 dark:text-amber-400` |
| Mode | `Air` | `bg-sky-100 text-sky-800` | `dark:bg-sky-900/30 dark:text-sky-400` |
| Mode | `Sea` | `bg-cyan-100 text-cyan-800` | `dark:bg-cyan-900/30 dark:text-cyan-400` |
| Mode | `Rail` | `bg-purple-100 text-purple-800` | `dark:bg-purple-900/30 dark:text-purple-400` |
| Service | `Express` | `bg-purple-100 text-purple-800` | `dark:bg-purple-900/30 dark:text-purple-400` |
| Service | `Standard` | `bg-blue-100 text-blue-800` | `dark:bg-blue-900/30 dark:text-blue-400` |
| Service | `Freight` | `bg-orange-100 text-orange-800` | `dark:bg-orange-900/30 dark:text-orange-400` |

---

## Appendix: File Index

| # | File Path | Content | Lines |
|---|---|---|---|
| 1 | `data/mockData.ts` | All types, all mock arrays, helpers | 1855 |
| 2 | `data/permissions-matrix.ts` | Permission matrix (17 modules × 11 roles) | 272 |
| 3 | `data/super-admin-menu.ts` | SuperAdmin sidebar menu (12 groups) | 495 |
| 4 | `data/manager-menu.ts` | Manager sidebar menu (10 groups) | 347 |
| 5 | `data/customer-portal-menu.ts` | Customer portal menu (7 groups) | 150 |
| 6 | `data/auditor-menu.ts` | Auditor menu (6 groups, read-only) | 166 |
| 7 | `config/appConfig.ts` | Mock mode toggle + API URL | 9 |
| 8 | `context/AuthContext.tsx` | Auth state + permission checks | ~120 |
| 9 | `context/NotificationContext.tsx` | Notification state | ~80 |
| 10 | `lib/utils.ts` | `cn()`, `getStatusColor()` | ~60 |
| 11 | `utils/permissions.ts` | Permission helper functions | ~200 |
| 12 | `utils/tenancy.ts` | Multi-tenancy helpers | ~180 |
| 13 | `services/*.ts` | 14 mock API service wrappers | ~150 avg |
| 14 | `components/shared/DataTable.tsx` | Generic sortable/paginated table | 205 |
| 15 | `components/shared/StatusBadge.tsx` | 28-status color mapping | 60 |
| 16 | `components/shared/KPICard.tsx` | Metric card with trend/hover | 137 |
| 17 | `components/shared/EmptyState.tsx` | Empty state with action | 36 |
| 18 | `components/shared/SkeletonLoader.tsx` | Loading skeleton | 64 |
| 19 | `components/shared/RoleBadge.tsx` | 11-role display badge | ~60 |
| 20 | `components/shared/PermissionMatrix.tsx` | RBAC matrix display | ~150 |
| 21 | `components/company/CompanyAdminPages.tsx` | 55+ page configs, 5 data arrays | 474 |
| 22 | `app/company/bookings/page.tsx` | Bookings page (10 records) | 415 |
| 23 | `app/company/bookings/requests/page.tsx` | Booking requests (7 records) | 280 |
| 24 | `app/company/rates/cards/page.tsx` | Rate cards (7 records) | 340 |
| 25 | `app/company/rates/contracts/page.tsx` | Contract rates (6 records) | 400 |
| 26 | `app/company/rates/spot/page.tsx` | Spot rates (7 records) | 360 |
| 27 | `components/layout/PageWrapper.tsx` | Page shell component | 29 |
