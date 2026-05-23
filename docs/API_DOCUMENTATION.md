# LogisticPro — Complete API Endpoint Documentation

**Base URL:** `http://localhost:8000/api/v1`  
**Auth Header:** `Authorization: Bearer <token>`  
**Response Envelope:**
```json
{ "success": true/false, "message": "...", "data": {}, "meta": { "total": 0, "page": 1, "limit": 10, "totalPages": 1 } }
```

---

## Table of Contents

1. [Authentication & Authorization](#1-authentication--authorization)
2. [User Management](#2-user-management)
3. [Role & Permission Management](#3-role--permission-management)
4. [Company Management](#4-company-management)
5. [Organization Management](#5-organization-management)
6. [Agent Management](#6-agent-management)
7. [Company User Management](#7-company-user-management)
8. [Approval Workflow](#8-approval-workflow)
9. [Shipment Management](#9-shipment-management)
10. [Order Management](#10-order-management)
11. [Fleet / Vehicle Management](#11-fleet--vehicle-management)
12. [Driver Management](#12-driver-management)
13. [Customer Management](#13-customer-management)
14. [Warehouse Management](#14-warehouse-management)
15. [Finance & Invoice Management](#15-finance--invoice-management)
16. [Container Management](#16-container-management)
17. [Customs Management](#17-customs-management)
18. [Port Management](#18-port-management)
19. [Transport Configuration](#19-transport-configuration)
20. [Company Types](#20-company-types)
21. [Notifications](#21-notifications)
22. [Activity & Audit Logs](#22-activity--audit-logs)
23. [Reports & Analytics](#23-reports--analytics)
24. [Portal — Customer-Facing APIs](#24-portal--customer-facing-apis)
25. [File & Document Upload](#25-file--document-upload)
26. [System Settings & Config](#26-system-settings--config)
27. [Integrations & API Config](#27-integrations--api-config)

---

## 1. Authentication & Authorization

### POST /auth/login
**Purpose:** Authenticate user with credentials  
**Roles Access:** All  
**Request Body:**
```json
{ "email": "string", "password": "string" }
```
**Response:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "uuid", "name": "string", "email": "string", "role": "SuperAdmin", "agentType": "warehouse|null", "avatar": "string", "dashboardRoute": "/admin/dashboard", "companyId": "string|null", "organizationId": "string|null" },
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

---

### POST /auth/logout
**Purpose:** Invalidate current session  
**Roles Access:** All  
**Headers:** Authorization required  

---

### GET /auth/me
**Purpose:** Get current authenticated user profile  
**Roles Access:** All  
**Response:** User object  

---

### POST /auth/refresh
**Purpose:** Refresh expired access token  
**Roles Access:** All  
**Request Body:** `{ "refreshToken": "string" }`  

---

### POST /auth/forgot-password
**Purpose:** Send password reset link to email  
**Roles Access:** All (unauthenticated)  
**Request Body:** `{ "email": "string" }`  

---

### POST /auth/reset-password
**Purpose:** Reset password with token  
**Roles Access:** All (unauthenticated)  
**Request Body:** `{ "token": "string", "password": "string", "passwordConfirmation": "string" }`  

---

### POST /auth/verify-otp
**Purpose:** Verify OTP during login or 2FA  
**Roles Access:** All (unauthenticated)  
**Request Body:** `{ "email": "string", "otp": "string" }`  

---

### POST /auth/switch-role
**Purpose:** Switch active role for multi-role users (e.g. Operator ↔ Dispatcher)  
**Roles Access:** Multi-role users  
**Request Body:** `{ "role": "Dispatcher" }`  

---

### GET /auth/sessions
**Purpose:** List all active sessions for current user  
**Roles Access:** All  
**Response:** `{ "sessions": [{ "id": "string", "device": "string", "ip": "string", "lastActive": "datetime", "current": true }] }`  

---

### DELETE /auth/sessions/:id
**Purpose:** Terminate a specific session  
**Roles Access:** All  

---

## 2. User Management

### GET /users
**Purpose:** List all users with optional filters  
**Roles Access:** SuperAdmin, CompanyAdmin  
**Query Params:**
- `role` (string) — filter by role slug
- `status` (Active|Inactive)
- `search` (string) — search by name, username, email
- `page` (int, default 1)
- `limit` (int, default 10)
- `sortBy` (string)
- `sortDir` (asc|desc)
**Response:** Paginated list of users  

---

### POST /users
**Purpose:** Create a new user  
**Roles Access:** SuperAdmin, CompanyAdmin  
**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "username": "string",
  "password": "string",
  "role": "SuperAdmin|CompanyAdmin|Manager|Dispatcher|Operator|Agent|Staff|CustomsAgent|PortAgent|CustomerPortal|AuditorReadOnly",
  "status": "Active|Inactive",
  "companyId": "string|null",
  "organizationId": "string|null"
}
```

---

### GET /users/:id
**Purpose:** Get single user by ID  
**Roles Access:** SuperAdmin, CompanyAdmin  

---

### PATCH /users/:id
**Purpose:** Update user details  
**Roles Access:** SuperAdmin, CompanyAdmin  
**Request Body:** Partial user fields  

---

### DELETE /users/:id
**Purpose:** Soft-delete a user  
**Roles Access:** SuperAdmin  

---

### PATCH /users/:id/status
**Purpose:** Activate or deactivate a user  
**Roles Access:** SuperAdmin, CompanyAdmin  
**Request Body:** `{ "status": "Active|Inactive" }`  

---

### POST /users/:id/assign-role
**Purpose:** Assign a role to a user  
**Roles Access:** SuperAdmin  
**Request Body:** `{ "role": "Manager" }`  

---

### POST /users/invite
**Purpose:** Invite a user via email  
**Roles Access:** SuperAdmin, CompanyAdmin  
**Request Body:** `{ "email": "string", "role": "string", "companyId": "string" }`  

---

### POST /users/bulk-import
**Purpose:** Bulk import users from CSV/Excel  
**Roles Access:** SuperAdmin  
**Request Body:** Multipart file upload  

---

### GET /users/export
**Purpose:** Export users list as CSV/Excel  
**Roles Access:** SuperAdmin, CompanyAdmin  
**Query Params:** Same filters as GET /users  

---

### GET /users/:id/activity-log
**Purpose:** Get activity log for a specific user  
**Roles Access:** SuperAdmin, AuditorReadOnly  

---

## 3. Role & Permission Management

### GET /roles
**Purpose:** List all available roles  
**Roles Access:** SuperAdmin  
**Response:** `[{ "id": "int", "name": "string", "slug": "string", "description": "string" }]`  

---

### POST /roles
**Purpose:** Create a new custom role  
**Roles Access:** SuperAdmin  
**Request Body:** `{ "name": "string", "slug": "string", "description": "string" }`  

---

### GET /roles/:slug/permissions
**Purpose:** Get permissions for a role  
**Roles Access:** SuperAdmin  
**Response:** `{ "modules": { "shipments": { "view": true, "create": false, "edit": false, "delete": false, "export": false, "import": false } } }`  

---

### PUT /roles/:slug/permissions
**Purpose:** Update permissions for a role  
**Roles Access:** SuperAdmin  
**Request Body:**
```json
{
  "permissions": {
    "shipments": { "view": true, "create": true, "edit": true, "delete": false, "export": true },
    "fleet": { "view": true, "create": false, "edit": false, "delete": false }
  }
}
```

---

### GET /roles/rbac-matrix
**Purpose:** Get full RBAC permission matrix for all roles  
**Roles Access:** SuperAdmin, AuditorReadOnly  

---

### PUT /roles/rbac-matrix
**Purpose:** Bulk update RBAC matrix  
**Roles Access:** SuperAdmin  

---

## 4. Company Management

### GET /companies
**Purpose:** List all companies with pagination  
**Roles Access:** SuperAdmin, CompanyAdmin, AuditorReadOnly  
**Query Params:**
- `search` (string)
- `status` (Active|Pending|Suspended|Inactive)
- `organization_id` (int)
- `company_type_id` (int)
- `page` (int, default 1)
- `limit` (int, default 10)
**Response:** Paginated company list  

---

### POST /companies
**Purpose:** Create a new company  
**Roles Access:** SuperAdmin  
**Request Body:**
```json
{
  "organization_id": "int",
  "company_type_id": "int",
  "name": "string",
  "email": "string",
  "phone": "string",
  "registration_number": "string",
  "tax_id": "string",
  "website": "string",
  "address_line1": "string",
  "address_line2": "string",
  "city": "string",
  "state": "string",
  "country": "string",
  "postal_code": "string",
  "subscription_status": "trial|active|suspended|cancelled",
  "status": "pending|active|suspended|inactive",
  "user_first_name": "string",
  "user_last_name": "string",
  "user_email": "string",
  "user_username": "string",
  "user_password": "string",
  "user_phone": "string",
  "user_role_slug": "string"
}
```

---

### GET /companies/:id
**Purpose:** Get company details by ID  
**Roles Access:** SuperAdmin, CompanyAdmin  

---

### PUT /companies/:id
**Purpose:** Update company details  
**Roles Access:** SuperAdmin, CompanyAdmin  

---

### DELETE /companies/:id
**Purpose:** Soft-delete a company  
**Roles Access:** SuperAdmin  

---

### PATCH /companies/:id/activate
**Purpose:** Activate a company  
**Roles Access:** SuperAdmin  

---

### PATCH /companies/:id/deactivate
**Purpose:** Deactivate a company  
**Roles Access:** SuperAdmin  

---

### PATCH /companies/:id/verify
**Purpose:** Verify/approve a company registration  
**Roles Access:** SuperAdmin  

---

### GET /companies/:id/users
**Purpose:** List users belonging to a company  
**Roles Access:** SuperAdmin, CompanyAdmin  
**Query Params:** `page`, `limit`  

---

### GET /companies/list
**Purpose:** Get simplified company list for dropdowns  
**Roles Access:** SuperAdmin  
**Response:** `[{ "id": "int", "uuid": "string", "name": "string", "status": "string" }]`  

---

## 5. Organization Management

### GET /organizations
**Purpose:** List all organizations with pagination  
**Roles Access:** SuperAdmin, CompanyAdmin, AuditorReadOnly  
**Query Params:**
- `search` (string)
- `status` (Active|Pending|Suspended|Inactive)
- `page` (int, default 1)
- `limit` (int, default 10)

---

### POST /organizations
**Purpose:** Create a new organization  
**Roles Access:** SuperAdmin  
**Request Body:** Same structure as company creation  

---

### GET /organizations/:id
**Purpose:** Get organization details  
**Roles Access:** SuperAdmin, CompanyAdmin  

---

### PUT /organizations/:id
**Purpose:** Update organization  
**Roles Access:** SuperAdmin  

---

### DELETE /organizations/:id
**Purpose:** Soft-delete an organization  
**Roles Access:** SuperAdmin  

---

### PATCH /organizations/:id/activate
**Purpose:** Activate organization  
**Roles Access:** SuperAdmin  

---

### PATCH /organizations/:id/deactivate
**Purpose:** Deactivate organization  
**Roles Access:** SuperAdmin  

---

### GET /organizations/:id/companies
**Purpose:** List companies under an organization  
**Roles Access:** SuperAdmin, CompanyAdmin  
**Query Params:** `page`, `limit`  

---

### GET /organizations/:id/users
**Purpose:** List users under an organization  
**Roles Access:** SuperAdmin, CompanyAdmin  
**Query Params:** `page`, `limit`  

---

### GET /organizations/list
**Purpose:** Get simplified organization list for dropdowns  
**Roles Access:** SuperAdmin  

---

## 6. Agent Management

### GET /agents
**Purpose:** List agents with filters  
**Roles Access:** SuperAdmin, CompanyAdmin  
**Query Params:**
- `companyId` (required)
- `organizationId` (string)
- `status` (Active|Inactive|Suspended)
- `page` (int, default 1)
- `pageSize` (int, default 10)

---

### POST /agents
**Purpose:** Create a new agent with role assignments  
**Roles Access:** SuperAdmin, CompanyAdmin  
**Request Body:**
```json
{
  "companyId": "string",
  "organizationId": "string|null",
  "name": "string",
  "email": "string",
  "phone": "string",
  "username": "string",
  "roles": [{ "roleType": "Manager", "scope": "company|organization|department", "scopeId": "string|null" }]
}
```

---

### GET /agents/:id
**Purpose:** Get agent details including role assignments  
**Roles Access:** SuperAdmin, CompanyAdmin  

---

### PUT /agents/:id
**Purpose:** Update agent details  
**Roles Access:** SuperAdmin, CompanyAdmin  
**Request Body:** `{ "name": "string", "email": "string", "phone": "string", "status": "Active|Inactive|Suspended" }`  

---

### DELETE /agents/:id
**Purpose:** Delete an agent  
**Roles Access:** SuperAdmin, CompanyAdmin  

---

### POST /agents/:id/roles
**Purpose:** Assign a new role to an agent  
**Roles Access:** SuperAdmin, CompanyAdmin  
**Request Body:** `{ "roleType": "Manager", "scope": "company|organization|department", "scopeId": "string|null" }`  

---

### DELETE /agents/:id/roles/:roleId
**Purpose:** Revoke a role from an agent  
**Roles Access:** SuperAdmin, CompanyAdmin  

---

### PUT /agents/:id/roles/:roleId/permissions
**Purpose:** Update granular permissions for a specific role assignment  
**Roles Access:** SuperAdmin, CompanyAdmin  
**Request Body:**
```json
{
  "permissions": [{ "module": "shipments", "action": "view", "allowed": true }]
}
```

---

## 7. Company User Management

### GET /company-users
**Purpose:** List company users with pagination  
**Roles Access:** SuperAdmin, CompanyAdmin  
**Query Params:**
- `company_id` (int)
- `organization_id` (int)
- `approval_status` (pending|approved|rejected|suspended)
- `search` (string)
- `page`, `limit`

---

### POST /company-users
**Purpose:** Create a user within a company  
**Roles Access:** SuperAdmin, CompanyAdmin  
**Request Body:**
```json
{
  "company_id": "int",
  "organization_id": "int",
  "role_id": "int",
  "first_name": "string",
  "last_name": "string",
  "email": "string",
  "phone": "string",
  "username": "string",
  "password": "string",
  "status": "active|inactive"
}
```

---

### PUT /company-users/:id
**Purpose:** Update a company user  
**Roles Access:** SuperAdmin, CompanyAdmin  

---

### DELETE /company-users/:id
**Purpose:** Remove a company user  
**Roles Access:** SuperAdmin, CompanyAdmin  

---

### PATCH /company-users/:id/approve
**Purpose:** Approve a pending company user  
**Roles Access:** SuperAdmin, CompanyAdmin  

---

### PATCH /company-users/:id/reject
**Purpose:** Reject a company user  
**Roles Access:** SuperAdmin, CompanyAdmin  

---

### PATCH /company-users/:id/suspend
**Purpose:** Suspend a company user  
**Roles Access:** SuperAdmin, CompanyAdmin  

---

### PATCH /company-users/:id/reactivate
**Purpose:** Reactivate a suspended company user  
**Roles Access:** SuperAdmin, CompanyAdmin  

---

### GET /company-users/pending-approvals
**Purpose:** List all pending company user approvals  
**Roles Access:** SuperAdmin, CompanyAdmin  

---

## 8. Approval Workflow

### GET /approvals
**Purpose:** List all approval requests  
**Roles Access:** SuperAdmin  
**Query Params:**
- `request_type` (company_user|organization_user|company|organization)
- `approval_status` (pending|approved|rejected|suspended)
- `organization_id` (int)
- `company_id` (int)
- `page`, `limit`

---

### GET /approvals/pending
**Purpose:** List only pending approvals  
**Roles Access:** SuperAdmin  
**Query Params:** `request_type` (optional filter)  

---

### POST /approvals/:id/approve
**Purpose:** Approve a pending request  
**Roles Access:** SuperAdmin  
**Request Body:** `{ "notes": "string" }`  

---

### POST /approvals/:id/reject
**Purpose:** Reject a pending request  
**Roles Access:** SuperAdmin  
**Request Body:** `{ "notes": "string" }`  

---

### POST /approvals/:id/suspend
**Purpose:** Suspend an approved request  
**Roles Access:** SuperAdmin  
**Request Body:** `{ "notes": "string" }`  

---

### POST /approvals/:id/reactivate
**Purpose:** Reactivate a suspended request  
**Roles Access:** SuperAdmin  
**Request Body:** `{ "notes": "string" }`  

---

### DELETE /approvals/:id
**Purpose:** Delete an approval request  
**Roles Access:** SuperAdmin  

---

## 9. Shipment Management

### GET /shipments
**Purpose:** List shipments with comprehensive filters  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Dispatcher, Operator, Agent, Staff, CustomsAgent, PortAgent, AuditorReadOnly  
**Query Params:**
- `status` (Pending|Picked Up|In Transit|Out for Delivery|Delivered|Cancelled|Failed|All)
- `serviceType` (Express|Standard|Freight|All)
- `search` (string) — tracking number, customer, sender, receiver, origin, destination
- `dateFrom`, `dateTo` (ISO date)
- `origin`, `destination` (string)
- `driver`, `vehicle` (string)
- `customsStatus` (string)
- `sortBy` (createdAt|estimatedDelivery|status|customerName)
- `sortDir` (asc|desc)
- `role` (string) — filter by role-specific visibility
- `page`, `pageSize`

---

### POST /shipments
**Purpose:** Create a new shipment  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Agent, Staff  
**Request Body:**
```json
{
  "customerId": "string",
  "customerName": "string",
  "serviceType": "Express|Standard|Freight",
  "sender": { "name": "string", "company": "string", "phone": "string", "email": "string", "address": "string", "city": "string", "state": "string", "pincode": "string", "country": "string" },
  "receiver": { "name": "string", "company": "string", "phone": "string", "email": "string", "address": "string", "city": "string", "state": "string", "pincode": "string", "country": "string" },
  "package": { "weight": "number", "weightUnit": "kg|lb", "dimensions": "string", "type": "Box|Envelope|Pallet|Crate|Tube", "pieces": "int", "description": "string", "hazmat": "boolean", "value": "number", "currency": "INR|USD" },
  "route": { "origin": "string", "originCode": "string", "destination": "string", "destinationCode": "string", "distance": "number", "distanceUnit": "km|mi", "transportMode": "Land|Air|Water|Multi-Modal", "estimatedTransitDays": "int" },
  "notes": "string",
  "documents": ["{ id: string, type: string, url: string }"]
}
```

---

### GET /shipments/:id
**Purpose:** Get full shipment details including timeline, tracking events, documents, charges  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Dispatcher, Operator, Agent, Staff, CustomsAgent, PortAgent, AuditorReadOnly  

---

### PATCH /shipments/:id
**Purpose:** Update shipment details  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Dispatcher, Operator, Agent, Staff  

---

### DELETE /shipments/:id
**Purpose:** Delete a shipment  
**Roles Access:** SuperAdmin  

---

### PATCH /shipments/:id/status
**Purpose:** Update shipment status with timeline entry  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Dispatcher, Operator, Agent, Staff, CustomsAgent, PortAgent  
**Request Body:**
```json
{ "status": "In Transit|Delivered|Cancelled|Failed", "notes": "string" }
```
**Auto Behavior:** If status = "Delivered", `actualDelivery` is set automatically. Timeline entry is appended.

---

### PATCH /shipments/bulk-status
**Purpose:** Bulk update status for multiple shipments  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager  
**Request Body:** `{ "ids": ["string"], "status": "In Transit|Delivered" }`  

---

### GET /shipments/stats
**Purpose:** Get aggregated shipment statistics for dashboard  
**Roles Access:** All roles  
**Query Params:** `role` (optional — filter stats by role visibility)  
**Response:**
```json
{
  "total": 2500,
  "pending": 180,
  "pickedUp": 120,
  "inTransit": 580,
  "outForDelivery": 320,
  "delivered": 1200,
  "cancelled": 25,
  "failed": 45,
  "onTimeRate": 92.5
}
```

---

### POST /shipments/:id/assign-driver
**Purpose:** Assign a driver to a shipment  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Dispatcher, Operator  
**Request Body:** `{ "driverId": "string" }`  

---

### POST /shipments/:id/assign-vehicle
**Purpose:** Assign a vehicle to a shipment  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Dispatcher, Operator  
**Request Body:** `{ "vehicleId": "string" }`  

---

### POST /shipments/:id/tracking-event
**Purpose:** Add a tracking event/scan to a shipment  
**Roles Access:** Dispatcher, Operator, Agent  
**Request Body:** `{ "location": "string", "status": "string", "notes": "string", "timestamp": "datetime" }`  

---

## 10. Order Management

### GET /orders
**Purpose:** List orders with filters  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Agent, Staff  
**Query Params:**
- `status` (Draft|Confirmed|Processing|Shipped|Delivered|Returned)
- `paymentStatus` (Pending|Paid|Partial|Refunded)
- `customerId` (string)
- `search` (string) — order ID, customer name
- `page`, `limit`

---

### POST /orders
**Purpose:** Create a new order  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Agent, Staff, CustomerPortal  

---

### GET /orders/:id
**Purpose:** Get order details  
**Roles Access:** All roles with view access  

---

### PATCH /orders/:id
**Purpose:** Update order  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Agent  

---

### DELETE /orders/:id
**Purpose:** Delete an order  
**Roles Access:** SuperAdmin, CompanyAdmin  

---

## 11. Fleet / Vehicle Management

### GET /vehicles
**Purpose:** List all fleet vehicles  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Dispatcher, Operator, AuditorReadOnly  
**Query Params:**
- `status` (Available|On Route|Maintenance|Inactive)
- `type` (Truck|Van|Bike|Tempo|etc.)
- `search` (string) — vehicle ID, license plate, model
- `page`, `limit`

---

### POST /vehicles
**Purpose:** Register a new vehicle  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager  
**Request Body:**
```json
{
  "type": "Truck|Van|Bike|Tempo",
  "licensePlate": "string",
  "model": "string",
  "capacity": "string",
  "assignedDriver": "string|null",
  "currentLocation": "string",
  "status": "Available|On Route|Maintenance|Inactive"
}
```

---

### GET /vehicles/:id
**Purpose:** Get vehicle details with maintenance and fuel history  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Dispatcher  

---

### PATCH /vehicles/:id
**Purpose:** Update vehicle details  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager  

---

### DELETE /vehicles/:id
**Purpose:** Remove a vehicle  
**Roles Access:** SuperAdmin, CompanyAdmin  

---

### POST /vehicles/:id/maintenance
**Purpose:** Add a maintenance record  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager  
**Request Body:**
```json
{ "type": "string", "description": "string", "date": "datetime", "cost": "number", "vendor": "string", "nextScheduled": "datetime" }
```

---

### POST /vehicles/:id/fuel
**Purpose:** Add a fuel log entry  
**Roles Access:** Dispatcher, Operator, Agent  
**Request Body:** `{ "liters": "number", "cost": "number", "station": "string", "odometer": "number", "date": "datetime" }`  

---

### GET /vehicles/fleet-utilization
**Purpose:** Get fleet utilization stats  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager  
**Response:**
```json
{ "byType": [{ "type": "Truck", "total": 5, "active": 4, "maintenance": 1 }], "utilizationRate": 78.3 }
```

---

## 12. Driver Management

### GET /drivers
**Purpose:** List all drivers  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Dispatcher, Operator, AuditorReadOnly  
**Query Params:**
- `status` (Active|On Duty|Off Duty|Suspended)
- `search` (string) — name, driver ID, phone

---

### POST /drivers
**Purpose:** Register a new driver  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager  
**Request Body:**
```json
{
  "name": "string",
  "phone": "string",
  "email": "string",
  "licenseNumber": "string",
  "licenseExpiry": "date",
  "status": "Active|On Duty|Off Duty|Suspended",
  "assignedVehicle": "string|null",
  "documents": [{ "type": "license|id|medical", "url": "string", "verified": false }]
}
```

---

### GET /drivers/:id
**Purpose:** Get driver details with trip history and documents  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Dispatcher  

---

### PATCH /drivers/:id
**Purpose:** Update driver details  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager  

---

### DELETE /drivers/:id
**Purpose:** Remove a driver  
**Roles Access:** SuperAdmin, CompanyAdmin  

---

### GET /drivers/:id/trips
**Purpose:** Get trip history for a driver  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Dispatcher  
**Query Params:** `page`, `limit`, `dateFrom`, `dateTo`  

---

### GET /drivers/performance
**Purpose:** Get driver performance data (ratings, on-time rates, trips completed)  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager  

---

## 13. Customer Management

### GET /customers
**Purpose:** List all customers  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Agent, Staff, AuditorReadOnly  
**Query Params:**
- `type` (Individual|Business)
- `city` (string)
- `search` (string) — name, customer ID, email
- `page`, `limit`

---

### POST /customers
**Purpose:** Create a new customer  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Agent, Staff  

---

### GET /customers/:id
**Purpose:** Get customer details with shipment history and outstanding balance  
**Roles Access:** All roles with view access  

---

### PATCH /customers/:id
**Purpose:** Update customer details  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Agent  

---

### DELETE /customers/:id
**Purpose:** Delete a customer  
**Roles Access:** SuperAdmin, CompanyAdmin  

---

### GET /customers/top
**Purpose:** Get top customers by shipment volume or revenue  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager  

---

## 14. Warehouse Management

### GET /warehouses
**Purpose:** List all warehouses  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Agent, Staff  
**Query Params:**
- `city` (string)
- `search` (string) — name, warehouse ID, city
- `page`, `limit`

---

### POST /warehouses
**Purpose:** Create a new warehouse  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager  

---

### GET /warehouses/:id
**Purpose:** Get warehouse details with inventory  
**Roles Access:** All roles with view access  

---

### PATCH /warehouses/:id
**Purpose:** Update warehouse details  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager  

---

### DELETE /warehouses/:id
**Purpose:** Delete a warehouse  
**Roles Access:** SuperAdmin, CompanyAdmin  

---

### PUT /warehouses/:id/inventory
**Purpose:** Update inventory for a warehouse  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Agent  
**Request Body:**
```json
{ "inventory": [{ "sku": "string", "name": "string", "quantity": "int", "unit": "string", "location": "string", "expiryDate": "date|null" }] }
```

---

### POST /warehouses/transfer
**Purpose:** Transfer inventory between warehouses  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager  
**Request Body:**
```json
{
  "sourceWarehouseId": "string",
  "destinationWarehouseId": "string",
  "items": [{ "sku": "string", "quantity": "int" }]
}
```

---

### GET /warehouses/low-stock
**Purpose:** Get all items with low stock across warehouses  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Agent  

---

### POST /warehouses/:id/inbound
**Purpose:** Log an inbound shipment to warehouse  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Agent, Staff  
**Request Body:**
```json
{ "reference": "string", "items": [{ "sku": "string", "quantity": "int" }], "notes": "string" }
```

---

### POST /warehouses/:id/outbound
**Purpose:** Log an outbound dispatch from warehouse  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Agent, Staff  
**Request Body:**
```json
{ "reference": "string", "items": [{ "sku": "string", "quantity": "int" }], "destination": "string", "notes": "string" }
```

---

### POST /warehouses/:id/cycle-count
**Purpose:** Submit cycle count results  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Agent  
**Request Body:**
```json
{ "counts": [{ "sku": "string", "expectedQuantity": "int", "actualQuantity": "int", "discrepancy": "int" }], "notes": "string" }
```

---

### POST /warehouses/:id/damage
**Purpose:** Report damaged inventory  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Agent, Staff  
**Request Body:** `{ "sku": "string", "quantity": "int", "description": "string", "reportedBy": "string" }`  

---

## 15. Finance & Invoice Management

### GET /invoices
**Purpose:** List all invoices  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Agent, Staff, AuditorReadOnly, CustomerPortal  
**Query Params:**
- `status` (Unpaid|Paid|Overdue|Cancelled)
- `customerId` (string)
- `search` (string) — invoice ID, customer name
- `page`, `limit`

---

### POST /invoices
**Purpose:** Generate a new invoice  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Agent  
**Request Body:**
```json
{
  "customerId": "string",
  "customerName": "string",
  "shipmentId": "string",
  "items": [{ "description": "string", "quantity": "int", "unitPrice": "number", "total": "number" }],
  "subtotal": "number",
  "tax": "number",
  "total": "number",
  "currency": "INR|USD",
  "dueDate": "date"
}
```

---

### GET /invoices/:id
**Purpose:** Get invoice details  
**Roles Access:** All roles with view access  

---

### PATCH /invoices/:id
**Purpose:** Update invoice details  
**Roles Access:** SuperAdmin, CompanyAdmin  

---

### PATCH /invoices/:id/status
**Purpose:** Update invoice payment status  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Agent  
**Request Body:** `{ "status": "Paid|Overdue|Cancelled" }`  

---

### DELETE /invoices/:id
**Purpose:** Delete an invoice  
**Roles Access:** SuperAdmin, CompanyAdmin  

---

### GET /finance/revenue
**Purpose:** Get monthly revenue data  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, AuditorReadOnly  
**Response:** `[{ "month": "Jan", "revenue": 1750000, "expenses": 1080000 }]`  

---

### GET /finance/expenses
**Purpose:** Get expense breakdown  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, AuditorReadOnly  
**Response:** `{ "fuel": 250000, "maintenance": 150000, "staff": 450000, "other": 80000 }`  

---

### GET /finance/revenue-by-region
**Purpose:** Get revenue distribution by region  
**Roles Access:** SuperAdmin, CompanyAdmin  

---

### GET /finance/subscription-billing
**Purpose:** Get subscription and billing info  
**Roles Access:** SuperAdmin  

---

### GET /finance/taxes
**Purpose:** Get tax reports and summaries  
**Roles Access:** SuperAdmin, AuditorReadOnly  

---

### POST /payments
**Purpose:** Record a payment against an invoice  
**Roles Access:** SuperAdmin, CompanyAdmin, Agent, CustomerPortal  
**Request Body:**
```json
{ "invoiceId": "string", "amount": "number", "method": "cash|bank_transfer|card|upi", "reference": "string", "date": "datetime" }
```

---

## 16. Container Management

### GET /containers
**Purpose:** List all containers  
**Roles Access:** SuperAdmin, CompanyAdmin, PortAgent, Manager  
**Query Params:**
- `status` (Empty|Loaded|Unloading|In Transit|Customs Hold|Damaged|All)
- `size` (20ft|40ft|40ft HC|45ft|All)
- `vessel` (string)
- `yard` (string)
- `customsHold` (boolean)
- `damaged` (boolean)
- `search` (string) — container ID, vessel, origin, destination
- `page`, `limit`

---

### POST /containers
**Purpose:** Register a new container  
**Roles Access:** SuperAdmin, PortAgent  
**Request Body:**
```json
{
  "containerId": "string",
  "size": "20ft|40ft|40ft HC|45ft",
  "type": "Dry Van|Reefer|Open Top|Flat Rack|Tank",
  "vessel": "string",
  "voyage": "string",
  "origin": "string",
  "destination": "string",
  "yard": "string",
  "operator": "string",
  "sealNumber": "string",
  "weight": "number",
  "status": "Empty|Loaded|Unloading|In Transit|Customs Hold|Damaged"
}
```

---

### GET /containers/:id
**Purpose:** Get container details with event history  
**Roles Access:** SuperAdmin, PortAgent, CompanyAdmin  

---

### PATCH /containers/:id
**Purpose:** Update container details  
**Roles Access:** SuperAdmin, PortAgent  

---

### DELETE /containers/:id
**Purpose:** Remove a container record  
**Roles Access:** SuperAdmin  

---

### POST /containers/:id/events
**Purpose:** Add a lifecycle event to a container  
**Roles Access:** PortAgent, Operator  
**Request Body:**
```json
{ "eventType": "Gate In|Gate Out|Loaded|Unloaded|Inspection|Customs Hold|Released", "location": "string", "timestamp": "datetime", "notes": "string" }
```

---

## 17. Customs Management

### GET /customs
**Purpose:** List customs declarations  
**Roles Access:** SuperAdmin, CustomsAgent, AuditorReadOnly  
**Query Params:**
- `status` (string) — Pending, Hold, Cleared, Released, Rejected
- `hsCode` (string)
- `search` (string) — declaration number, HS code, examiner
- `page`, `limit`

---

### POST /customs
**Purpose:** Submit a new customs declaration  
**Roles Access:** CustomsAgent  
**Request Body:**
```json
{
  "shipmentId": "string",
  "declarationNumber": "string",
  "hsCode": "string",
  "goodsDescription": "string",
  "originCountry": "string",
  "destinationCountry": "string",
  "declaredValue": "number",
  "currency": "USD|INR",
  "importer": { "name": "string", "address": "string" },
  "exporter": { "name": "string", "address": "string" },
  "documents": [{ "type": "invoice|coo|bol|packing_list", "url": "string" }],
  "notes": "string"
}
```

---

### GET /customs/shipment/:shipmentId
**Purpose:** Get customs record for a specific shipment  
**Roles Access:** SuperAdmin, CustomsAgent, CompanyAdmin  

---

### PATCH /customs/:id/status
**Purpose:** Update customs status (clear, hold, reject)  
**Roles Access:** CustomsAgent  
**Request Body:**
```json
{ "status": "Cleared|Hold|Released|Rejected", "notes": "string" }
```
**Auto Behavior:** If status = "Cleared" or "Released", `clearedAt` timestamp is set.

---

### GET /customs/hs-codes
**Purpose:** Search/list HS codes  
**Roles Access:** CustomsAgent, CompanyAdmin, Manager  
**Query Params:** `search`, `chapter` (e.g. "84")  

---

### GET /customs/restrictions
**Purpose:** Get restricted/prohibited items list  
**Roles Access:** CustomsAgent, CompanyAdmin  

---

## 18. Port Management

### GET /port/dashboard-stats
**Purpose:** Get port operational dashboard stats  
**Roles Access:** PortAgent, SuperAdmin  
**Response:**
```json
{
  "totalContainers": 120,
  "loaded": 45,
  "unloading": 12,
  "onHold": 5,
  "damaged": 2,
  "customsPending": 8,
  "customsCleared": 30
}
```

---

### GET /port/vessels
**Purpose:** List vessels at port  
**Roles Access:** PortAgent, SuperAdmin  
**Query Params:** `search`, `status` (Docked|Arriving|Departed), `page`, `limit`  

---

### POST /port/vessels
**Purpose:** Register vessel arrival  
**Roles Access:** PortAgent  
**Request Body:**
```json
{ "name": "string", "imo": "string", "callSign": "string", "flag": "string", "length": "number", "grossTonnage": "number", "eta": "datetime", "berth": "string", "agent": "string", "cargoType": "string", "status": "Docked|Arriving|Departed" }
```

---

### GET /port/berths
**Purpose:** List berth availability and assignments  
**Roles Access:** PortAgent  

---

### POST /port/berths/assign
**Purpose:** Assign a vessel to a berth  
**Roles Access:** PortAgent  
**Request Body:** `{ "vesselId": "string", "berthId": "string", "arrivalTime": "datetime", "departureTime": "datetime" }`  

---

### GET /port/manifests
**Purpose:** List cargo manifests  
**Roles Access:** PortAgent, CustomsAgent  

---

### GET /port/cargo-log
**Purpose:** Get cargo movement log  
**Roles Access:** PortAgent  

---

### GET /port/flights
**Purpose:** List cargo flights at airport  
**Roles Access:** PortAgent (Air Freight)  

---

### GET /port/charges
**Purpose:** Get port handling charges and tariffs  
**Roles Access:** PortAgent, Finance  

---

## 19. Transport Configuration

### GET /transport-types
**Purpose:** List transport modes (Land, Air, Water) for a company  
**Roles Access:** SuperAdmin, CompanyAdmin  
**Query Params:** `companyId` (required)  

---

### POST /transport-types
**Purpose:** Create a new transport mode  
**Roles Access:** SuperAdmin, CompanyAdmin  
**Request Body:** `{ "companyId": "string", "name": "Land|Air|Water" }`  

---

### DELETE /transport-types/:id
**Purpose:** Delete a transport mode  
**Roles Access:** SuperAdmin, CompanyAdmin  

---

### GET /transport-categories
**Purpose:** List transport categories for a company  
**Roles Access:** SuperAdmin, CompanyAdmin  
**Query Params:** `companyId` (required), `transportTypeId` (optional)  

---

### POST /transport-categories
**Purpose:** Create a transport category  
**Roles Access:** SuperAdmin, CompanyAdmin  
**Request Body:**
```json
{
  "companyId": "string",
  "transportTypeId": "string",
  "name": "string",
  "description": "string",
  "specifications": {},
  "capacity": "number",
  "capacityUnit": "kg|ton|m3",
  "maxSpeed": "number|null",
  "fuelType": "string|null"
}
```

---

### PUT /transport-categories/:id
**Purpose:** Update a transport category  
**Roles Access:** SuperAdmin, CompanyAdmin  

---

### DELETE /transport-categories/:id
**Purpose:** Delete a transport category  
**Roles Access:** SuperAdmin, CompanyAdmin  

---

### GET /transport-items
**Purpose:** List transport items under a category  
**Roles Access:** SuperAdmin, CompanyAdmin  
**Query Params:** `companyId` (required), `categoryId` (optional)  

---

### POST /transport-items
**Purpose:** Create a transport item  
**Roles Access:** SuperAdmin, CompanyAdmin  
**Request Body:**
```json
{
  "companyId": "string",
  "categoryId": "string",
  "name": "string",
  "description": "string",
  "quantity": "int",
  "unit": "string",
  "specification": {},
  "price": "number"
}
```

---

### PUT /transport-items/:id
**Purpose:** Update a transport item  
**Roles Access:** SuperAdmin, CompanyAdmin  

---

### PUT /transport-items/:id/quantity
**Purpose:** Update item quantity only  
**Roles Access:** SuperAdmin, CompanyAdmin  
**Request Body:** `{ "quantity": "int" }`  

---

### DELETE /transport-items/:id
**Purpose:** Delete a transport item  
**Roles Access:** SuperAdmin, CompanyAdmin  

---

## 20. Company Types

### GET /company-types
**Purpose:** List company types with pagination  
**Roles Access:** SuperAdmin  
**Query Params:** `page`, `limit`  

---

### GET /company-types/list
**Purpose:** Get simplified company type list for dropdowns  
**Roles Access:** SuperAdmin  
**Response:** `[{ "id": "int", "name": "string", "slug": "string", "description": "string" }]`  

---

## 21. Notifications

### GET /notifications
**Purpose:** List notifications for the current user  
**Roles Access:** All roles  
**Query Params:**
- `read` (boolean)
- `type` (string)
- `page`, `limit`

---

### PATCH /notifications/:id/read
**Purpose:** Mark a notification as read  
**Roles Access:** All roles  

---

### POST /notifications/read-all
**Purpose:** Mark all notifications as read  
**Roles Access:** All roles  

---

### GET /notifications/unread-count
**Purpose:** Get unread notification count  
**Roles Access:** All roles  

---

### DELETE /notifications/:id
**Purpose:** Delete a notification  
**Roles Access:** All roles  

---

## 22. Activity & Audit Logs

### GET /activities
**Purpose:** List activity logs  
**Roles Access:** SuperAdmin, AuditorReadOnly  
**Query Params:**
- `shipmentId` (string)
- `userId` (string)
- `action` (string)
- `dateFrom`, `dateTo`
- `page`, `limit`

---

### GET /audit/access-logs
**Purpose:** List user access/login logs  
**Roles Access:** SuperAdmin, AuditorReadOnly  
**Query Params:** `userId`, `dateFrom`, `dateTo`, `ip`, `page`, `limit`  

---

### GET /audit/error-logs
**Purpose:** List system error logs  
**Roles Access:** SuperAdmin, AuditorReadOnly  
**Query Params:** `level` (error|warn|info), `dateFrom`, `dateTo`, `page`, `limit`  

---

### GET /audit/system-activity
**Purpose:** View system-wide activity timeline  
**Roles Access:** SuperAdmin, AuditorReadOnly  

---

## 23. Reports & Analytics

### GET /reports/shipments
**Purpose:** Comprehensive shipment report  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Agent, AuditorReadOnly  
**Query Params:** `dateFrom`, `dateTo`  
**Response:**
```json
{
  "summary": { "total": 2500, "growth": 12.5, "deliveryRate": 94.5 },
  "byStatus": [{ "name": "Delivered", "value": 1200 }],
  "byRegion": [{ "name": "West", "value": 4500 }],
  "trends": [{ "date": "2024-12-17", "shipments": 45 }]
}
```

---

### GET /reports/drivers
**Purpose:** Driver performance report  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager  
**Query Params:** `dateFrom`, `dateTo`  
**Response:**
```json
{
  "totalDrivers": 22,
  "activeDrivers": 18,
  "averageRating": 4.5,
  "totalTrips": 345,
  "performanceData": [{ "name": "Rajesh", "trips": 45, "rating": 4.8, "onTimeRate": 96.2 }]
}
```

---

### GET /reports/fleet
**Purpose:** Fleet utilization and performance report  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager  
**Query Params:** `dateFrom`, `dateTo`  
**Response:**
```json
{
  "summary": { "utilization": 78.3 },
  "byStatus": [{ "name": "Available", "value": 5 }],
  "byType": [{ "name": "Truck", "value": 5 }],
  "performance": [{ "date": "2024-12-17", "trips": 15, "distance": 350 }]
}
```

---

### GET /reports/revenue
**Purpose:** Revenue and financial report  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, AuditorReadOnly  
**Query Params:** `dateFrom`, `dateTo`  
**Response:**
```json
{
  "summary": { "total": 8540000, "growth": 15.3 },
  "trends": [{ "date": "Jan", "revenue": 1750000, "expenses": 1080000 }],
  "byService": [{ "name": "Express", "value": 3416000 }],
  "expenses": [{ "name": "Fuel", "value": 500000 }]
}
```

---

### GET /reports/customers
**Purpose:** Customer analytics report  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager, Agent  
**Query Params:** `dateFrom`, `dateTo`  
**Response:**
```json
{
  "totalCustomers": 32,
  "businessCustomers": 20,
  "individualCustomers": 12,
  "totalOutstanding": 450000,
  "topCustomers": [{ "name": "Tech Solutions", "shipments": 45, "type": "Business" }]
}
```

---

### GET /reports/sla
**Purpose:** SLA compliance and breach report  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager  

---

### GET /reports/platform
**Purpose:** Platform-wide analytics for SuperAdmin  
**Roles Access:** SuperAdmin  

---

### GET /reports/warehouse
**Purpose:** Warehouse performance and inventory report  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager  

---

### GET /reports/performance
**Purpose:** Overall operational performance KPIs  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager  

---

### GET /reports/carrier-performance
**Purpose:** Carrier/service provider performance evaluation  
**Roles Access:** SuperAdmin, CompanyAdmin, Manager  

---

## 24. Portal — Customer-Facing APIs

### Bookings

#### GET /portal/bookings
**Purpose:** List customer's bookings  
**Roles Access:** CustomerPortal  
**Query Params:** `status` (Draft|Confirmed|In Transit|Delivered|Cancelled|All), `search`, `page`, `limit`  

#### POST /portal/bookings
**Purpose:** Create a new booking request  
**Roles Access:** CustomerPortal  
**Request Body:**
```json
{
  "serviceType": "Express|Standard|Freight",
  "pickupAddress": "string",
  "deliveryAddress": "string",
  "packageWeight": "number",
  "packageDimensions": "string",
  "packageType": "Box|Envelope|Pallet|Crate|Tube",
  "pieces": "int",
  "description": "string",
  "notes": "string"
}
```

#### GET /portal/bookings/:id
**Purpose:** Get booking details with timeline  
**Roles Access:** CustomerPortal  

---

### Tracking

#### GET /portal/tracking/:trackingNumber
**Purpose:** Get tracking events for a shipment  
**Roles Access:** CustomerPortal (public tracking also available)  
**Response:**
```json
[{ "location": "Mumbai Hub", "status": "In Transit", "timestamp": "2025-01-15T10:30:00Z", "description": "Package arrived at sorting facility" }]
```

#### GET /portal/tracking/search
**Purpose:** Search tracking numbers by query  
**Roles Access:** CustomerPortal (public)  
**Query Params:** `q` (string)  

---

### Support Tickets

#### GET /portal/support
**Purpose:** List support tickets  
**Roles Access:** CustomerPortal  
**Query Params:** `status`, `category`, `search`, `page`, `limit`  

#### POST /portal/support
**Purpose:** Create a new support ticket  
**Roles Access:** CustomerPortal  
**Request Body:**
```json
{ "subject": "string", "description": "string", "category": "Shipping|Billing|Technical|Other", "priority": "Low|Normal|High|Urgent", "attachments": ["file_urls"] }
```

#### GET /portal/support/:id
**Purpose:** Get ticket details with message history  
**Roles Access:** CustomerPortal  

#### POST /portal/support/:id/messages
**Purpose:** Add a message/reply to a ticket  
**Roles Access:** CustomerPortal  
**Request Body:** `{ "message": "string", "attachments": ["file_urls"] }`  

---

### Documents

#### GET /portal/documents
**Purpose:** List customer's documents  
**Roles Access:** CustomerPortal  
**Query Params:** `type` (invoice|bol|coo|packing_list|pod|insurance), `page`, `limit`  

#### POST /portal/documents/upload
**Purpose:** Upload a document  
**Roles Access:** CustomerPortal  
**Request Body:** Multipart file upload + metadata  

#### GET /portal/documents/:id
**Purpose:** Download/view a document  
**Roles Access:** CustomerPortal  

---

### Payments

#### GET /portal/payments
**Purpose:** List payment history  
**Roles Access:** CustomerPortal  
**Query Params:** `page`, `limit`  

#### POST /portal/payments
**Purpose:** Make a payment  
**Roles Access:** CustomerPortal  
**Request Body:** `{ "invoiceId": "string", "amount": "number", "method": "card|upi|bank_transfer", "cardDetails": {} }`  

---

### Invoices

#### GET /portal/invoices
**Purpose:** List invoices for the customer  
**Roles Access:** CustomerPortal  
**Query Params:** `status`, `page`, `limit`  

#### GET /portal/invoices/:id
**Purpose:** Get invoice details  
**Roles Access:** CustomerPortal  

---

### Notifications

#### GET /portal/notifications
**Purpose:** List customer notifications  
**Roles Access:** CustomerPortal  
**Query Params:** `read`, `page`, `limit`  

---

## 25. File & Document Upload

### POST /upload
**Purpose:** Upload a single file (image, PDF, document)  
**Roles Access:** All authenticated roles  
**Request Body:** Multipart form-data with file  
**Response:** `{ "url": "string", "filename": "string", "size": "int", "mimeType": "string" }`  

---

### POST /upload/multiple
**Purpose:** Upload multiple files at once  
**Roles Access:** All authenticated roles  
**Request Body:** Multipart form-data with multiple files  
**Response:** `[{ "url": "string", "filename": "string", "size": "int", "mimeType": "string" }]`  

---

### POST /documents/verify
**Purpose:** Submit a document for verification  
**Roles Access:** CompanyAdmin, CustomsAgent  
**Request Body:** `{ "documentType": "license|id|registration|certificate", "documentUrl": "string", "notes": "string" }`  

---

### PATCH /documents/:id/verify
**Purpose:** Approve or reject a document verification  
**Roles Access:** SuperAdmin, CustomsAgent  
**Request Body:** `{ "verified": true, "verifiedBy": "string", "notes": "string" }`  

---

## 26. System Settings & Config

### GET /settings
**Purpose:** Get all system settings  
**Roles Access:** SuperAdmin  

---

### PUT /settings
**Purpose:** Update system settings  
**Roles Access:** SuperAdmin  

---

### GET /settings/security
**Purpose:** Get security configuration (2FA, password policy, session timeout)  
**Roles Access:** SuperAdmin  

---

### PUT /settings/security
**Purpose:** Update security configuration  
**Roles Access:** SuperAdmin  

---

### POST /settings/test-email
**Purpose:** Test email configuration  
**Roles Access:** SuperAdmin  
**Request Body:** `{ "recipient": "string" }`  

---

## 27. Integrations & API Config

### GET /integrations
**Purpose:** List all third-party integrations  
**Roles Access:** SuperAdmin  

---

### POST /integrations
**Purpose:** Add a new integration  
**Roles Access:** SuperAdmin  
**Request Body:** `{ "name": "string", "type": "tracking|payment|sms|email|shipping", "config": {}, "enabled": true }`  

---

### PUT /integrations/:id
**Purpose:** Update integration configuration  
**Roles Access:** SuperAdmin  

---

### DELETE /integrations/:id
**Purpose:** Remove an integration  
**Roles Access:** SuperAdmin  

---

### GET /integrations/:id/test
**Purpose:** Test an integration connection  
**Roles Access:** SuperAdmin  

---

### GET /api-config
**Purpose:** List API keys and webhook configurations  
**Roles Access:** SuperAdmin  

---

### POST /api-config/keys
**Purpose:** Generate a new API key  
**Roles Access:** SuperAdmin  
**Request Body:** `{ "name": "string", "permissions": ["shipments:read", "tracking:read"] }`  

---

### DELETE /api-config/keys/:id
**Purpose:** Revoke an API key  
**Roles Access:** SuperAdmin  

---

### POST /api-config/webhooks
**Purpose:** Register a webhook endpoint  
**Roles Access:** SuperAdmin  
**Request Body:** `{ "url": "string", "events": ["shipment.created", "shipment.status_changed"], "secret": "string" }`  

---

### DELETE /api-config/webhooks/:id
**Purpose:** Remove a webhook  
**Roles Access:** SuperAdmin  

---

## Common Response Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request — validation error |
| 401 | Unauthorized — missing/invalid token |
| 403 | Forbidden — insufficient permissions |
| 404 | Not Found |
| 409 | Conflict — duplicate entry |
| 422 | Unprocessable Entity — validation failed |
| 429 | Too Many Requests — rate limit exceeded |
| 500 | Internal Server Error |

## Pagination Meta Format

Every list endpoint returns:
```json
{
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

## Role Access Summary

| Role | Prefix | Dashboard Route | Access Level |
|------|--------|----------------|--------------|
| SuperAdmin | `/admin` | `/admin/dashboard` | Full system access |
| CompanyAdmin | `/company` | `/company/dashboard` | Company-level management |
| Manager | `/manager` | `/manager/dashboard` | Operational management |
| Dispatcher | `/ops` | `/ops/dashboard` | Dispatch & fleet ops |
| Operator | `/ops` | `/ops/dashboard` | Dispatch & fleet ops (same as Dispatcher) |
| Agent | `/agent` | `/agent/dashboard` | Warehouse/Driver/Finance ops |
| Staff | `/staff` | `/staff/dashboard` | Limited operational tasks |
| CustomsAgent | `/customs` | `/customs/dashboard` | Customs & compliance |
| PortAgent | `/port` | `/port/dashboard` | Port & vessel ops |
| CustomerPortal | `/portal` | `/portal/dashboard` | Customer self-service |
| AuditorReadOnly | `/audit` | `/audit/dashboard` | Read-only audit access |
