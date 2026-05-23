const OrganizationUser = require('./organizationUser.model');
const ApiError = require('../../utils/ApiError');
const logger = require('../../config/logger');

class OrganizationUserRepository {
  async findAll(filters) {
    try {
      return await OrganizationUser.findAll(filters);
    } catch (error) {
      logger.error('Error in OrganizationUserRepository.findAll:', error);
      throw ApiError.databaseError('Failed to fetch organization users');
    }
  }

  async findById(id) {
    try {
      const orgUser = await OrganizationUser.findById(id);
      if (!orgUser) {
        throw ApiError.notFound('Organization user not found');
      }
      return orgUser;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in OrganizationUserRepository.findById:', error);
      throw ApiError.databaseError('Failed to fetch organization user');
    }
  }

  async findByUuid(uuid) {
    try {
      const orgUser = await OrganizationUser.findByUuid(uuid);
      if (!orgUser) {
        throw ApiError.notFound('Organization user not found');
      }
      return orgUser;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in OrganizationUserRepository.findByUuid:', error);
      throw ApiError.databaseError('Failed to fetch organization user');
    }
  }

  async findByOrganizationAndUser(organizationId, userId) {
    try {
      return await OrganizationUser.findByOrganizationAndUser(organizationId, userId);
    } catch (error) {
      logger.error('Error in OrganizationUserRepository.findByOrganizationAndUser:', error);
      throw ApiError.databaseError('Failed to fetch organization user');
    }
  }

  async create(data, createdBy) {
    try {
      // Check if user already exists in this organization
      const existing = await this.findByOrganizationAndUser(data.organization_id, data.user_id);
      if (existing) {
        throw ApiError.conflict('User already exists in this organization');
      }

      return await OrganizationUser.create(data, createdBy);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in OrganizationUserRepository.create:', error);
      throw ApiError.databaseError('Failed to create organization user');
    }
  }

  async createWithUser(data, createdBy) {
    try {
      return await OrganizationUser.createWithUser(data, createdBy);
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        if (error.message.includes('username')) {
          throw ApiError.conflict('Username already exists');
        } else if (error.message.includes('email')) {
          throw ApiError.conflict('Email already exists');
        }
      }
      logger.error('Error in OrganizationUserRepository.createWithUser:', error);
      throw ApiError.databaseError('Failed to create organization user');
    }
  }

  async update(id, data, updatedBy) {
    try {
      // Check if organization user exists
      await this.findById(id);

      return await OrganizationUser.update(id, data, updatedBy);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in OrganizationUserRepository.update:', error);
      throw ApiError.databaseError('Failed to update organization user');
    }
  }

  async softDelete(id, deletedBy) {
    try {
      // Check if organization user exists
      await this.findById(id);

      return await OrganizationUser.softDelete(id, deletedBy);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in OrganizationUserRepository.softDelete:', error);
      throw ApiError.databaseError('Failed to delete organization user');
    }
  }

  async getPendingApprovals(organizationId = null) {
    try {
      return await OrganizationUser.getPendingApprovals(organizationId);
    } catch (error) {
      logger.error('Error in OrganizationUserRepository.getPendingApprovals:', error);
      throw ApiError.databaseError('Failed to fetch pending approvals');
    }
  }

  async getByOrganization(organizationId, filters) {
    try {
      return await OrganizationUser.getByOrganization(organizationId, filters);
    } catch (error) {
      logger.error('Error in OrganizationUserRepository.getByOrganization:', error);
      throw ApiError.databaseError('Failed to fetch organization users');
    }
  }
}

module.exports = new OrganizationUserRepository();
