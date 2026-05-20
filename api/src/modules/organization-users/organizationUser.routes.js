const express = require('express');
const organizationUserController = require('./organizationUser.controller');
const authenticate = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Super Admin and Organization User routes
router.post('/', 
  requireRole(['superadmin', 'organizationuser']), 
  organizationUserController.createOrganizationUser
);

router.post('/with-user', 
  requireRole(['superadmin', 'organizationuser']), 
  organizationUserController.createOrganizationUserWithUser
);

router.get('/', 
  requireRole(['superadmin', 'organizationuser']), 
  organizationUserController.getAllOrganizationUsers
);

// Specific organization user routes
router.get('/:id', 
  requireRole(['superadmin', 'organizationuser']), 
  organizationUserController.getOrganizationUserById
);

router.put('/:id', 
  requireRole(['superadmin', 'organizationuser']), 
  organizationUserController.updateOrganizationUser
);

router.delete('/:id', 
  requireRole(['superadmin', 'organizationuser']), 
  organizationUserController.deleteOrganizationUser
);

// Approval workflow routes (Super Admin only)
router.patch('/:id/approve', 
  requireRole(['superadmin']), 
  organizationUserController.approveOrganizationUser
);

router.patch('/:id/reject', 
  requireRole(['superadmin']), 
  organizationUserController.rejectOrganizationUser
);

router.patch('/:id/suspend', 
  requireRole(['superadmin']), 
  organizationUserController.suspendOrganizationUser
);

router.patch('/:id/reactivate', 
  requireRole(['superadmin']), 
  organizationUserController.reactivateOrganizationUser
);

// Pending approvals (Super Admin only)
router.get('/pending/approvals', 
  requireRole(['superadmin']), 
  organizationUserController.getPendingApprovals
);

// Organization-specific users
router.get('/organization/:organizationId', 
  requireRole(['superadmin', 'organizationuser']), 
  organizationUserController.getOrganizationUsers
);

module.exports = router;
