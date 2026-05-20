const companyUserService = require('./companyUser.service');
const { createCompanyUserSchema, updateCompanyUserSchema, companyUserQuerySchema, approvalActionSchema } = require('./companyUser.validation');
const asyncHandler = require('../../utils/asyncHandler');

class CompanyUserController {
  getAllCompanyUsers = asyncHandler(async (req, res) => {
    const filters = await companyUserQuerySchema.validateAsync(req.query);
    const result = await companyUserService.getAllCompanyUsers(filters, req.user);
    
    res.success({
      companyUsers: result.companyUsers,
      pagination: result.pagination
    }, 'Company users retrieved successfully');
  });

  getCompanyUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const companyUser = await companyUserService.getCompanyUserById(id, req.user);
    
    res.success(companyUser, 'Company user retrieved successfully');
  });

  getCompanyUserByUuid = asyncHandler(async (req, res) => {
    const { uuid } = req.params;
    const companyUser = await companyUserService.getCompanyUserByUuid(uuid, req.user);
    
    res.success(companyUser, 'Company user retrieved successfully');
  });

  createCompanyUser = asyncHandler(async (req, res) => {
    const data = await createCompanyUserSchema.validateAsync(req.body);
    const companyUser = await companyUserService.createCompanyUser(data, req.user);
    
    res.success(companyUser, 'Company user created successfully', 201);
  });

  createCompanyUserWithCompany = asyncHandler(async (req, res) => {
    const data = await createCompanyUserSchema.validateAsync(req.body);
    const companyUser = await companyUserService.createCompanyUserWithCompany(data, req.user);
    
    res.success(companyUser, 'Company user created successfully', 201);
  });

  updateCompanyUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = await updateCompanyUserSchema.validateAsync(req.body);
    const companyUser = await companyUserService.updateCompanyUser(id, data, req.user);
    
    res.success(companyUser, 'Company user updated successfully');
  });

  deleteCompanyUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await companyUserService.deleteCompanyUser(id, req.user);
    
    res.success(result, 'Company user deleted successfully');
  });

  approveCompanyUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const companyUser = await companyUserService.approveCompanyUser(id, req.user);
    
    res.success(companyUser, 'Company user approved successfully');
  });

  rejectCompanyUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const companyUser = await companyUserService.rejectCompanyUser(id, req.user);
    
    res.success(companyUser, 'Company user rejected successfully');
  });

  suspendCompanyUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const companyUser = await companyUserService.suspendCompanyUser(id, req.user);
    
    res.success(companyUser, 'Company user suspended successfully');
  });

  reactivateCompanyUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const companyUser = await companyUserService.reactivateCompanyUser(id, req.user);
    
    res.success(companyUser, 'Company user reactivated successfully');
  });

  getPendingApprovals = asyncHandler(async (req, res) => {
    const filters = await companyUserQuerySchema.validateAsync(req.query);
    const pendingApprovals = await companyUserService.getPendingApprovals(filters, req.user);
    
    res.success(pendingApprovals, 'Pending approvals retrieved successfully');
  });
}

module.exports = new CompanyUserController();
