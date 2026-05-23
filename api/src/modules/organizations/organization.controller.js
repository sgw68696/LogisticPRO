const organizationService = require('./organization.service');
const organizationModel = require('./organization.model');
const { createOrganizationSchema, updateOrganizationSchema, organizationQuerySchema } = require('./organization.validation');
const { validate } = require('../../middlewares/validate.middleware');
const asyncHandler = require('../../utils/asyncHandler');

class OrganizationController {
  listAll = asyncHandler(async (req, res) => {
    const organizations = await organizationModel.findAllSimple();
    res.success(organizations, 'Organizations retrieved successfully');
  });

  getAllOrganizations = asyncHandler(async (req, res) => {
    const filters = await organizationQuerySchema.validateAsync(req.query);
    const result = await organizationService.getAllOrganizations(filters, req.user);
    
    res.success({
      organizations: result.organizations,
      pagination: result.pagination
    }, 'Organizations retrieved successfully');
  });

  getOrganizationById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const organization = await organizationService.getOrganizationById(id, req.user);
    
    res.success(organization, 'Organization retrieved successfully');
  });

  getOrganizationByUuid = asyncHandler(async (req, res) => {
    const { uuid } = req.params;
    const organization = await organizationService.getOrganizationByUuid(uuid, req.user);
    
    res.success(organization, 'Organization retrieved successfully');
  });

  createOrganization = asyncHandler(async (req, res) => {
    const data = await createOrganizationSchema.validateAsync(req.body);
    const organization = await organizationService.createOrganization(data, req.user);
    
    res.success(organization, 'Organization created successfully', 201);
  });

  updateOrganization = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = await updateOrganizationSchema.validateAsync(req.body);
    const organization = await organizationService.updateOrganization(id, data, req.user);
    
    res.success(organization, 'Organization updated successfully');
  });

  deleteOrganization = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await organizationService.deleteOrganization(id, req.user);
    
    res.success(result, 'Organization deleted successfully');
  });

  activateOrganization = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const organization = await organizationService.activateOrganization(id, req.user);
    
    res.success(organization, 'Organization activated successfully');
  });

  deactivateOrganization = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const organization = await organizationService.deactivateOrganization(id, req.user);
    
    res.success(organization, 'Organization deactivated successfully');
  });

  getOrganizationCompanies = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const filters = await organizationQuerySchema.validateAsync(req.query);
    const result = await organizationService.getOrganizationCompanies(id, filters, req.user);
    
    res.success({
      companies: result.companies,
      pagination: result.pagination
    }, 'Organization companies retrieved successfully');
  });

  getOrganizationUsers = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const filters = await organizationQuerySchema.validateAsync(req.query);
    const result = await organizationService.getOrganizationUsers(id, filters, req.user);
    
    res.success({
      users: result.users,
      pagination: result.pagination
    }, 'Organization users retrieved successfully');
  });

  verifyOrganization = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const organization = await organizationService.verifyOrganization(id, req.user);
    
    res.success(organization, 'Organization verified successfully');
  });

  checkCompanyLimit = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await organizationService.checkCompanyLimit(id, req.user);
    
    res.success(result, 'Company limit checked successfully');
  });
}

module.exports = new OrganizationController();
