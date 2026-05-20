const CompanyType = require('./companyType.model');
const ApiError = require('../../utils/ApiError');
const logger = require('../../config/logger');

class CompanyTypeRepository {
  async findAll(filters) {
    try {
      return await CompanyType.findAll(filters);
    } catch (error) {
      logger.error('Error in CompanyTypeRepository.findAll:', error);
      throw ApiError.databaseError('Failed to fetch company types');
    }
  }

  async findById(id) {
    try {
      const companyType = await CompanyType.findById(id);
      if (!companyType) {
        throw ApiError.notFound('Company type not found');
      }
      return companyType;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in CompanyTypeRepository.findById:', error);
      throw ApiError.databaseError('Failed to fetch company type');
    }
  }

  async create(data) {
    try {
      return await CompanyType.create(data);
    } catch (error) {
      logger.error('Error in CompanyTypeRepository.create:', error);
      throw ApiError.databaseError('Failed to create company type');
    }
  }

  async update(id, data) {
    try {
      await this.findById(id);
      return await CompanyType.update(id, data);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in CompanyTypeRepository.update:', error);
      throw ApiError.databaseError('Failed to update company type');
    }
  }

  async delete(id) {
    try {
      await this.findById(id);
      return await CompanyType.delete(id);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in CompanyTypeRepository.delete:', error);
      throw ApiError.databaseError('Failed to delete company type');
    }
  }
}

module.exports = new CompanyTypeRepository();
