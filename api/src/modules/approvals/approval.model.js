const { ApprovalRequest, User, Organization, Company, OrganizationUser } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { Op } = require('sequelize');

class ApprovalModel {
  static async findAll(filters = {}) {
    try {
      const {
        request_type,
        approval_status,
        requested_by,
        page = 1,
        limit = 10,
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = filters;

      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const offset = (pageNum - 1) * limitNum;

      const where = {};

      if (request_type) {
        where.request_type = request_type;
      }

      if (approval_status) {
        where.approval_status = approval_status;
      }

      if (requested_by) {
        where.requested_by = requested_by;
      }

      const allowedSortFields = ['request_type', 'approval_status', 'created_at', 'updated_at'];
      const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
      const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const { count, rows: approvals } = await ApprovalRequest.findAndCountAll({
        where,
        include: [
          { model: User, as: 'requester', attributes: ['first_name', 'last_name', 'email'] },
          { model: User, as: 'approver', attributes: ['first_name', 'last_name'] },
          { model: User, as: 'rejector', attributes: ['first_name', 'last_name'] },
          { model: User, as: 'suspender', attributes: ['first_name', 'last_name'] }
        ],
        order: [[sortField, sortDirection]],
        limit: limitNum,
        offset,
        distinct: true
      });

      const approvalsWithDetails = await Promise.all(
        approvals.map(async (approval) => {
          const result = approval.toJSON();

          result.requested_by_name = approval.requester?.first_name || null;
          result.requested_by_lastname = approval.requester?.last_name || null;
          result.requested_by_email = approval.requester?.email || null;
          result.approved_by_name = approval.approver?.first_name || null;
          result.approved_by_lastname = approval.approver?.last_name || null;
          result.rejected_by_name = approval.rejector?.first_name || null;
          result.rejected_by_lastname = approval.rejector?.last_name || null;
          result.suspended_by_name = approval.suspender?.first_name || null;
          result.suspended_by_lastname = approval.suspender?.last_name || null;

          if (approval.request_type === 'organization') {
            const org = await Organization.findByPk(approval.request_id, { attributes: ['name'] });
            result.entity_name = org?.name || null;
            result.organization_name = org?.name || null;
            result.company_name = null;
          } else if (approval.request_type === 'organization_user') {
            const orgUser = await OrganizationUser.findByPk(approval.request_id, {
              include: [{ model: Organization, as: 'organization', attributes: ['name'] }]
            });
            result.entity_name = orgUser?.organization?.name || null;
            result.organization_name = orgUser?.organization?.name || null;
            result.company_name = null;
          } else if (approval.request_type === 'company') {
            const company = await Company.findByPk(approval.request_id, {
              include: [{ model: Organization, as: 'organization', attributes: ['name'] }]
            });
            result.entity_name = company?.name || null;
            result.organization_name = company?.organization?.name || null;
            result.company_name = company?.name || null;
          } else if (approval.request_type === 'company_user') {
            const user = await User.findByPk(approval.request_id, {
              include: [{ model: Company, as: 'company', attributes: ['name'] }]
            });
            result.entity_name = user?.company?.name || null;
            result.company_name = user?.company?.name || null;
            result.organization_name = null;
          }

          return result;
        })
      );

      return {
        approvals: approvalsWithDetails,
        pagination: {
          total: count,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(count / limitNum)
        }
      };
    } catch (error) {
      throw ApiError.databaseError('Failed to fetch approval requests');
    }
  }

  static async findById(id) {
    try {
      const approval = await ApprovalRequest.findByPk(id, {
        include: [
          { model: User, as: 'requester', attributes: ['first_name', 'last_name', 'email'] },
          { model: User, as: 'approver', attributes: ['first_name', 'last_name'] },
          { model: User, as: 'rejector', attributes: ['first_name', 'last_name'] }
        ]
      });

      if (!approval) {
        return null;
      }

      const result = approval.toJSON();

      result.requested_by_name = approval.requester?.first_name || null;
      result.requested_by_lastname = approval.requester?.last_name || null;
      result.requested_by_email = approval.requester?.email || null;
      result.approved_by_name = approval.approver?.first_name || null;
      result.approved_by_lastname = approval.approver?.last_name || null;
      result.rejected_by_name = approval.rejector?.first_name || null;
      result.rejected_by_lastname = approval.rejector?.last_name || null;

      if (approval.request_type === 'organization') {
        const org = await Organization.findByPk(approval.request_id, { attributes: ['name'] });
        result.entity_name = org?.name || null;
        result.organization_name = org?.name || null;
        result.company_name = null;
      } else if (approval.request_type === 'organization_user') {
        const orgUser = await OrganizationUser.findByPk(approval.request_id, {
          include: [{ model: Organization, as: 'organization', attributes: ['name'] }]
        });
        result.entity_name = orgUser?.organization?.name || null;
        result.organization_name = orgUser?.organization?.name || null;
        result.company_name = null;
      } else if (approval.request_type === 'company') {
        const company = await Company.findByPk(approval.request_id, {
          include: [{ model: Organization, as: 'organization', attributes: ['name'] }]
        });
        result.entity_name = company?.name || null;
        result.organization_name = company?.organization?.name || null;
        result.company_name = company?.name || null;
      } else if (approval.request_type === 'company_user') {
        const user = await User.findByPk(approval.request_id, {
          include: [{ model: Company, as: 'company', attributes: ['name'] }]
        });
        result.entity_name = user?.company?.name || null;
        result.company_name = user?.company?.name || null;
        result.organization_name = null;
      }

      return result;
    } catch (error) {
      throw ApiError.databaseError('Failed to fetch approval request');
    }
  }

  static async findByUuid(uuid) {
    try {
      const approval = await ApprovalRequest.findOne({
        where: { uuid },
        include: [
          { model: User, as: 'requester', attributes: ['first_name', 'last_name', 'email'] },
          { model: User, as: 'approver', attributes: ['first_name', 'last_name'] }
        ]
      });

      if (!approval) {
        return null;
      }

      const result = approval.toJSON();

      result.requested_by_name = approval.requester?.first_name || null;
      result.requested_by_lastname = approval.requester?.last_name || null;
      result.requested_by_email = approval.requester?.email || null;
      result.approved_by_name = approval.approver?.first_name || null;
      result.approved_by_lastname = approval.approver?.last_name || null;

      if (approval.request_type === 'organization') {
        const org = await Organization.findByPk(approval.request_id, { attributes: ['name'] });
        result.entity_name = org?.name || null;
        result.organization_name = org?.name || null;
        result.company_name = null;
      } else if (approval.request_type === 'organization_user') {
        const orgUser = await OrganizationUser.findByPk(approval.request_id, {
          include: [{ model: Organization, as: 'organization', attributes: ['name'] }]
        });
        result.entity_name = orgUser?.organization?.name || null;
        result.organization_name = orgUser?.organization?.name || null;
        result.company_name = null;
      } else if (approval.request_type === 'company') {
        const company = await Company.findByPk(approval.request_id, {
          include: [{ model: Organization, as: 'organization', attributes: ['name'] }]
        });
        result.entity_name = company?.name || null;
        result.organization_name = company?.organization?.name || null;
        result.company_name = company?.name || null;
      } else if (approval.request_type === 'company_user') {
        const user = await User.findByPk(approval.request_id, {
          include: [{ model: Company, as: 'company', attributes: ['name'] }]
        });
        result.entity_name = user?.company?.name || null;
        result.company_name = user?.company?.name || null;
        result.organization_name = null;
      }

      return result;
    } catch (error) {
      throw ApiError.databaseError('Failed to fetch approval request');
    }
  }

  static async create(data, createdBy) {
    try {
      const {
        request_type,
        request_id,
        requested_by,
        notes,
        metadata
      } = data;

      const uuid = require('crypto').randomUUID();

      const approval = await ApprovalRequest.create({
        uuid,
        request_type,
        request_id,
        requested_by,
        approval_status: 'pending',
        notes: notes || null,
        metadata: metadata ? JSON.stringify(metadata) : null
      });

      return this.findById(approval.id);
    } catch (error) {
      throw ApiError.databaseError('Failed to create approval request');
    }
  }

  static async approve(id, approvedBy, notes = null) {
    try {
      const approval = await ApprovalRequest.findByPk(id);

      if (!approval) {
        throw ApiError.notFound('Approval request not found');
      }

      if (approval.approvalStatus !== 'pending') {
        throw ApiError.badRequest('Approval request is not pending');
      }

      await approval.update({
        approvalStatus: 'approved',
        approvedAt: new Date(),
        approvedBy: approvedBy,
        notes: notes || approval.notes
      });

      return this.findById(id);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.databaseError('Failed to approve request');
    }
  }

  static async reject(id, rejectedBy, notes = null) {
    try {
      const approval = await ApprovalRequest.findByPk(id);

      if (!approval) {
        throw ApiError.notFound('Approval request not found');
      }

      if (approval.approvalStatus !== 'pending') {
        throw ApiError.badRequest('Approval request is not pending');
      }

      await approval.update({
        approvalStatus: 'rejected',
        rejectedAt: new Date(),
        rejectedBy: rejectedBy,
        notes: notes || approval.notes
      });

      return this.findById(id);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.databaseError('Failed to reject request');
    }
  }

  static async suspend(id, suspendedBy, notes = null) {
    try {
      const approval = await ApprovalRequest.findByPk(id);

      if (!approval) {
        throw ApiError.notFound('Approval request not found');
      }

      if (!['approved', 'pending'].includes(approval.approvalStatus)) {
        throw ApiError.badRequest('Approval request cannot be suspended');
      }

      await approval.update({
        approvalStatus: 'suspended',
        suspendedAt: new Date(),
        suspendedBy: suspendedBy,
        notes: notes || approval.notes
      });

      return this.findById(id);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.databaseError('Failed to suspend request');
    }
  }

  static async reactivate(id, reactivatedBy, notes = null) {
    try {
      const approval = await ApprovalRequest.findByPk(id);

      if (!approval) {
        throw ApiError.notFound('Approval request not found');
      }

      if (approval.approvalStatus !== 'suspended') {
        throw ApiError.badRequest('Approval request is not suspended');
      }

      await approval.update({
        approvalStatus: 'pending',
        reactivatedAt: new Date(),
        reactivatedBy: reactivatedBy,
        notes: notes || approval.notes
      });

      return this.findById(id);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.databaseError('Failed to reactivate request');
    }
  }

  static async getPendingApprovals(filters = {}) {
    try {
      const { request_type } = filters;

      const where = { approval_status: 'pending' };

      if (request_type) {
        where.request_type = request_type;
      }

      const approvals = await ApprovalRequest.findAll({
        where,
        include: [
          { model: User, as: 'requester', attributes: ['first_name', 'last_name', 'email'] }
        ],
        order: [['created_at', 'DESC']]
      });

      const approvalsWithDetails = await Promise.all(
        approvals.map(async (approval) => {
          const result = approval.toJSON();

          result.requested_by_name = approval.requester?.first_name || null;
          result.requested_by_lastname = approval.requester?.last_name || null;
          result.requested_by_email = approval.requester?.email || null;

          if (approval.request_type === 'organization') {
            const org = await Organization.findByPk(approval.request_id, { attributes: ['name'] });
            result.entity_name = org?.name || null;
            result.organization_name = org?.name || null;
            result.company_name = null;
          } else if (approval.request_type === 'organization_user') {
            const orgUser = await OrganizationUser.findByPk(approval.request_id, {
              include: [{ model: Organization, as: 'organization', attributes: ['name'] }]
            });
            result.entity_name = orgUser?.organization?.name || null;
            result.organization_name = orgUser?.organization?.name || null;
            result.company_name = null;
          } else if (approval.request_type === 'company') {
            const company = await Company.findByPk(approval.request_id, {
              include: [{ model: Organization, as: 'organization', attributes: ['name'] }]
            });
            result.entity_name = company?.name || null;
            result.organization_name = company?.organization?.name || null;
            result.company_name = company?.name || null;
          } else if (approval.request_type === 'company_user') {
            const user = await User.findByPk(approval.request_id, {
              include: [{ model: Company, as: 'company', attributes: ['name'] }]
            });
            result.entity_name = user?.company?.name || null;
            result.company_name = user?.company?.name || null;
            result.organization_name = null;
          }

          return result;
        })
      );

      return approvalsWithDetails;
    } catch (error) {
      throw ApiError.databaseError('Failed to fetch pending approvals');
    }
  }

  static async softDelete(id, deletedBy) {
    try {
      const approval = await ApprovalRequest.findByPk(id);

      if (!approval) {
        throw ApiError.notFound('Approval request not found');
      }

      await approval.destroy();

      return { message: 'Approval request deleted successfully' };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.databaseError('Failed to delete approval request');
    }
  }
}

module.exports = ApprovalModel;
