const organizationUserRepository = require('./organizationUser.repository');
const ApiError = require('../../utils/ApiError');
const logger = require('../../config/logger');

class OrganizationUserService {
  async getAllOrganizationUsers(filters, currentUser) {
    try {
      // Super Admin can view all organization users
      // Organization users can view users in their own organization
      if (currentUser.role_slug === 'superadmin') {
        return await organizationUserRepository.findAll(filters);
      } else if (currentUser.role_slug === 'organizationuser' && 
                 (!filters.organization_id || filters.organization_id == currentUser.organization_id)) {
        return await organizationUserRepository.findAll({
          ...filters,
          organization_id: currentUser.organization_id
        });
      } else {
        throw ApiError.forbidden('You do not have permission to view organization users');
      }
    } catch (error) {
      logger.error('Error in OrganizationUserService.getAllOrganizationUsers:', error);
      throw error;
    }
  }

  async getOrganizationUserById(id, currentUser) {
    try {
      const orgUser = await organizationUserRepository.findById(id);

      // Super Admin can view any organization user
      // Organization users can view users in their own organization
      if (currentUser.role_slug === 'superadmin') {
        return orgUser;
      } else if (currentUser.role_slug === 'organizationuser' && 
                 orgUser.organization_id === currentUser.organization_id) {
        return orgUser;
      } else {
        throw ApiError.forbidden('You do not have permission to view this organization user');
      }
    } catch (error) {
      logger.error('Error in OrganizationUserService.getOrganizationUserById:', error);
      throw error;
    }
  }

  async createOrganizationUser(data, currentUser) {
    try {
      // Only Super Admin and Organization Users (in their own org) can create organization users
      if (currentUser.role_slug === 'superadmin') {
        return await organizationUserRepository.create(data, currentUser.id);
      } else if (currentUser.role_slug === 'organizationuser' && 
                 data.organization_id === currentUser.organization_id) {
        return await organizationUserRepository.create(data, currentUser.id);
      } else {
        throw ApiError.forbidden('You do not have permission to create organization users');
      }
    } catch (error) {
      logger.error('Error in OrganizationUserService.createOrganizationUser:', error);
      throw error;
    }
  }

  async createOrganizationUserWithUser(data, currentUser) {
    try {
      // Only Super Admin and Organization Users (in their own org) can create organization users with new user
      if (currentUser.role_slug === 'superadmin') {
        return await organizationUserRepository.createWithUser(data, currentUser.id);
      } else if (currentUser.role_slug === 'organizationuser' && 
                 data.organization_id === currentUser.organization_id) {
        return await organizationUserRepository.createWithUser(data, currentUser.id);
      } else {
        throw ApiError.forbidden('You do not have permission to create organization users');
      }
    } catch (error) {
      logger.error('Error in OrganizationUserService.createOrganizationUserWithUser:', error);
      throw error;
    }
  }

  async updateOrganizationUser(id, data, currentUser) {
    try {
      const orgUser = await organizationUserRepository.findById(id);

      // Super Admin can update any organization user
      // Organization users can update users in their own organization (limited fields)
      if (currentUser.role_slug === 'superadmin') {
        return await organizationUserRepository.update(id, data, currentUser.id);
      } else if (currentUser.role_slug === 'organizationuser' && 
                 orgUser.organization_id === currentUser.organization_id) {
        // Organization users can only update certain fields
        const allowedFields = {
          is_primary_contact: data.is_primary_contact,
          department: data.department,
          job_title: data.job_title
        };
        return await organizationUserRepository.update(id, allowedFields, currentUser.id);
      } else {
        throw ApiError.forbidden('You do not have permission to update this organization user');
      }
    } catch (error) {
      logger.error('Error in OrganizationUserService.updateOrganizationUser:', error);
      throw error;
    }
  }

  async deleteOrganizationUser(id, currentUser) {
    try {
      const orgUser = await organizationUserRepository.findById(id);

      // Super Admin can delete any organization user
      // Organization users can delete users in their own organization
      if (currentUser.role_slug === 'superadmin') {
        return await organizationUserRepository.softDelete(id, currentUser.id);
      } else if (currentUser.role_slug === 'organizationuser' && 
                 orgUser.organization_id === currentUser.organization_id) {
        return await organizationUserRepository.softDelete(id, currentUser.id);
      } else {
        throw ApiError.forbidden('You do not have permission to delete this organization user');
      }
    } catch (error) {
      logger.error('Error in OrganizationUserService.deleteOrganizationUser:', error);
      throw error;
    }
  }

  async approveOrganizationUser(id, currentUser) {
    try {
      // Only Super Admin can approve organization users
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('Only Super Admin can approve organization users');
      }

      const orgUser = await organizationUserRepository.update(id, {
        approval_status: 'approved'
      }, currentUser.id);

      // Also update the user's approval status
      await this.updateUserApprovalStatus(orgUser.user_id, 'approved', currentUser.id);

      return orgUser;
    } catch (error) {
      logger.error('Error in OrganizationUserService.approveOrganizationUser:', error);
      throw error;
    }
  }

  async rejectOrganizationUser(id, rejectionReason, currentUser) {
    try {
      // Only Super Admin can reject organization users
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('Only Super Admin can reject organization users');
      }

      const orgUser = await organizationUserRepository.update(id, {
        approval_status: 'rejected',
        rejection_reason: rejectionReason
      }, currentUser.id);

      // Also update the user's approval status
      await this.updateUserApprovalStatus(orgUser.user_id, 'rejected', currentUser.id);

      return orgUser;
    } catch (error) {
      logger.error('Error in OrganizationUserService.rejectOrganizationUser:', error);
      throw error;
    }
  }

  async suspendOrganizationUser(id, suspensionReason, currentUser) {
    try {
      // Only Super Admin can suspend organization users
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('Only Super Admin can suspend organization users');
      }

      const orgUser = await organizationUserRepository.update(id, {
        approval_status: 'suspended',
        suspension_reason: suspensionReason
      }, currentUser.id);

      // Also update the user's status
      await this.updateUserStatus(orgUser.user_id, 'suspended', currentUser.id);

      return orgUser;
    } catch (error) {
      logger.error('Error in OrganizationUserService.suspendOrganizationUser:', error);
      throw error;
    }
  }

  async reactivateOrganizationUser(id, currentUser) {
    try {
      // Only Super Admin can reactivate organization users
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('Only Super Admin can reactivate organization users');
      }

      const orgUser = await organizationUserRepository.update(id, {
        approval_status: 'pending'
      }, currentUser.id);

      // Also update the user's status
      await this.updateUserStatus(orgUser.user_id, 'active', currentUser.id);

      return orgUser;
    } catch (error) {
      logger.error('Error in OrganizationUserService.reactivateOrganizationUser:', error);
      throw error;
    }
  }

  async getPendingApprovals(currentUser) {
    try {
      // Only Super Admin can view pending approvals
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('You do not have permission to view pending approvals');
      }

      return await organizationUserRepository.getPendingApprovals();
    } catch (error) {
      logger.error('Error in OrganizationUserService.getPendingApprovals:', error);
      throw error;
    }
  }

  async getOrganizationUsers(organizationId, filters, currentUser) {
    try {
      // Super Admin can view any organization's users
      // Organization users can view their own organization's users
      if (currentUser.role_slug === 'superadmin') {
        return await organizationUserRepository.getByOrganization(organizationId, filters);
      } else if (currentUser.role_slug === 'organizationuser' && 
                 organizationId === currentUser.organization_id) {
        return await organizationUserRepository.getByOrganization(organizationId, filters);
      } else {
        throw ApiError.forbidden('You do not have permission to view these users');
      }
    } catch (error) {
      logger.error('Error in OrganizationUserService.getOrganizationUsers:', error);
      throw error;
    }
  }

  // Helper method to update user approval status
  async updateUserApprovalStatus(userId, approvalStatus, updatedBy) {
    const db = require('../../database/db');
    const query = `
      UPDATE users 
      SET approval_status = ?, approved_at = CURRENT_TIMESTAMP, approved_by = ?, updated_by = ?
      WHERE id = ?
    `;
    await db.execute(query, [approvalStatus, updatedBy, updatedBy, userId]);
  }

  // Helper method to update user status
  async updateUserStatus(userId, status, updatedBy) {
    const db = require('../../database/db');
    const query = `
      UPDATE users 
      SET status = ?, updated_by = ?
      WHERE id = ?
    `;
    await db.execute(query, [status, updatedBy, userId]);
  }
}

module.exports = new OrganizationUserService();
