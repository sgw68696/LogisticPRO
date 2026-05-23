const express = require('express');
const userController = require('./user.controller');
const authenticate = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');

const router = express.Router();

router.get('/me', authenticate, requireRole(['superadmin', 'organizationuser', 'companyadmin', 'companyuser', 'manager', 'dispatcher', 'operator', 'agent', 'staff', 'customsagent', 'portagent', 'customerportal', 'auditorreadonly']), userController.getMe);

module.exports = router;
