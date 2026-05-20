const express = require('express');
const companyController = require('./company.controller');
const authenticate = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate);

router.post('/', 
  requireRole(['superadmin', 'organizationuser']), 
  companyController.createCompany
);

router.get('/', 
  requireRole(['superadmin', 'organizationuser', 'companyadmin', 'companyuser']), 
  companyController.getAllCompanies
);

router.get('/:id', 
  requireRole(['superadmin', 'organizationuser', 'companyadmin', 'companyuser']), 
  companyController.getCompanyById
);

router.get('/uuid/:uuid', 
  requireRole(['superadmin', 'organizationuser', 'companyadmin', 'companyuser']), 
  companyController.getCompanyByUuid
);

router.put('/:id', 
  requireRole(['superadmin', 'organizationuser', 'companyadmin', 'companyuser']), 
  companyController.updateCompany
);

router.delete('/:id', 
  requireRole(['superadmin', 'organizationuser']), 
  companyController.deleteCompany
);

router.patch('/:id/activate', 
  requireRole(['superadmin', 'organizationuser']), 
  companyController.activateCompany
);

router.patch('/:id/deactivate', 
  requireRole(['superadmin', 'organizationuser']), 
  companyController.deactivateCompany
);

router.patch('/:id/verify', 
  requireRole(['superadmin']), 
  companyController.verifyCompany
);

router.get('/:id/users', 
  requireRole(['superadmin', 'organizationuser', 'companyadmin', 'companyuser']), 
  companyController.getCompanyUsers
);

module.exports = router;
