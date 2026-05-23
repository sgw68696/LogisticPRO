const { User, Role, Company, Organization } = require('../../models');
const ApiError = require('../../utils/ApiError');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

class CompanyUserModel {
  static async findAll(filters = {}) {
    try {
      const {
        company_id,
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

      const where = { company_id: { [Op.ne]: null } };

      if (company_id) {
        where.company_id = company_id;
      }

      if (organization_id) {
        where.organization_id = organization_id;
      }

      if (approval_status) {
        where.approval_status = approval_status;
      }

      if (role_id) {
        where.role_id = role_id;
      }

      if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`;
        where[Op.or] = [
          { first_name: { [Op.like]: searchTerm } },
          { last_name: { [Op.like]: searchTerm } },
          { email: { [Op.like]: searchTerm } },
          { username: { [Op.like]: searchTerm } }
        ];
      }

      const allowedSortFields = ['first_name', 'last_name', 'email', 'username', 'approval_status', 'status', 'created_at', 'updated_at'];
      const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
      const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const { count, rows: users } = await User.findAndCountAll({
        where,
        include: [
          { model: Role, as: 'role', attributes: ['name', 'slug'] },
          { model: Company, as: 'company', attributes: ['name', 'uuid'] },
          { model: Organization, as: 'organization', attributes: ['name', 'uuid'] },
          { model: User, as: 'creator', attributes: ['first_name', 'last_name'] },
          { model: User, as: 'approver', attributes: ['first_name', 'last_name'] }
        ],
        order: [[sortField, sortDirection]],
        limit: limitNum,
        offset,
        distinct: true
      });

      return {
        companyUsers: users.map(u => ({
          ...u.toJSON(),
          company_name: u.company?.name || null,
          company_uuid: u.company?.uuid || null,
          organization_name: u.organization?.name || null,
          organization_uuid: u.organization?.uuid || null,
          created_by_name: u.creator?.first_name || null,
          created_by_lastname: u.creator?.last_name || null,
          approved_by_name: u.approver?.first_name || null,
          approved_by_lastname: u.approver?.last_name || null
        })),
        pagination: {
          total: count,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(count / limitNum)
        }
      };
    } catch (error) {
      throw ApiError.databaseError('Failed to fetch company users');
    }
  }

  static async findById(id) {
    try {
      const user = await User.findByPk(id, {
        include: [
          { model: Role, as: 'role', attributes: ['name', 'slug'] },
          { model: Company, as: 'company', attributes: ['name', 'uuid'] },
          { model: Organization, as: 'organization', attributes: ['name', 'uuid'] }
        ]
      });

      if (!user || !user.companyId) {
        return null;
      }

      return {
        ...user.toJSON(),
        company_name: user.company?.name || null,
        company_uuid: user.company?.uuid || null,
        organization_name: user.organization?.name || null,
        organization_uuid: user.organization?.uuid || null
      };
    } catch (error) {
      throw ApiError.databaseError('Failed to fetch company user');
    }
  }

  static async findByUuid(uuid) {
    try {
      const user = await User.findOne({
        where: { uuid },
        include: [
          { model: Role, as: 'role', attributes: ['name', 'slug'] },
          { model: Company, as: 'company', attributes: ['name', 'uuid'] },
          { model: Organization, as: 'organization', attributes: ['name', 'uuid'] }
        ]
      });

      if (!user || !user.companyId) {
        return null;
      }

      return {
        ...user.toJSON(),
        company_name: user.company?.name || null,
        company_uuid: user.company?.uuid || null,
        organization_name: user.organization?.name || null,
        organization_uuid: user.organization?.uuid || null
      };
    } catch (error) {
      throw ApiError.databaseError('Failed to fetch company user');
    }
  }

  static async findByEmail(email) {
    try {
      const user = await User.findOne({
        where: { email }
      });

      if (!user || !user.companyId) {
        return null;
      }

      return user;
    } catch (error) {
      throw ApiError.databaseError('Failed to fetch company user');
    }
  }

  static async create(data, createdBy) {
    try {
      const {
        company_id,
        organization_id,
        role_id,
        first_name,
        last_name,
        email,
        phone,
        username,
        password,
        status = 'active'
      } = data;

      const uuid = require('crypto').randomUUID();
      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await User.create({
        uuid,
        company_id,
        organization_id,
        role_id,
        first_name,
        last_name,
        email,
        phone: phone || null,
        username,
        password: hashedPassword,
        approval_status: 'pending',
        status,
        created_by: createdBy
      });

      return this.findById(user.id);
    } catch (error) {
      throw ApiError.databaseError('Failed to create company user');
    }
  }

  static async createWithCompany(data, createdBy) {
    const transaction = await User.sequelize.transaction();

    try {
      const {
        company_id,
        organization_id,
        first_name,
        last_name,
        email,
        phone,
        username,
        password,
        role_id,
        status = 'active'
      } = data;

      const hashedPassword = await bcrypt.hash(password, 12);
      const uuid = require('crypto').randomUUID();

      const user = await User.create({
        uuid,
        company_id,
        organization_id,
        role_id,
        first_name,
        last_name,
        email,
        phone: phone || null,
        username,
        password: hashedPassword,
        approval_status: 'pending',
        status,
        created_by: createdBy
      }, { transaction });

      await transaction.commit();

      return this.findById(user.id);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async update(id, data, updatedBy) {
    try {
      const user = await User.findByPk(id);

      if (!user) {
        throw ApiError.notFound('Company user not found');
      }

      const updateData = {};

      if (data.role_id !== undefined) updateData.roleId = data.role_id;
      if (data.roleId !== undefined) updateData.roleId = data.roleId;
      if (data.first_name !== undefined) updateData.firstName = data.first_name;
      if (data.firstName !== undefined) updateData.firstName = data.firstName;
      if (data.last_name !== undefined) updateData.lastName = data.last_name;
      if (data.lastName !== undefined) updateData.lastName = data.lastName;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.username !== undefined) updateData.username = data.username;
      if (data.status !== undefined) updateData.status = data.status;

      if (data.approval_status !== undefined) {
        updateData.approvalStatus = data.approval_status;

        if (data.approval_status === 'approved') {
          updateData.approvedAt = new Date();
          updateData.approvedBy = updatedBy;
        } else if (data.approval_status === 'rejected') {
          updateData.rejectedAt = new Date();
          updateData.rejectedBy = updatedBy;
        } else if (data.approval_status === 'suspended') {
          updateData.suspendedAt = new Date();
          updateData.suspendedBy = updatedBy;
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
        } else if (data.approvalStatus === 'suspended') {
          updateData.suspendedAt = new Date();
          updateData.suspendedBy = updatedBy;
        } else if (data.approvalStatus === 'pending') {
          updateData.reactivatedAt = new Date();
          updateData.reactivatedBy = updatedBy;
        }
      }

      updateData.updatedBy = updatedBy;

      await user.update(updateData);

      return this.findById(id);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.databaseError('Failed to update company user');
    }
  }

  static async softDelete(id, deletedBy) {
    try {
      const user = await User.findByPk(id);

      if (!user) {
        throw ApiError.notFound('Company user not found');
      }

      await user.destroy();

      return { message: 'Company user deleted successfully' };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.databaseError('Failed to delete company user');
    }
  }

  static async getPendingApprovals(companyId = null, organizationId = null) {
    try {
      const where = {
        approval_status: 'pending',
        company_id: { [Op.ne]: null }
      };

      if (companyId) {
        where.company_id = companyId;
      }

      if (organizationId) {
        where.organization_id = organizationId;
      }

      const users = await User.findAll({
        where,
        include: [
          { model: Role, as: 'role', attributes: ['name', 'slug'] },
          { model: Company, as: 'company', attributes: ['name', 'uuid'] },
          { model: Organization, as: 'organization', attributes: ['name', 'uuid'] }
        ],
        order: [['created_at', 'DESC']]
      });

      return users.map(u => ({
        ...u.toJSON(),
        company_name: u.company?.name || null,
        company_uuid: u.company?.uuid || null,
        organization_name: u.organization?.name || null,
        organization_uuid: u.organization?.uuid || null
      }));
    } catch (error) {
      throw ApiError.databaseError('Failed to fetch pending approvals');
    }
  }

  static async approveUser(id, approvedBy) {
    try {
      const user = await User.findByPk(id);

      if (!user) {
        throw ApiError.notFound('Company user not found');
      }

      await user.update({
        approval_status: 'approved',
        approved_at: new Date(),
        approved_by: approvedBy,
        status: 'active',
        updated_by: approvedBy
      });

      return this.findById(id);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.databaseError('Failed to approve company user');
    }
  }

  static async rejectUser(id, rejectedBy) {
    try {
      const user = await User.findByPk(id);

      if (!user) {
        throw ApiError.notFound('Company user not found');
      }

      await user.update({
        approval_status: 'rejected',
        rejected_at: new Date(),
        rejected_by: rejectedBy,
        status: 'inactive',
        updated_by: rejectedBy
      });

      return this.findById(id);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.databaseError('Failed to reject company user');
    }
  }

  static async suspendUser(id, suspendedBy) {
    try {
      const user = await User.findByPk(id);

      if (!user) {
        throw ApiError.notFound('Company user not found');
      }

      await user.update({
        approval_status: 'suspended',
        suspended_at: new Date(),
        suspended_by: suspendedBy,
        status: 'suspended',
        updated_by: suspendedBy
      });

      return this.findById(id);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.databaseError('Failed to suspend company user');
    }
  }

  static async reactivateUser(id, reactivatedBy) {
    try {
      const user = await User.findByPk(id);

      if (!user) {
        throw ApiError.notFound('Company user not found');
      }

      await user.update({
        approval_status: 'pending',
        reactivated_at: new Date(),
        reactivated_by: reactivatedBy,
        status: 'active',
        updated_by: reactivatedBy
      });

      return this.findById(id);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.databaseError('Failed to reactivate company user');
    }
  }
}

module.exports = CompanyUserModel;
