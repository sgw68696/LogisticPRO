const companyService = require('./company.service');
const { createCompanySchema, updateCompanySchema, companyQuerySchema } = require('./company.validation');
const asyncHandler = require('../../utils/asyncHandler');

class CompanyController {
  getAllCompanies = asyncHandler(async (req, res) => {
    const filters = await companyQuerySchema.validateAsync(req.query);
    const result = await companyService.getAllCompanies(filters, req.user);
    
    res.success({
      companies: result.companies,
      pagination: result.pagination
    }, 'Companies retrieved successfully');
  });

  getCompanyById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const company = await companyService.getCompanyById(id, req.user);
    
    res.success(company, 'Company retrieved successfully');
  });

  getCompanyByUuid = asyncHandler(async (req, res) => {
    const { uuid } = req.params;
    const company = await companyService.getCompanyByUuid(uuid, req.user);
    
    res.success(company, 'Company retrieved successfully');
  });

  createCompany = asyncHandler(async (req, res) => {
    const data = await createCompanySchema.validateAsync(req.body);
    const company = await companyService.createCompany(data, req.user);
    
    res.success(company, 'Company created successfully', 201);
  });

  updateCompany = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = await updateCompanySchema.validateAsync(req.body);
    const company = await companyService.updateCompany(id, data, req.user);
    
    res.success(company, 'Company updated successfully');
  });

  deleteCompany = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await companyService.deleteCompany(id, req.user);
    
    res.success(result, 'Company deleted successfully');
  });

  activateCompany = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const company = await companyService.activateCompany(id, req.user);
    
    res.success(company, 'Company activated successfully');
  });

  deactivateCompany = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const company = await companyService.deactivateCompany(id, req.user);
    
    res.success(company, 'Company deactivated successfully');
  });

  getCompanyUsers = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const filters = await companyQuerySchema.validateAsync(req.query);
    const result = await companyService.getCompanyUsers(id, filters, req.user);
    
    res.success({
      users: result.users,
      pagination: result.pagination
    }, 'Company users retrieved successfully');
  });

  verifyCompany = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const company = await companyService.verifyCompany(id, req.user);
    
    res.success(company, 'Company verified successfully');
  });
}

module.exports = new CompanyController();
