const approvalRepository = require('./approval.repository');
const companyUserRepository = require('../company-users/companyUser.repository');
const organizationUserRepository = require('../organization-users/organizationUser.repository');
const companyRepository = require('../companies/company.repository');
const db = require('../../database/db');
const ApiError = require('../../utils/ApiError');
const logger = require('../../config/logger');

class ApprovalService {
  async getAllApprovals(filters, currentUser) {
    try {
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('You do not have permission to view approval requests');
      }

      return await approvalRepository.findAll(filters);
    } catch (error) {
      logger.error('Error in ApprovalService.getAllApprovals:', error);
      throw error;
    }
  }

  async getApprovalById(id, currentUser) {
    try {
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('You do not have permission to view approval requests');
      }

      return await approvalRepository.findById(id);
    } catch (error) {
      logger.error('Error in ApprovalService.getApprovalById:', error);
      throw error;
    }
  }

  async getApprovalByUuid(uuid, currentUser) {
    try {
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('You do not have permission to view approval requests');
      }

      return await approvalRepository.findByUuid(uuid);
    } catch (error) {
      logger.error('Error in ApprovalService.getApprovalByUuid:', error);
      throw error;
    }
  }

  async createApprovalRequest(data, currentUser) {
    try {
      return await approvalRepository.create(data, currentUser.id);
    } catch (error) {
      logger.error('Error in ApprovalService.createApprovalRequest:', error);
      throw error;
    }
  }

  async approveRequest(id, notes, currentUser) {
    try {
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('Only Super Admin can approve requests');
      }

      const approval = await approvalRepository.findById(id);
      const approvedApproval = await approvalRepository.approve(id, currentUser.id, notes);

      await this.updateEntityApprovalStatus(approval, 'approved', currentUser.id);

      return approvedApproval;
    } catch (error) {
      logger.error('Error in ApprovalService.approveRequest:', error);
      throw error;
    }
  }

  async rejectRequest(id, notes, currentUser) {
    try {
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('Only Super Admin can reject requests');
      }

      const approval = await approvalRepository.findById(id);
      const rejectedApproval = await approvalRepository.reject(id, currentUser.id, notes);

      await this.updateEntityApprovalStatus(approval, 'rejected', currentUser.id);

      return rejectedApproval;
    } catch (error) {
      logger.error('Error in ApprovalService.rejectRequest:', error);
      throw error;
    }
  }

  async suspendRequest(id, notes, currentUser) {
    try {
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('Only Super Admin can suspend requests');
      }

      const approval = await approvalRepository.findById(id);
      const suspendedApproval = await approvalRepository.suspend(id, currentUser.id, notes);

      await this.updateEntityApprovalStatus(approval, 'suspended', currentUser.id);

      return suspendedApproval;
    } catch (error) {
      logger.error('Error in ApprovalService.suspendRequest:', error);
      throw error;
    }
  }

  async reactivateRequest(id, notes, currentUser) {
    try {
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('Only Super Admin can reactivate requests');
      }

      const approval = await approvalRepository.findById(id);
      const reactivatedApproval = await approvalRepository.reactivate(id, currentUser.id, notes);

      await this.updateEntityApprovalStatus(approval, 'pending', currentUser.id);

      return reactivatedApproval;
    } catch (error) {
      logger.error('Error in ApprovalService.reactivateRequest:', error);
      throw error;
    }
  }

  async getPendingApprovals(filters, currentUser) {
    try {
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('You do not have permission to view pending approvals');
      }

      return await approvalRepository.getPendingApprovals(filters);
    } catch (error) {
      logger.error('Error in ApprovalService.getPendingApprovals:', error);
      throw error;
    }
  }

  async deleteApproval(id, currentUser) {
    try {
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('You do not have permission to delete approval requests');
      }

      return await approvalRepository.softDelete(id, currentUser.id);
    } catch (error) {
      logger.error('Error in ApprovalService.deleteApproval:', error);
      throw error;
    }
  }

  async updateEntityApprovalStatus(approval, status, actorId) {
    try {
      const requestType = approval.requestType || approval.request_type;
      const requestId = approval.requestId || approval.request_id;

      if (requestType === 'company_user') {
        await companyUserRepository.update(requestId, { approval_status: status }, actorId);
        const orgUser = await companyUserRepository.findById(requestId);
        if (orgUser) {
          const userId = orgUser.userId || orgUser.user_id || orgUser.id;
          if (userId) {
            await db.sequelize.query(
              `UPDATE users SET approval_status = ? WHERE id = ?`,
              { replacements: [status, userId] }
            );
          }
        }
      } else if (requestType === 'company') {
        const statusMap = {
          approved: 'active',
          rejected: 'inactive',
          suspended: 'suspended',
          pending: 'pending'
        };
        const companyStatus = statusMap[status] || 'pending';
        await companyRepository.update(requestId, { status: companyStatus }, actorId);
      } else if (requestType === 'organization_user') {
        await organizationUserRepository.update(requestId, { approval_status: status }, actorId);
        const orgUser = await organizationUserRepository.findById(requestId);
        if (orgUser) {
          const userId = orgUser.userId || orgUser.user_id || (orgUser.user && orgUser.user.id);
          if (userId) {
            await db.sequelize.query(
              `UPDATE users SET approval_status = ? WHERE id = ?`,
              { replacements: [status, userId] }
            );
          }
        }
      }
    } catch (error) {
      logger.error('Error in ApprovalService.updateEntityApprovalStatus:', error);
    }
  }
}

module.exports = new ApprovalService();
