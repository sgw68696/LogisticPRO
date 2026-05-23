const express = require('express');
const authRoutes = require('../../modules/auth/auth.routes');
const userRoutes = require('../../modules/users/user.routes');
const organizationRoutes = require('../../modules/organizations/organization.routes');
const organizationUserRoutes = require('../../modules/organization-users/organizationUser.routes');
const companyRoutes = require('../../modules/companies/company.routes');
const companyUserRoutes = require('../../modules/company-users/companyUser.routes');
const companyTypeRoutes = require('../../modules/company-types/companyType.routes');
const approvalRoutes = require('../../modules/approvals/approval.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/organizations', organizationRoutes);
router.use('/organization-users', organizationUserRoutes);
router.use('/companies', companyRoutes);
router.use('/company-users', companyUserRoutes);
router.use('/company-types', companyTypeRoutes);
router.use('/approvals', approvalRoutes);

module.exports = router;
