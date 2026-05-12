# LogisticPRO Phase 5 - Login & Access Control Test Guide

## Overview
This document provides a comprehensive testing guide for verifying that all user roles can successfully log in and access their respective dashboards with proper role-based access control.

## Test Environment
- **Authentication**: Mock authentication via `authService.ts`
- **Password Storage**: In-memory mock users (do NOT use in production)
- **Session**: LocalStorage-based token management
- **Database**: Mock data from `mockData.ts`

---

## Test Users Available

### 1. SuperAdmin
- **Username**: `superadmin`
- **Password**: `admin123`
- **Expected Dashboard**: `/admin/dashboard` (redirect from /dashboard)
- **Access Level**: Complete platform access
- **Can Access**:
  - All companies management
  - All organizations management
  - All agents management
  - Transport configuration
  - All operational modules
  - System settings and reporting

### 2. Company Admin
- **Username**: `company_admin`
- **Password**: `admin123`
- **Expected Dashboard**: `/admin/company`
- **Access Level**: Full company control
- **Can Access**:
  - Company profile and settings
  - All organizations in company
  - All agents in company
  - Transport management for company
  - All operational modules
  - Financial reports
  - User management for company

### 3. Manager
- **Username**: `ops_manager`
- **Password**: `ops123`
- **Expected Dashboard**: `/dashboard` (default manager view)
- **Access Level**: Team and operation management
- **Can Access**:
  - Team dashboard
  - Shipments (view, create, edit)
  - Orders management
  - Fleet management
  - Dispatch operations
  - Warehouse management
  - Agent management (view)
  - Reports (view and create)
  - Cannot access: Company settings, financial reports, user management

### 4. Dispatcher
- **Username**: `dispatch`
- **Password**: `dispatch123`
- **Expected Dashboard**: Dispatch-focused view
- **Access Level**: Dispatch operations
- **Can Access**:
  - Dispatch dashboard
  - Shipment tracking and updates
  - Vehicle/driver management
  - Route management
  - Cannot access: Finance, warehousing, company settings

### 5. Agent (Warehouse)
- **Username**: `warehouse`
- **Password**: `warehouse123`
- **Expected Dashboard**: Agent operations dashboard
- **Access Level**: Operational tasks
- **Can Access**:
  - Shipments (view, create, edit)
  - Orders (view, create, edit)
  - Warehouse operations
  - Customer management
  - Financial reports (view)
  - Cannot access: Fleet management, dispatch, company settings

### 6. Agent (Driver)
- **Username**: `driver01`
- **Password**: `driver123`
- **Expected Dashboard**: Agent operations dashboard
- **Access Level**: Operational tasks
- **Can Access**: Same as Warehouse Agent

### 7. Agent (Finance)
- **Username**: `finance`
- **Password**: `finance123`
- **Expected Dashboard**: Agent operations dashboard
- **Access Level**: Operational tasks
- **Can Access**: Same as other Agents

### 8. Staff
- **Username**: `support`
- **Password**: `support123`
- **Expected Dashboard**: Limited operational dashboard
- **Access Level**: Basic operational access
- **Can Access**:
  - View shipments
  - View/create orders
  - Warehouse operations (limited)
  - Customer management (limited)
  - Cannot access: Fleet, dispatch, financial, management features

### 9. Operator
- **Username**: `operator01`
- **Password**: `operator123`
- **Expected Dashboard**: Dispatch/routing operations
- **Access Level**: Transport operations
- **Can Access**:
  - Dispatch operations
  - Vehicle tracking
  - Shipment routing
  - Cannot access: Warehouse, finance, company settings

### 10. Additional Staff
- **Username**: `staff01`
- **Password**: `staff123`
- **Expected Dashboard**: Limited operational dashboard
- **Access Level**: Basic operational access
- **Can Access**: Same as other Staff

---

## Login Test Procedure

### Step 1: Navigate to Login Page
```
URL: http://localhost:3000/login
```

### Step 2: View Available Credentials
The login page displays all demo credentials in an interactive card layout. You can:
- Click on any credential card to pre-fill the form
- Manually enter credentials
- View role descriptions

### Step 3: Login Test for Each User

#### Test Case: SuperAdmin Login
1. Click or enter: `superadmin` / `admin123`
2. Click "Sign In"
3. **Expected Result**:
   - Login succeeds
   - Redirects to `/admin/dashboard`
   - Page displays SuperAdmin-specific KPIs:
     - Total Companies (2)
     - Active Organizations (2)
     - Total Agents (3+)
     - System Health
   - Sidebar shows: Companies, Organizations, fleet, reports, users, settings

#### Test Case: Company Admin Login
1. Enter: `company_admin` / `admin123`
2. Click "Sign In"
3. **Expected Result**:
   - Login succeeds
   - Redirects to `/admin/company`
   - Page displays:
     - Company profile information
     - Organization overview
     - Agent distribution chart
     - Department performance metrics
   - Sidebar shows company-specific options

#### Test Case: Manager Login
1. Enter: `ops_manager` / `ops123`
2. Click "Sign In"
3. **Expected Result**:
   - Login succeeds
   - Redirects to `/dashboard`
   - Page displays team operations dashboard
   - Shows performance metrics and team activity
   - Cannot access company management features

#### Test Case: Dispatcher Login
1. Enter: `dispatch` / `dispatch123`
2. Click "Sign In"
3. **Expected Result**:
   - Login succeeds
   - Redirects to `/dashboard`
   - Dashboard shows dispatch-focused view
   - Displays active shipments and routes
   - Dispatch menu is highlighted

#### Test Case: Agent Logins
1. Try each agent username (warehouse, driver01, finance)
2. Enter corresponding password
3. **Expected Result for Each**:
   - Login succeeds
   - Redirects to `/dashboard`
   - Agent dashboard displays
   - Shows assigned shipments and tasks
   - Limited menu based on agent type

#### Test Case: Staff Login
1. Enter: `support` / `support123`
2. Click "Sign In"
3. **Expected Result**:
   - Login succeeds
   - Redirects to `/dashboard`
   - Staff dashboard displays
   - Limited menu and features visible

#### Test Case: Operator Login
1. Enter: `operator01` / `operator123`
2. Click "Sign In"
3. **Expected Result**:
   - Login succeeds
   - Redirects to `/dashboard`
   - Operator/dispatch dashboard displays

---

## Access Control Verification Tests

### Test 1: Role-Based Sidebar Menu
After logging in as each user, verify:

| Feature | SuperAdmin | CompanyAdmin | Manager | Dispatcher | Agent | Staff | Operator |
|---------|:-----------:|:----------:|:-------:|:----------:|:-----:|:-----:|:--------:|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Companies | ✓ | × | × | × | × | × | × |
| Organizations | ✓ | ✓ | × | × | × | × | × |
| Agents | ✓ | ✓ | ✓ | × | × | × | × |
| Transport | ✓ | ✓ | × | × | × | × | × |
| Shipments | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Orders | ✓ | ✓ | ✓ | × | ✓ | ✓ | × |
| Fleet | ✓ | ✓ | ✓ | ✓ | × | × | × |
| Drivers | ✓ | ✓ | ✓ | ✓ | × | × | × |
| Dispatch | ✓ | ✓ | ✓ | ✓ | × | × | ✓ |
| Warehouse | ✓ | ✓ | ✓ | × | ✓ | ✓ | × |
| Customers | ✓ | ✓ | ✓ | × | ✓ | ✓ | × |
| Finance | ✓ | ✓ | × | × | ✓ | ✓ | × |
| Reports | ✓ | ✓ | ✓ | × | ✓ | ✓ | × |
| Users | ✓ | ✓ | × | × | × | × | × |
| Settings | ✓ | ✓ | ✓ | × | × | × | × |

### Test 2: Direct URL Access Control
Attempt to access pages directly via URL for each user type:

#### SuperAdmin Tests
- ✓ `/admin/dashboard` - Should load
- ✓ `/companies` - Should load
- ✓ `/organizations` - Should load
- ✓ `/agents` - Should load
- ✓ `/transport/land` - Should load

#### CompanyAdmin Tests
- ✓ `/admin/company` - Should load
- ✓ `/organizations` - Should load
- ✓ `/agents` - Should load
- ✗ `/companies` - Should redirect to `/dashboard`
- ✓ `/shipments` - Should load

#### Manager Tests
- ✓ `/dashboard` - Should load
- ✓ `/shipments` - Should load
- ✓ `/orders` - Should load
- ✗ `/companies` - Should redirect to `/dashboard`
- ✗ `/transport/land` - Should redirect to `/dashboard`

#### Agent Tests
- ✓ `/dashboard` - Should load
- ✓ `/shipments` - Should load
- ✗ `/fleet` - Should redirect to `/dashboard`
- ✗ `/dispatch` - Should redirect to `/dashboard`

#### Staff Tests
- ✓ `/dashboard` - Should load
- ✓ `/shipments` - Should load
- ✓ `/warehouse` - Should load
- ✗ `/fleet` - Should redirect to `/dashboard`
- ✗ `/agents` - Should redirect to `/dashboard`

---

## Session Management Tests

### Test 1: Login Persistence
1. Login as any user
2. Refresh the page (F5 or Cmd+R)
3. **Expected Result**: User remains logged in
4. Check localStorage for `user` and `token` keys

### Test 2: Logout
1. Login as any user
2. Click profile dropdown (top-right)
3. Click "Logout"
4. **Expected Result**:
   - User redirected to `/login`
   - localStorage cleared
   - Cannot access protected routes

### Test 3: Session Timeout
1. Login as any user
2. Wait 30+ minutes (or manually clear localStorage)
3. Attempt to access protected route
4. **Expected Result**: Redirect to `/login`

---

## Error Handling Tests

### Test 1: Invalid Credentials
1. Enter: `superadmin` / `wrongpassword`
2. **Expected Result**:
   - Error message: "Invalid username or password"
   - Remains on login page
   - Form clears password field

### Test 2: Non-existent User
1. Enter: `nonexistent` / `password123`
2. **Expected Result**:
   - Error message: "Invalid username or password"
   - Remains on login page

### Test 3: Unauthorized Direct Access
1. Login as `staff` user
2. Attempt to access `/companies` URL directly
3. **Expected Result**:
   - Alert shows "You do not have permission to access this page"
   - Redirects to `/dashboard` after 2 seconds

---

## Permission Matrix Verification

### Test 1: View Permission Matrix
1. Login as `company_admin`
2. Navigate to `/agents/permissions`
3. **Expected Result**:
   - Permission matrix displays for each role
   - Shows all modules and actions
   - Can toggle permissions (if editable)
   - Color-coded by action type

### Test 2: Role-Specific Permissions
1. View permission matrix
2. Compare displayed permissions with `data/permissions-matrix.ts`
3. **Expected Result**: Permissions match defined matrix

---

## Multi-Tenancy Tests

### Test 1: Company Isolation
1. Login as `company_admin` (companyId: cmp-001)
2. View organizations list
3. **Expected Result**: Only shows organizations from cmp-001
4. Logout and login as different company user
5. **Expected Result**: Different data sets visible

### Test 2: Organization Filtering
1. Login as manager in org-001
2. View shipments
3. **Expected Result**: Shows shipments from org-001
4. Cannot view shipments from org-002

---

## Browser Developer Tools Verification

### Check LocalStorage
```javascript
// In browser console
console.log(localStorage.getItem('user'));
console.log(localStorage.getItem('token'));
```
**Expected Result**: Valid JSON user object with role and company context

### Check AuthContext
```javascript
// In React DevTools, inspect AuthContext
- user: User object with role, companyId, organizationId
- isAuthenticated: true
- isSuperAdmin: boolean (true for SuperAdmin)
- isCompanyAdmin: boolean (true for CompanyAdmin)
- canManageAgents: boolean
- allowedMenuItems: string[] (filtered by role)
```

---

## Checklist for Phase 5 Completion

- [ ] All 10 test users can log in successfully
- [ ] SuperAdmin redirects to `/admin/dashboard`
- [ ] CompanyAdmin redirects to `/admin/company`
- [ ] Each role has correct sidebar menu items
- [ ] Direct URL access control works for all roles
- [ ] Permission matrix displays correctly
- [ ] Session persistence works (refresh page)
- [ ] Logout clears session
- [ ] Invalid credentials show error message
- [ ] Unauthorized access shows alert and redirects
- [ ] Multi-tenancy filters data correctly
- [ ] All console logs show correct context data
- [ ] No console errors for successful logins
- [ ] Mobile responsive login page works
- [ ] Dark mode works on login page

---

## Common Issues & Troubleshooting

### Issue: Login loop (keeps redirecting to login)
**Solution**: Check `AuthContext.useEffect` dependency array and localStorage key names

### Issue: User data not persisting after refresh
**Solution**: Verify localStorage is being set in `authService.login()` and read in `AuthContext.useEffect`

### Issue: Wrong dashboard loading after login
**Solution**: Check `useRouter` redirects in dashboard pages for role-based routing

### Issue: Sidebar menu shows all items regardless of role
**Solution**: Verify `roleMenuConfig` in mockData matches displayed roles

### Issue: Permission denied on authorized pages
**Solution**: Check that user's companyId/organizationId matches resource's companyId/organizationId

---

## Next Steps
After all tests pass:
1. Update PHASE5_COMPLETION.md
2. Prepare Phase 6 (Reports & Analytics)
3. Document any discovered issues
4. Update README with login instructions
