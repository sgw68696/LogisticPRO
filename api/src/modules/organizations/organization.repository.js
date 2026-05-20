const Organization = require('./organization.model');
const ApiError = require('../../utils/ApiError');
const logger = require('../../config/logger');

class OrganizationRepository {
  async findAll(filters) {
    try {
      return await Organization.findAll(filters);
    } catch (error) {
      logger.error('Error in OrganizationRepository.findAll:', error);
      throw ApiError.databaseError('Failed to fetch organizations');
    }
  }

  async findById(id) {
    try {
      const organization = await Organization.findById(id);
      if (!organization) {
        throw ApiError.notFound('Organization not found');
      }
      return organization;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in OrganizationRepository.findById:', error);
      throw ApiError.databaseError('Failed to fetch organization');
    }
  }

  async findByUuid(uuid) {
    try {
      const organization = await Organization.findByUuid(uuid);
      if (!organization) {
        throw ApiError.notFound('Organization not found');
      }
      return organization;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in OrganizationRepository.findByUuid:', error);
      throw ApiError.databaseError('Failed to fetch organization');
    }
  }

  async findByEmail(email) {
    try {
      return await Organization.findByEmail(email);
    } catch (error) {
      logger.error('Error in OrganizationRepository.findByEmail:', error);
      throw ApiError.databaseError('Failed to fetch organization');
    }
  }

  async create(data, createdBy) {
    try {
      // Check if email already exists
      const existing = await this.findByEmail(data.email);
      if (existing) {
        throw ApiError.conflict('Organization with this email already exists');
      }

      // Always create with user - auto-generate default org admin if not provided
      return await Organization.createWithUser(data, createdBy);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in OrganizationRepository.create:', error);
      const detail = error.sqlMessage || error.message || 'Unknown error';
      throw ApiError.databaseError(`Failed to create organization: ${detail}`);
    }
  }

  async update(id, data, updatedBy) {
    try {
      // Check if organization exists
      const existing = await this.findById(id);

      // If email is being updated, check if it's already taken
      if (data.email && data.email !== existing.email) {
        const emailExists = await this.findByEmail(data.email);
        if (emailExists) {
          throw ApiError.conflict('Organization with this email already exists');
        }
      }

      return await Organization.update(id, data, updatedBy);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in OrganizationRepository.update:', error);
      throw ApiError.databaseError('Failed to update organization');
    }
  }

  async softDelete(id, deletedBy) {
    try {
      // Check if organization exists
      await this.findById(id);

      return await Organization.softDelete(id, deletedBy);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in OrganizationRepository.softDelete:', error);
      throw ApiError.databaseError('Failed to delete organization');
    }
  }

  async getCompanies(organizationId, filters) {
    try {
      // Check if organization exists
      await this.findById(organizationId);

      return await Organization.getCompanies(organizationId, filters);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in OrganizationRepository.getCompanies:', error);
      throw ApiError.databaseError('Failed to fetch organization companies');
    }
  }

  async getUsers(organizationId, filters) {
    try {
      // Check if organization exists
      await this.findById(organizationId);

      return await Organization.getUsers(organizationId, filters);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in OrganizationRepository.getUsers:', error);
      throw ApiError.databaseError('Failed to fetch organization users');
    }
  }

  async checkCompanyLimit(organizationId) {
    try {
      return await Organization.checkCompanyLimit(organizationId);
    } catch (error) {
      logger.error('Error in OrganizationRepository.checkCompanyLimit:', error);
      throw ApiError.databaseError('Failed to check company limit');
    }
  }
}

module.exports = new OrganizationRepository();
