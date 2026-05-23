const approvalModel = require('./approval.model');
const approvalRepository = require('./approval.repository');
const approvalService = require('./approval.service');
const approvalController = require('./approval.controller');
const approvalRoutes = require('./approval.routes');
const approvalValidation = require('./approval.validation');

module.exports = {
  approvalModel,
  approvalRepository,
  approvalService,
  approvalController,
  approvalRoutes,
  approvalValidation
};
