const express = require('express');
const organizationController = require('./organization.controller');
const authenticate = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// List all active organizations for dropdowns (any authenticated user)
router.get('/list', 
  organizationController.listAll
);

// Super Admin only routes
router.post('/', 
  requireRole(['superadmin']), 
  organizationController.createOrganization
);

router.get('/', 
  requireRole(['superadmin']), 
  organizationController.getAllOrganizations
);

// Organization detail routes
router.get('/:id', 
  requireRole(['superadmin', 'organizationuser']), 
  organizationController.getOrganizationById
);

router.get('/uuid/:uuid', 
  requireRole(['superadmin', 'organizationuser']), 
  organizationController.getOrganizationByUuid
);

router.put('/:id', 
  requireRole(['superadmin', 'organizationuser']), 
  organizationController.updateOrganization
);

router.delete('/:id', 
  requireRole(['superadmin']), 
  organizationController.deleteOrganization
);

// Organization status management
router.patch('/:id/activate', 
  requireRole(['superadmin']), 
  organizationController.activateOrganization
);

router.patch('/:id/deactivate', 
  requireRole(['superadmin']), 
  organizationController.deactivateOrganization
);

router.patch('/:id/verify', 
  requireRole(['superadmin']), 
  organizationController.verifyOrganization
);

// Organization companies and users
router.get('/:id/companies', 
  requireRole(['superadmin', 'organizationuser']), 
  organizationController.getOrganizationCompanies
);

router.get('/:id/users', 
  requireRole(['superadmin', 'organizationuser']), 
  organizationController.getOrganizationUsers
);

// Company limit check
router.get('/:id/limit/check', 
  requireRole(['superadmin', 'organizationuser']), 
  organizationController.checkCompanyLimit
);

module.exports = router;
