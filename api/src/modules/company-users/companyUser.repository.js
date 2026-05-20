const CompanyUser = require('./companyUser.model');
const ApiError = require('../../utils/ApiError');
const logger = require('../../config/logger');

class CompanyUserRepository {
  async findAll(filters) {
    try {
      return await CompanyUser.findAll(filters);
    } catch (error) {
      logger.error('Error in CompanyUserRepository.findAll:', error);
      throw ApiError.databaseError('Failed to fetch company users');
    }
  }

  async findById(id) {
    try {
      const companyUser = await CompanyUser.findById(id);
      if (!companyUser) {
        throw ApiError.notFound('Company user not found');
      }
      return companyUser;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in CompanyUserRepository.findById:', error);
      throw ApiError.databaseError('Failed to fetch company user');
    }
  }

  async findByUuid(uuid) {
    try {
      const companyUser = await CompanyUser.findByUuid(uuid);
      if (!companyUser) {
        throw ApiError.notFound('Company user not found');
      }
      return companyUser;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in CompanyUserRepository.findByUuid:', error);
      throw ApiError.databaseError('Failed to fetch company user');
    }
  }

  async findByEmail(email) {
    try {
      return await CompanyUser.findByEmail(email);
    } catch (error) {
      logger.error('Error in CompanyUserRepository.findByEmail:', error);
      throw ApiError.databaseError('Failed to fetch company user');
    }
  }

  async create(data, createdBy) {
    try {
      const existing = await this.findByEmail(data.email);
      if (existing) {
        throw ApiError.conflict('User with this email already exists');
      }

      return await CompanyUser.create(data, createdBy);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in CompanyUserRepository.create:', error);
      throw ApiError.databaseError('Failed to create company user');
    }
  }

  async createWithCompany(data, createdBy) {
    try {
      const existing = await CompanyUser.findByEmail(data.email);
      if (existing) {
        throw ApiError.conflict('User with this email already exists');
      }

      return await CompanyUser.createWithCompany(data, createdBy);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in CompanyUserRepository.createWithCompany:', error);
      throw ApiError.databaseError('Failed to create company user');
    }
  }

  async update(id, data, updatedBy) {
    try {
      await this.findById(id);

      if (data.email) {
        const emailExists = await CompanyUser.findByEmail(data.email);
        if (emailExists && emailExists.id !== id) {
          throw ApiError.conflict('User with this email already exists');
        }
      }

      return await CompanyUser.update(id, data, updatedBy);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in CompanyUserRepository.update:', error);
      throw ApiError.databaseError('Failed to update company user');
    }
  }

  async softDelete(id, deletedBy) {
    try {
      await this.findById(id);
      return await CompanyUser.softDelete(id, deletedBy);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in CompanyUserRepository.softDelete:', error);
      throw ApiError.databaseError('Failed to delete company user');
    }
  }

  async getPendingApprovals(companyId, organizationId) {
    try {
      return await CompanyUser.getPendingApprovals(companyId, organizationId);
    } catch (error) {
      logger.error('Error in CompanyUserRepository.getPendingApprovals:', error);
      throw ApiError.databaseError('Failed to fetch pending approvals');
    }
  }

  async approveUser(id, approvedBy) {
    try {
      await this.findById(id);
      return await CompanyUser.approveUser(id, approvedBy);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in CompanyUserRepository.approveUser:', error);
      throw ApiError.databaseError('Failed to approve company user');
    }
  }

  async rejectUser(id, rejectedBy) {
    try {
      await this.findById(id);
      return await CompanyUser.rejectUser(id, rejectedBy);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in CompanyUserRepository.rejectUser:', error);
      throw ApiError.databaseError('Failed to reject company user');
    }
  }

  async suspendUser(id, suspendedBy) {
    try {
      await this.findById(id);
      return await CompanyUser.suspendUser(id, suspendedBy);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in CompanyUserRepository.suspendUser:', error);
      throw ApiError.databaseError('Failed to suspend company user');
    }
  }

  async reactivateUser(id, reactivatedBy) {
    try {
      await this.findById(id);
      return await CompanyUser.reactivateUser(id, reactivatedBy);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in CompanyUserRepository.reactivateUser:', error);
      throw ApiError.databaseError('Failed to reactivate company user');
    }
  }
}

module.exports = new CompanyUserRepository();
