const express = require('express');
const companyTypeController = require('./companyType.controller');
const authenticate = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate);

router.get('/list', companyTypeController.listAll);

router.get('/', requireRole(['superadmin']), companyTypeController.getAllCompanyTypes);

router.post('/', requireRole(['superadmin']), companyTypeController.createCompanyType);

router.get('/:id', requireRole(['superadmin']), companyTypeController.getCompanyTypeById);

router.put('/:id', requireRole(['superadmin']), companyTypeController.updateCompanyType);

router.delete('/:id', requireRole(['superadmin']), companyTypeController.deleteCompanyType);

module.exports = router;
