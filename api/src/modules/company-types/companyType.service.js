const companyTypeRepository = require('./companyType.repository');
const ApiError = require('../../utils/ApiError');
const logger = require('../../config/logger');

class CompanyTypeService {
  async getAllCompanyTypes(filters, currentUser) {
    try {
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('You do not have permission to view company types');
      }
      return await companyTypeRepository.findAll(filters);
    } catch (error) {
      logger.error('Error in CompanyTypeService.getAllCompanyTypes:', error);
      throw error;
    }
  }

  async getCompanyTypeById(id, currentUser) {
    try {
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('You do not have permission to view company types');
      }
      return await companyTypeRepository.findById(id);
    } catch (error) {
      logger.error('Error in CompanyTypeService.getCompanyTypeById:', error);
      throw error;
    }
  }

  async createCompanyType(data, currentUser) {
    try {
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('You do not have permission to create company types');
      }
      return await companyTypeRepository.create(data);
    } catch (error) {
      logger.error('Error in CompanyTypeService.createCompanyType:', error);
      throw error;
    }
  }

  async updateCompanyType(id, data, currentUser) {
    try {
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('You do not have permission to update company types');
      }
      return await companyTypeRepository.update(id, data);
    } catch (error) {
      logger.error('Error in CompanyTypeService.updateCompanyType:', error);
      throw error;
    }
  }

  async deleteCompanyType(id, currentUser) {
    try {
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('You do not have permission to delete company types');
      }
      return await companyTypeRepository.delete(id);
    } catch (error) {
      logger.error('Error in CompanyTypeService.deleteCompanyType:', error);
      throw error;
    }
  }

  async listAll(currentUser) {
    try {
      return await companyTypeRepository.findAll({ limit: 100 });
    } catch (error) {
      logger.error('Error in CompanyTypeService.listAll:', error);
      throw error;
    }
  }
}

module.exports = new CompanyTypeService();
