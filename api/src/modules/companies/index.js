const companyModel = require('./company.model');
const companyRepository = require('./company.repository');
const companyService = require('./company.service');
const companyController = require('./company.controller');
const companyRoutes = require('./company.routes');
const companyValidation = require('./company.validation');

module.exports = {
  companyModel,
  companyRepository,
  companyService,
  companyController,
  companyRoutes,
  companyValidation
};
