const companyTypeService = require('./companyType.service');
const { createCompanyTypeSchema, updateCompanyTypeSchema, companyTypeQuerySchema } = require('./companyType.validation');
const asyncHandler = require('../../utils/asyncHandler');
const companyTypeModel = require('./companyType.model');

class CompanyTypeController {
  getAllCompanyTypes = asyncHandler(async (req, res) => {
    const filters = await companyTypeQuerySchema.validateAsync(req.query);
    const result = await companyTypeService.getAllCompanyTypes(filters, req.user);
    res.success(result, 'Company types retrieved successfully');
  });

  listAll = asyncHandler(async (req, res) => {
    const companyTypes = await companyTypeModel.findAllSimple();
    res.success(companyTypes, 'Company types retrieved successfully');
  });

  getCompanyTypeById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const companyType = await companyTypeService.getCompanyTypeById(id, req.user);
    res.success(companyType, 'Company type retrieved successfully');
  });

  createCompanyType = asyncHandler(async (req, res) => {
    const data = await createCompanyTypeSchema.validateAsync(req.body);
    const companyType = await companyTypeService.createCompanyType(data, req.user);
    res.success(companyType, 'Company type created successfully', 201);
  });

  updateCompanyType = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = await updateCompanyTypeSchema.validateAsync(req.body);
    const companyType = await companyTypeService.updateCompanyType(id, data, req.user);
    res.success(companyType, 'Company type updated successfully');
  });

  deleteCompanyType = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await companyTypeService.deleteCompanyType(id, req.user);
    res.success(result, 'Company type deleted successfully');
  });
}

module.exports = new CompanyTypeController();
