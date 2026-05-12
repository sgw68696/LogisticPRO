# All Users Info

This file lists all mock login users from `data/mockData.ts`, including credentials, role, tenancy fields, and sidebar menu access.

Login route: `/login`

## Quick Login Credentials

| ID | Name | Role | Username | Password | Status |
| --- | --- | --- | --- | --- | --- |
| `usr-001` | Rajesh Kumar | `SuperAdmin` | `superadmin` | `admin123` | `Active` |
| `usr-002` | Priya Sharma | `Manager` | `ops_manager` | `ops123` | `Active` |
| `usr-003` | Amit Patel | `Dispatcher` | `dispatch` | `dispatch123` | `Active` |
| `usr-004` | Sunita Reddy | `Agent` | `warehouse` | `warehouse123` | `Active` |
| `usr-005` | Mohammed Khan | `Agent` | `driver01` | `driver123` | `Active` |
| `usr-006` | Ananya Gupta | `Agent` | `finance` | `finance123` | `Active` |
| `usr-007` | Vikram Singh | `Staff` | `support` | `support123` | `Active` |
| `usr-008` | Vikram Sharma | `CompanyAdmin` | `company_admin` | `admin123` | `Active` |
| `usr-009` | Rajesh Verma | `Operator` | `operator01` | `operator123` | `Active` |
| `usr-010` | Neha Tripathi | `Staff` | `staff01` | `staff123` | `Active` |

## Users

### Rajesh Kumar

| Field | Value |
| --- | --- |
| ID | `usr-001` |
| Username | `superadmin` |
| Password | `admin123` |
| Email | `rajesh.kumar@logisticspro.com` |
| Phone | `+91 98765 43210` |
| Role | `SuperAdmin` |
| Status | `Active` |
| Last Login | `2025-01-15T09:30:00Z` |
| Created At | `2024-01-01T00:00:00Z` |
| Avatar | `RK` |
| Company ID | `null` |
| Organization ID | `null` |
| Agent ID | `null` |
| Menu Access | `dashboard`, `companies`, `organizations`, `fleet`, `dispatch`, `reports`, `users`, `settings` |
| Expected Dashboard | `/admin/dashboard` |

### Priya Sharma

| Field | Value |
| --- | --- |
| ID | `usr-002` |
| Username | `ops_manager` |
| Password | `ops123` |
| Email | `priya.sharma@techlogistics.com` |
| Phone | `+91 98765 43211` |
| Role | `Manager` |
| Status | `Active` |
| Last Login | `2025-01-15T08:45:00Z` |
| Created At | `2024-02-15T00:00:00Z` |
| Avatar | `PS` |
| Company ID | `cmp-001` |
| Organization ID | `org-001` |
| Agent ID | `agt-001` |
| Menu Access | `dashboard`, `shipments`, `orders`, `fleet`, `drivers`, `dispatch`, `warehouse`, `customers`, `reports`, `notifications`, `settings` |

### Amit Patel

| Field | Value |
| --- | --- |
| ID | `usr-003` |
| Username | `dispatch` |
| Password | `dispatch123` |
| Email | `amit.patel@techlogistics.com` |
| Phone | `+91 98765 43212` |
| Role | `Dispatcher` |
| Status | `Active` |
| Last Login | `2025-01-15T07:00:00Z` |
| Created At | `2024-03-10T00:00:00Z` |
| Avatar | `AP` |
| Company ID | `cmp-001` |
| Organization ID | `org-002` |
| Agent ID | `null` |
| Menu Access | `dashboard`, `shipments`, `dispatch`, `drivers`, `fleet`, `notifications` |

### Sunita Reddy

| Field | Value |
| --- | --- |
| ID | `usr-004` |
| Username | `warehouse` |
| Password | `warehouse123` |
| Email | `sunita.reddy@techlogistics.com` |
| Phone | `+91 98765 43213` |
| Role | `Agent` |
| Status | `Active` |
| Last Login | `2025-01-14T18:00:00Z` |
| Created At | `2024-04-05T00:00:00Z` |
| Avatar | `SR` |
| Company ID | `cmp-001` |
| Organization ID | `org-001` |
| Agent ID | `null` |
| Menu Access | `dashboard`, `shipments`, `orders`, `customers`, `finance`, `warehouse`, `reports`, `notifications` |

### Mohammed Khan

| Field | Value |
| --- | --- |
| ID | `usr-005` |
| Username | `driver01` |
| Password | `driver123` |
| Email | `mohammed.khan@techlogistics.com` |
| Phone | `+91 98765 43214` |
| Role | `Agent` |
| Status | `Active` |
| Last Login | `2025-01-15T06:00:00Z` |
| Created At | `2024-05-20T00:00:00Z` |
| Avatar | `MK` |
| Company ID | `cmp-001` |
| Organization ID | `org-001` |
| Agent ID | `null` |
| Menu Access | `dashboard`, `shipments`, `orders`, `customers`, `finance`, `warehouse`, `reports`, `notifications` |

### Ananya Gupta

| Field | Value |
| --- | --- |
| ID | `usr-006` |
| Username | `finance` |
| Password | `finance123` |
| Email | `ananya.gupta@techlogistics.com` |
| Phone | `+91 98765 43215` |
| Role | `Agent` |
| Status | `Active` |
| Last Login | `2025-01-15T10:00:00Z` |
| Created At | `2024-06-12T00:00:00Z` |
| Avatar | `AG` |
| Company ID | `cmp-001` |
| Organization ID | `org-001` |
| Agent ID | `null` |
| Menu Access | `dashboard`, `shipments`, `orders`, `customers`, `finance`, `warehouse`, `reports`, `notifications` |

### Vikram Singh

| Field | Value |
| --- | --- |
| ID | `usr-007` |
| Username | `support` |
| Password | `support123` |
| Email | `vikram.singh@techlogistics.com` |
| Phone | `+91 98765 43216` |
| Role | `Staff` |
| Status | `Active` |
| Last Login | `2025-01-15T09:00:00Z` |
| Created At | `2024-07-08T00:00:00Z` |
| Avatar | `VS` |
| Company ID | `cmp-001` |
| Organization ID | `org-002` |
| Agent ID | `null` |
| Menu Access | `dashboard`, `shipments`, `orders`, `customers`, `finance`, `warehouse`, `reports`, `notifications` |

### Vikram Sharma

| Field | Value |
| --- | --- |
| ID | `usr-008` |
| Username | `company_admin` |
| Password | `admin123` |
| Email | `admin@techlogistics.com` |
| Phone | `+91 98765 43217` |
| Role | `CompanyAdmin` |
| Status | `Active` |
| Last Login | `2025-01-14T14:30:00Z` |
| Created At | `2024-08-01T00:00:00Z` |
| Avatar | `VS` |
| Company ID | `cmp-001` |
| Organization ID | `null` |
| Agent ID | `null` |
| Menu Access | `dashboard`, `shipments`, `orders`, `fleet`, `drivers`, `dispatch`, `warehouse`, `customers`, `agents`, `transport`, `finance`, `reports`, `notifications`, `settings` |
| Expected Dashboard | `/admin/company` |

### Rajesh Verma

| Field | Value |
| --- | --- |
| ID | `usr-009` |
| Username | `operator01` |
| Password | `operator123` |
| Email | `rajesh.verma@techlogistics.com` |
| Phone | `+91 98765 43218` |
| Role | `Operator` |
| Status | `Active` |
| Last Login | `2025-01-15T11:00:00Z` |
| Created At | `2024-09-15T00:00:00Z` |
| Avatar | `RV` |
| Company ID | `cmp-001` |
| Organization ID | `org-001` |
| Agent ID | `null` |
| Menu Access | `dashboard`, `shipments`, `dispatch`, `drivers`, `fleet`, `notifications` |

### Neha Tripathi

| Field | Value |
| --- | --- |
| ID | `usr-010` |
| Username | `staff01` |
| Password | `staff123` |
| Email | `neha.tripathi@techlogistics.com` |
| Phone | `+91 98765 43219` |
| Role | `Staff` |
| Status | `Active` |
| Last Login | `2025-01-15T12:00:00Z` |
| Created At | `2024-10-01T00:00:00Z` |
| Avatar | `NT` |
| Company ID | `cmp-001` |
| Organization ID | `org-001` |
| Agent ID | `null` |
| Menu Access | `dashboard`, `shipments`, `orders`, `customers`, `finance`, `warehouse`, `reports`, `notifications` |

## Role Menu Access

| Role | Menu IDs |
| --- | --- |
| `SuperAdmin` | `dashboard`, `companies`, `organizations`, `fleet`, `dispatch`, `reports`, `users`, `settings` |
| `CompanyAdmin` | `dashboard`, `shipments`, `orders`, `fleet`, `drivers`, `dispatch`, `warehouse`, `customers`, `agents`, `transport`, `finance`, `reports`, `notifications`, `settings` |
| `Manager` | `dashboard`, `shipments`, `orders`, `fleet`, `drivers`, `dispatch`, `warehouse`, `customers`, `reports`, `notifications`, `settings` |
| `Dispatcher` | `dashboard`, `shipments`, `dispatch`, `drivers`, `fleet`, `notifications` |
| `Agent` | `dashboard`, `shipments`, `orders`, `customers`, `finance`, `warehouse`, `reports`, `notifications` |
| `Staff` | `dashboard`, `shipments`, `orders`, `customers`, `finance`, `warehouse`, `reports`, `notifications` |
| `Operator` | `dashboard`, `shipments`, `dispatch`, `drivers`, `fleet`, `notifications` |
| `Admin` | `dashboard`, `shipments`, `orders`, `fleet`, `drivers`, `dispatch`, `warehouse`, `customers`, `finance`, `reports`, `notifications`, `users`, `settings` |

## Source Files

- User data: `data/mockData.ts`
- Role menu config: `data/mockData.ts`
- Auth service: `services/authService.ts`
