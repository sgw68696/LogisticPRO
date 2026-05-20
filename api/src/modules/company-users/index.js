const companyUserModel = require('./companyUser.model');
const companyUserRepository = require('./companyUser.repository');
const companyUserService = require('./companyUser.service');
const companyUserController = require('./companyUser.controller');
const companyUserRoutes = require('./companyUser.routes');
const companyUserValidation = require('./companyUser.validation');

module.exports = {
  companyUserModel,
  companyUserRepository,
  companyUserService,
  companyUserController,
  companyUserRoutes,
  companyUserValidation
};
