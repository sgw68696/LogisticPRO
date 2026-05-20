const express = require('express');
const companyUserController = require('./companyUser.controller');
const authenticate = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/', 
  requireRole(['superadmin', 'organizationuser', 'companyadmin']), 
  companyUserController.createCompanyUser
);

router.post('/with-company', 
  requireRole(['superadmin', 'organizationuser', 'companyadmin']), 
  companyUserController.createCompanyUserWithCompany
);

router.get('/', 
  requireRole(['superadmin', 'organizationuser', 'companyadmin', 'companyuser']), 
  companyUserController.getAllCompanyUsers
);

router.get('/pending-approvals', 
  requireRole(['superadmin']), 
  companyUserController.getPendingApprovals
);

router.get('/:id', 
  requireRole(['superadmin', 'organizationuser', 'companyadmin', 'companyuser']), 
  companyUserController.getCompanyUserById
);

router.get('/uuid/:uuid', 
  requireRole(['superadmin', 'organizationuser', 'companyadmin', 'companyuser']), 
  companyUserController.getCompanyUserByUuid
);

router.put('/:id', 
  requireRole(['superadmin', 'organizationuser', 'companyadmin', 'companyuser']), 
  companyUserController.updateCompanyUser
);

router.delete('/:id', 
  requireRole(['superadmin', 'organizationuser', 'companyadmin']), 
  companyUserController.deleteCompanyUser
);

router.patch('/:id/approve', 
  requireRole(['superadmin']), 
  companyUserController.approveCompanyUser
);

router.patch('/:id/reject', 
  requireRole(['superadmin']), 
  companyUserController.rejectCompanyUser
);

router.patch('/:id/suspend', 
  requireRole(['superadmin']), 
  companyUserController.suspendCompanyUser
);

router.patch('/:id/reactivate', 
  requireRole(['superadmin']), 
  companyUserController.reactivateCompanyUser
);

module.exports = router;
