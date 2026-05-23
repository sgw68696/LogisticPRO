const { OrganizationUser, User, Role, Organization } = require('../../models');
const ApiError = require('../../utils/ApiError');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

class OrganizationUserModel {
  static async findAll(filters = {}) {
    try {
      const {
        organization_id,
        approval_status,
        role_id,
        search,
        page = 1,
        limit = 10,
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = filters;

      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const offset = (pageNum - 1) * limitNum;

      const where = {};

      if (organization_id) {
        where.organization_id = organization_id;
      }

      if (approval_status) {
        where.approval_status = approval_status;
      }

      if (role_id) {
        where.role_id = role_id;
      }

      const userWhere = {};
      if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`;
        userWhere[Op.or] = [
          { first_name: { [Op.like]: searchTerm } },
          { last_name: { [Op.like]: searchTerm } },
          { email: { [Op.like]: searchTerm } }
        ];
      }

      const allowedSortFields = ['first_name', 'last_name', 'email', 'approval_status', 'created_at', 'updated_at'];
      const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
      const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const { count, rows: orgUsers } = await OrganizationUser.findAndCountAll({
        where,
        include: [
          { model: User, as: 'user', attributes: ['uuid', 'first_name', 'last_name', 'email', 'phone', 'username', 'status', 'last_login_at'], where: Object.keys(userWhere).length ? userWhere : undefined },
          { model: Role, as: 'role', attributes: ['name', 'slug'] },
          { model: Organization, as: 'organization', attributes: ['name', 'uuid'] },
          { model: User, as: 'creator', attributes: ['first_name', 'last_name'] },
          { model: User, as: 'approver', attributes: ['first_name', 'last_name'] }
        ],
        order: [[{ model: User, as: 'user' }, sortField, sortDirection]],
        limit: limitNum,
        offset,
        distinct: true
      });

      return {
        organizationUsers: orgUsers.map(ou => ({
          ...ou.toJSON(),
          user_uuid: ou.user?.uuid || null,
          user_status: ou.user?.status || null,
          last_login_at: ou.user?.last_login_at || null,
          organization_name: ou.organization?.name || null,
          organization_uuid: ou.organization?.uuid || null,
          created_by_name: ou.creator?.first_name || null,
          created_by_lastname: ou.creator?.last_name || null,
          approved_by_name: ou.approver?.first_name || null,
          approved_by_lastname: ou.approver?.last_name || null
        })),
        pagination: {
          total: count,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(count / limitNum)
        }
      };
    } catch (error) {
      throw ApiError.databaseError('Failed to fetch organization users');
    }
  }

  static async findById(id) {
    try {
      const orgUser = await OrganizationUser.findByPk(id, {
        include: [
          { model: User, as: 'user', attributes: ['uuid', 'first_name', 'last_name', 'email', 'phone', 'username', 'status', 'last_login_at'] },
          { model: Role, as: 'role', attributes: ['name', 'slug'] },
          { model: Organization, as: 'organization', attributes: ['name', 'uuid'] }
        ]
      });

      if (!orgUser) {
        return null;
      }

      return {
        ...orgUser.toJSON(),
        user_uuid: orgUser.user?.uuid || null,
        user_status: orgUser.user?.status || null,
        last_login_at: orgUser.user?.last_login_at || null,
        organization_name: orgUser.organization?.name || null,
        organization_uuid: orgUser.organization?.uuid || null
      };
    } catch (error) {
      throw ApiError.databaseError('Failed to fetch organization user');
    }
  }

  static async findByUuid(uuid) {
    try {
      const orgUser = await OrganizationUser.findOne({
        where: { uuid },
        include: [
          { model: User, as: 'user', attributes: ['uuid', 'first_name', 'last_name', 'email', 'phone', 'username', 'status'] },
          { model: Role, as: 'role', attributes: ['name', 'slug'] },
          { model: Organization, as: 'organization', attributes: ['name', 'uuid'] }
        ]
      });

      if (!orgUser) {
        return null;
      }

      return {
        ...orgUser.toJSON(),
        user_uuid: orgUser.user?.uuid || null,
        user_status: orgUser.user?.status || null,
        organization_name: orgUser.organization?.name || null,
        organization_uuid: orgUser.organization?.uuid || null
      };
    } catch (error) {
      throw ApiError.databaseError('Failed to fetch organization user');
    }
  }

  static async findByOrganizationAndUser(organizationId, userId) {
    try {
      const orgUser = await OrganizationUser.findOne({
        where: { organization_id: organizationId, user_id: userId },
        include: [
          { model: User, as: 'user', attributes: ['uuid', 'first_name', 'last_name', 'email'] },
          { model: Role, as: 'role', attributes: ['name', 'slug'] }
        ]
      });

      if (!orgUser) {
        return null;
      }

      return {
        ...orgUser.toJSON(),
        user_uuid: orgUser.user?.uuid || null
      };
    } catch (error) {
      throw ApiError.databaseError('Failed to fetch organization user');
    }
  }

  static async create(data, createdBy) {
    try {
      const {
        organization_id,
        user_id,
        role_id,
        is_primary_contact = false,
        department,
        job_title
      } = data;

      const uuid = require('crypto').randomUUID();

      const orgUser = await OrganizationUser.create({
        uuid,
        organization_id,
        user_id,
        role_id,
        approval_status: 'pending',
        is_primary_contact,
        department: department || null,
        job_title: job_title || null,
        created_by: createdBy
      });

      return this.findById(orgUser.id);
    } catch (error) {
      throw ApiError.databaseError('Failed to create organization user');
    }
  }

  static async createWithUser(data, createdBy) {
    const transaction = await OrganizationUser.sequelize.transaction();

    try {
      const {
        organization_id,
        first_name,
        last_name,
        email,
        phone,
        username,
        password,
        role_id,
        is_primary_contact = false,
        department,
        job_title
      } = data;

      const hashedPassword = await bcrypt.hash(password, 12);
      const userUuid = require('crypto').randomUUID();

      const user = await User.create({
        uuid: userUuid,
        organization_id,
        role_id,
        first_name,
        last_name,
        email,
        phone: phone || null,
        username,
        password: hashedPassword,
        approval_status: 'pending',
        created_by: createdBy
      }, { transaction });

      const orgUserUuid = require('crypto').randomUUID();

      const orgUser = await OrganizationUser.create({
        uuid: orgUserUuid,
        organization_id,
        user_id: user.id,
        role_id,
        approval_status: 'pending',
        is_primary_contact,
        department: department || null,
        job_title: job_title || null,
        created_by: createdBy
      }, { transaction });

      await transaction.commit();

      return this.findById(orgUser.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async update(id, data, updatedBy) {
    try {
      const orgUser = await OrganizationUser.findByPk(id);

      if (!orgUser) {
        throw ApiError.notFound('Organization user not found');
      }

      const updateData = {};

      if (data.role_id !== undefined) updateData.roleId = data.role_id;
      if (data.roleId !== undefined) updateData.roleId = data.roleId;
      if (data.is_primary_contact !== undefined) updateData.isPrimaryContact = data.is_primary_contact;
      if (data.isPrimaryContact !== undefined) updateData.isPrimaryContact = data.isPrimaryContact;
      if (data.department !== undefined) updateData.department = data.department;
      if (data.job_title !== undefined) updateData.jobTitle = data.job_title;
      if (data.jobTitle !== undefined) updateData.jobTitle = data.jobTitle;

      if (data.approval_status !== undefined) {
        updateData.approvalStatus = data.approval_status;

        if (data.approval_status === 'approved') {
          updateData.approvedAt = new Date();
          updateData.approvedBy = updatedBy;
        } else if (data.approval_status === 'rejected') {
          updateData.rejectedAt = new Date();
          updateData.rejectedBy = updatedBy;
          updateData.rejectionReason = data.rejection_reason || null;
        } else if (data.approval_status === 'suspended') {
          updateData.suspendedAt = new Date();
          updateData.suspendedBy = updatedBy;
          updateData.suspensionReason = data.suspension_reason || null;
        } else if (data.approval_status === 'pending') {
          updateData.reactivatedAt = new Date();
          updateData.reactivatedBy = updatedBy;
        }
      }
      if (data.approvalStatus !== undefined) {
        updateData.approvalStatus = data.approvalStatus;

        if (data.approvalStatus === 'approved') {
          updateData.approvedAt = new Date();
          updateData.approvedBy = updatedBy;
        } else if (data.approvalStatus === 'rejected') {
          updateData.rejectedAt = new Date();
          updateData.rejectedBy = updatedBy;
          updateData.rejectionReason = data.rejection_reason || data.rejectionReason || null;
        } else if (data.approvalStatus === 'suspended') {
          updateData.suspendedAt = new Date();
          updateData.suspendedBy = updatedBy;
          updateData.suspensionReason = data.suspension_reason || data.suspensionReason || null;
        } else if (data.approvalStatus === 'pending') {
          updateData.reactivatedAt = new Date();
          updateData.reactivatedBy = updatedBy;
        }
      }

      updateData.updatedBy = updatedBy;

      await orgUser.update(updateData);

      return this.findById(id);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.databaseError('Failed to update organization user');
    }
  }

  static async softDelete(id, deletedBy) {
    try {
      const orgUser = await OrganizationUser.findByPk(id);

      if (!orgUser) {
        throw ApiError.notFound('Organization user not found');
      }

      await orgUser.destroy();

      return { message: 'Organization user deleted successfully' };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.databaseError('Failed to delete organization user');
    }
  }

  static async getPendingApprovals(organizationId = null) {
    try {
      const where = { approval_status: 'pending' };

      if (organizationId) {
        where.organization_id = organizationId;
      }

      const orgUsers = await OrganizationUser.findAll({
        where,
        include: [
          { model: User, as: 'user', attributes: ['uuid', 'first_name', 'last_name', 'email', 'phone', 'username'] },
          { model: Role, as: 'role', attributes: ['name', 'slug'] },
          { model: Organization, as: 'organization', attributes: ['name', 'uuid'] }
        ],
        order: [['created_at', 'DESC']]
      });

      return orgUsers.map(ou => ({
        ...ou.toJSON(),
        user_uuid: ou.user?.uuid || null,
        organization_name: ou.organization?.name || null,
        organization_uuid: ou.organization?.uuid || null
      }));
    } catch (error) {
      throw ApiError.databaseError('Failed to fetch pending approvals');
    }
  }

  static async getByOrganization(organizationId, filters = {}) {
    try {
      const {
        approval_status,
        role_id,
        page = 1,
        limit = 10
      } = filters;

      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const offset = (pageNum - 1) * limitNum;

      const where = { organization_id: organizationId };

      if (approval_status) {
        where.approval_status = approval_status;
      }

      if (role_id) {
        where.role_id = role_id;
      }

      const { count, rows: users } = await OrganizationUser.findAndCountAll({
        where,
        include: [
          { model: User, as: 'user', attributes: ['uuid', 'first_name', 'last_name', 'email', 'phone', 'username', 'status'] },
          { model: Role, as: 'role', attributes: ['name', 'slug'] }
        ],
        order: [['created_at', 'DESC']],
        limit: limitNum,
        offset
      });

      return {
        users,
        pagination: {
          total: count,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(count / limitNum)
        }
      };
    } catch (error) {
      throw ApiError.databaseError('Failed to fetch organization users');
    }
  }
}

module.exports = OrganizationUserModel;
