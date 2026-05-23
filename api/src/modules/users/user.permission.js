const USER_ROLES = {
  SUPERADMIN: 'superadmin',
  ORGANIZATION_USER: 'organizationuser',
  COMPANY_ADMIN: 'companyadmin',
  COMPANY_USER: 'companyuser',
  MANAGER: 'manager',
  DISPATCHER: 'dispatcher',
  OPERATOR: 'operator',
  AGENT: 'agent',
  STAFF: 'staff',
  CUSTOMS_AGENT: 'customsagent',
  PORT_AGENT: 'portagent',
  CUSTOMER_PORTAL: 'customerportal',
  AUDITOR_READONLY: 'auditorreadonly'
};

const ALL_ROLES = Object.values(USER_ROLES);

module.exports = {
  USER_ROLES,
  ALL_ROLES
};
