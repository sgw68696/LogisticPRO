const organizationUserService = require('./organizationUser.service');
const { 
  createOrganizationUserSchema, 
  createOrganizationUserWithUserSchema,
  updateOrganizationUserSchema, 
  approvalActionSchema,
  organizationUserQuerySchema 
} = require('./organizationUser.validation');
const asyncHandler = require('../../utils/asyncHandler');

class OrganizationUserController {
  getAllOrganizationUsers = asyncHandler(async (req, res) => {
    const filters = await organizationUserQuerySchema.validateAsync(req.query);
    const result = await organizationUserService.getAllOrganizationUsers(filters, req.user);
    
    res.success({
      organizationUsers: result.organizationUsers,
      pagination: result.pagination
    }, 'Organization users retrieved successfully');
  });

  getOrganizationUserById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const orgUser = await organizationUserService.getOrganizationUserById(id, req.user);
    
    res.success(orgUser, 'Organization user retrieved successfully');
  });

  createOrganizationUser = asyncHandler(async (req, res) => {
    const data = await createOrganizationUserSchema.validateAsync(req.body);
    const orgUser = await organizationUserService.createOrganizationUser(data, req.user);
    
    res.success(orgUser, 'Organization user created successfully', 201);
  });

  createOrganizationUserWithUser = asyncHandler(async (req, res) => {
    const data = await createOrganizationUserWithUserSchema.validateAsync(req.body);
    const orgUser = await organizationUserService.createOrganizationUserWithUser(data, req.user);
    
    res.success(orgUser, 'Organization user created successfully', 201);
  });

  updateOrganizationUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = await updateOrganizationUserSchema.validateAsync(req.body);
    const orgUser = await organizationUserService.updateOrganizationUser(id, data, req.user);
    
    res.success(orgUser, 'Organization user updated successfully');
  });

  deleteOrganizationUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await organizationUserService.deleteOrganizationUser(id, req.user);
    
    res.success(result, 'Organization user deleted successfully');
  });

  approveOrganizationUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const orgUser = await organizationUserService.approveOrganizationUser(id, req.user);
    
    res.success(orgUser, 'Organization user approved successfully');
  });

  rejectOrganizationUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { rejection_reason } = await approvalActionSchema.validateAsync(req.body);
    const orgUser = await organizationUserService.rejectOrganizationUser(id, rejection_reason, req.user);
    
    res.success(orgUser, 'Organization user rejected successfully');
  });

  suspendOrganizationUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { suspension_reason } = await approvalActionSchema.validateAsync(req.body);
    const orgUser = await organizationUserService.suspendOrganizationUser(id, suspension_reason, req.user);
    
    res.success(orgUser, 'Organization user suspended successfully');
  });

  reactivateOrganizationUser = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const orgUser = await organizationUserService.reactivateOrganizationUser(id, req.user);
    
    res.success(orgUser, 'Organization user reactivated successfully');
  });

  getPendingApprovals = asyncHandler(async (req, res) => {
    const pendingUsers = await organizationUserService.getPendingApprovals(req.user);
    
    res.success(pendingUsers, 'Pending approvals retrieved successfully');
  });

  getOrganizationUsers = asyncHandler(async (req, res) => {
    const { organizationId } = req.params;
    const filters = await organizationUserQuerySchema.validateAsync(req.query);
    const result = await organizationUserService.getOrganizationUsers(organizationId, filters, req.user);
    
    res.success({
      users: result.users,
      pagination: result.pagination
    }, 'Organization users retrieved successfully');
  });
}

module.exports = new OrganizationUserController();
