const Company = require('./company.model');
const ApiError = require('../../utils/ApiError');
const logger = require('../../config/logger');

class CompanyRepository {
  async findAll(filters) {
    try {
      return await Company.findAll(filters);
    } catch (error) {
      logger.error('Error in CompanyRepository.findAll:', error);
      throw ApiError.databaseError('Failed to fetch companies');
    }
  }

  async findById(id) {
    try {
      const company = await Company.findById(id);
      if (!company) {
        throw ApiError.notFound('Company not found');
      }
      return company;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in CompanyRepository.findById:', error);
      throw ApiError.databaseError('Failed to fetch company');
    }
  }

  async findByUuid(uuid) {
    try {
      const company = await Company.findByUuid(uuid);
      if (!company) {
        throw ApiError.notFound('Company not found');
      }
      return company;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in CompanyRepository.findByUuid:', error);
      throw ApiError.databaseError('Failed to fetch company');
    }
  }

  async findByEmail(email) {
    try {
      return await Company.findByEmail(email);
    } catch (error) {
      logger.error('Error in CompanyRepository.findByEmail:', error);
      throw ApiError.databaseError('Failed to fetch company');
    }
  }

  async create(data, createdBy) {
    try {
      // Check if email already exists
      const existing = await this.findByEmail(data.email);
      if (existing) {
        throw ApiError.conflict('Company with this email already exists');
      }

      if (data.user_first_name && data.user_email && data.user_password) {
        return await Company.createWithUser(data, createdBy);
      }

      return await Company.create(data, createdBy);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in CompanyRepository.create:', error);
      throw ApiError.databaseError('Failed to create company');
    }
  }

  async update(id, data, updatedBy) {
    try {
      // Check if company exists
      const existing = await this.findById(id);

      // If email is being updated, check if it's already taken
      if (data.email && data.email !== existing.email) {
        const emailExists = await this.findByEmail(data.email);
        if (emailExists) {
          throw ApiError.conflict('Company with this email already exists');
        }
      }

      return await Company.update(id, data, updatedBy);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in CompanyRepository.update:', error);
      throw ApiError.databaseError('Failed to update company');
    }
  }

  async softDelete(id, deletedBy) {
    try {
      // Check if company exists
      await this.findById(id);

      return await Company.softDelete(id, deletedBy);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in CompanyRepository.softDelete:', error);
      throw ApiError.databaseError('Failed to delete company');
    }
  }

  async getUsers(companyId, filters) {
    try {
      // Check if company exists
      await this.findById(companyId);

      return await Company.getUsers(companyId, filters);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in CompanyRepository.getUsers:', error);
      throw ApiError.databaseError('Failed to fetch company users');
    }
  }

  async verifyCompany(id, verifiedBy) {
    try {
      // Check if company exists
      await this.findById(id);

      return await Company.verifyCompany(id, verifiedBy);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in CompanyRepository.verifyCompany:', error);
      throw ApiError.databaseError('Failed to verify company');
    }
  }
}

module.exports = new CompanyRepository();
