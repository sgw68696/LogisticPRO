const Approval = require('./approval.model');
const ApiError = require('../../utils/ApiError');
const logger = require('../../config/logger');

class ApprovalRepository {
  async findAll(filters) {
    try {
      return await Approval.findAll(filters);
    } catch (error) {
      logger.error('Error in ApprovalRepository.findAll:', error);
      throw ApiError.databaseError('Failed to fetch approval requests');
    }
  }

  async findById(id) {
    try {
      const approval = await Approval.findById(id);
      if (!approval) {
        throw ApiError.notFound('Approval request not found');
      }
      return approval;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in ApprovalRepository.findById:', error);
      throw ApiError.databaseError('Failed to fetch approval request');
    }
  }

  async findByUuid(uuid) {
    try {
      const approval = await Approval.findByUuid(uuid);
      if (!approval) {
        throw ApiError.notFound('Approval request not found');
      }
      return approval;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in ApprovalRepository.findByUuid:', error);
      throw ApiError.databaseError('Failed to fetch approval request');
    }
  }

  async create(data, createdBy) {
    try {
      return await Approval.create(data, createdBy);
    } catch (error) {
      logger.error('Error in ApprovalRepository.create:', error);
      throw ApiError.databaseError('Failed to create approval request');
    }
  }

  async approve(id, approvedBy, notes) {
    try {
      await this.findById(id);
      return await Approval.approve(id, approvedBy, notes);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in ApprovalRepository.approve:', error);
      throw ApiError.databaseError('Failed to approve request');
    }
  }

  async reject(id, rejectedBy, notes) {
    try {
      await this.findById(id);
      return await Approval.reject(id, rejectedBy, notes);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in ApprovalRepository.reject:', error);
      throw ApiError.databaseError('Failed to reject request');
    }
  }

  async suspend(id, suspendedBy, notes) {
    try {
      await this.findById(id);
      return await Approval.suspend(id, suspendedBy, notes);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in ApprovalRepository.suspend:', error);
      throw ApiError.databaseError('Failed to suspend request');
    }
  }

  async reactivate(id, reactivatedBy, notes) {
    try {
      await this.findById(id);
      return await Approval.reactivate(id, reactivatedBy, notes);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in ApprovalRepository.reactivate:', error);
      throw ApiError.databaseError('Failed to reactivate request');
    }
  }

  async getPendingApprovals(filters) {
    try {
      return await Approval.getPendingApprovals(filters);
    } catch (error) {
      logger.error('Error in ApprovalRepository.getPendingApprovals:', error);
      throw ApiError.databaseError('Failed to fetch pending approvals');
    }
  }

  async softDelete(id, deletedBy) {
    try {
      await this.findById(id);
      return await Approval.softDelete(id, deletedBy);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      logger.error('Error in ApprovalRepository.softDelete:', error);
      throw ApiError.databaseError('Failed to delete approval request');
    }
  }
}

module.exports = new ApprovalRepository();
