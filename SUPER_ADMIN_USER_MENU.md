# Super Admin User And Sidebar Menu

## Super Admin User

| Field | Value |
| --- | --- |
| ID | `usr-001` |
| Name | Rajesh Kumar |
| Username | `superadmin` |
| Password | `admin123` |
| Email | `rajesh.kumar@logisticspro.com` |
| Phone | `+91 98765 43210` |
| Role | `SuperAdmin` |
| Status | `Active` |
| Company ID | `null` |
| Organization ID | `null` |
| Agent ID | `null` |
| Avatar | `RK` |

Login route: `/login`

Expected dashboard route after login: `/admin/dashboard`

## Sidebar Menu

| Menu | Route | Description |
| --- | --- | --- |
| Dashboard | `/admin/dashboard` | Platform overview and KPIs |

## Organization Management

| Menu | Route | Description |
| --- | --- | --- |
| Companies | `/admin/org/companies` | View and manage all companies |
| Organizations | `/admin/org/organizations` | View and manage organizations |
| Company Types | `/admin/org/company-types` | Define company types and categories |
| Subscription Plans | `/admin/org/subscription-plans` | Manage subscription tiers and pricing |
| Approvals | `/admin/org/approvals` | Approve pending registrations |

## User & Access

| Menu | Route | Description |
| --- | --- | --- |
| Users | `/admin/users/all` | Manage all platform users |
| Roles & Permissions | `/admin/users/roles` | Define roles and permissions |
| RBAC Matrix | `/admin/users/rbac-matrix` | View permission matrix |
| Login Activity | `/admin/users/login-activity` | Track user login history |

## Logistics Masters

| Menu | Route | Description |
| --- | --- | --- |
| Carriers | `/admin/logistics/carriers` | Manage shipping carriers |
| Ports | `/admin/logistics/ports` | Manage seaports |
| Airports | `/admin/logistics/airports` | Manage airports |
| Container Types | `/admin/logistics/container-types` | Define container specifications |
| Incoterms | `/admin/logistics/incoterms` | Manage trade terms |
| Transport Modes | `/admin/logistics/transport-modes` | Configure transport methods |

## Operations Monitoring

| Menu | Route | Description |
| --- | --- | --- |
| All Shipments | `/admin/ops/shipments` | View all shipments |
| Container Tracking | `/admin/ops/container-tracking` | Track containers |
| BOL Monitoring | `/admin/ops/bol-monitoring` | Monitor bills of lading |
| Carrier Tracking | `/admin/ops/carrier-tracking` | Track carrier performance |
| Dispatch Monitoring | `/admin/ops/dispatch-monitoring` | Monitor dispatches |
| Fleet Monitoring | `/admin/ops/fleet-monitoring` | Monitor fleet operations |
| Warehouse Monitoring | `/admin/ops/warehouse-monitoring` | Monitor warehouse operations |

## Finance & Billing

| Menu | Route | Description |
| --- | --- | --- |
| Subscription Billing | `/admin/finance/subscription-billing` | Manage subscriptions |
| Invoices | `/admin/finance/invoices` | View and manage invoices |
| Revenue | `/admin/finance/revenue` | Revenue analytics |
| Taxes | `/admin/finance/taxes` | Tax management |

## Reports & Analytics

| Menu | Route | Description |
| --- | --- | --- |
| Platform Reports | `/admin/reports/platform` | Platform-wide reports |
| Shipment Analytics | `/admin/reports/shipment-analytics` | Shipment analysis |
| Revenue Analytics | `/admin/reports/revenue-analytics` | Revenue analysis |
| SLA Reports | `/admin/reports/sla` | SLA compliance reports |

## Workflow & Customization

| Menu | Route | Description |
| --- | --- | --- |
| Custom Fields | `/admin/workflow/custom-fields` | Define custom fields |
| Custom Statuses | `/admin/workflow/custom-statuses` | Create custom statuses |
| Workflow Builder | `/admin/workflow/builder` | Build custom workflows |
| Email Templates | `/admin/workflow/email-templates` | Manage email templates |
| Notification Templates | `/admin/workflow/notification-templates` | Manage notifications |

## System Configuration

| Menu | Route | Description |
| --- | --- | --- |
| Settings | `/admin/system/settings` | Global settings |
| Integrations | `/admin/system/integrations` | Manage integrations |
| API Config | `/admin/system/api-config` | API configuration |
| Security Settings | `/admin/system/security` | Security configuration |

## Audit & Security

| Menu | Route | Description |
| --- | --- | --- |
| Audit Logs | `/admin/audit/logs` | View audit logs |
| Error Logs | `/admin/audit/error-logs` | View error logs |
| Access Logs | `/admin/audit/access-logs` | View access logs |
| System Activity | `/admin/audit/system-activity` | Monitor system activity |

## Source Files

- User data: `data/mockData.ts`
- Sidebar menu: `data/super-admin-menu.ts`
- Sidebar component: `components/layout/SuperAdminSidebar.tsx`
