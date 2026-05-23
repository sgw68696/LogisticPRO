const { Organization, User, Company, OrganizationUser, Role } = require('../../models');
const ApiError = require('../../utils/ApiError');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

class OrganizationModel {
  static async findAll(filters = {}) {
    try {
      const {
        search,
        status,
        subscription_status,
        page = 1,
        limit = 10,
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = filters;

      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const offset = (pageNum - 1) * limitNum;

      const where = {};

      if (search && search.trim()) {
        const searchTerm = `%${search.trim()}%`;
        where[Op.or] = [
          { name: { [Op.like]: searchTerm } },
          { email: { [Op.like]: searchTerm } },
          { registration_number: { [Op.like]: searchTerm } }
        ];
      }

      if (status) {
        where.status = status;
      }

      if (subscription_status) {
        where.subscription_status = subscription_status;
      }

      const allowedSortFields = ['name', 'email', 'status', 'subscription_status', 'created_at', 'updated_at'];
      const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
      const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const { count, rows: organizations } = await Organization.findAndCountAll({
        where,
        include: [
          { model: User, as: 'creator', attributes: ['first_name', 'last_name'] },
          { model: User, as: 'updater', attributes: ['first_name', 'last_name'] }
        ],
        order: [[sortField, sortDirection]],
        limit: limitNum,
        offset,
        distinct: true
      });

      const organizationsWithCounts = await Promise.all(
        organizations.map(async (org) => {
          const [totalCompanies, totalUsers] = await Promise.all([
            Company.count({ where: { organization_id: org.id, deleted_at: null } }),
            OrganizationUser.count({ where: { organization_id: org.id, deleted_at: null } })
          ]);

          return {
            ...org.toJSON(),
            total_companies: totalCompanies,
            total_users: totalUsers,
            created_by_name: org.creator?.first_name || null,
            created_by_lastname: org.creator?.last_name || null,
            updated_by_name: org.updater?.first_name || null,
            updated_by_lastname: org.updater?.last_name || null
          };
        })
      );

      return {
        organizations: organizationsWithCounts,
        pagination: {
          total: count,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(count / limitNum)
        }
      };
    } catch (error) {
      throw ApiError.databaseError('Failed to fetch organizations');
    }
  }

  static async findAllSimple() {
    try {
      return await Organization.findAll({
        attributes: ['id', 'uuid', 'name', 'email', 'status'],
        where: { status: 'active' },
        order: [['name', 'ASC']]
      });
    } catch (error) {
      throw ApiError.databaseError('Failed to fetch organizations');
    }
  }

  static async findById(id) {
    try {
      const organization = await Organization.findByPk(id, {
        include: [
          { model: User, as: 'creator', attributes: ['first_name', 'last_name'] },
          { model: User, as: 'updater', attributes: ['first_name', 'last_name'] }
        ]
      });

      if (!organization) {
        return null;
      }

      const [totalCompanies, totalUsers] = await Promise.all([
        Company.count({ where: { organization_id: id, deleted_at: null } }),
        OrganizationUser.count({ where: { organization_id: id, deleted_at: null } })
      ]);

      return {
        ...organization.toJSON(),
        total_companies: totalCompanies,
        total_users: totalUsers,
        created_by_name: organization.creator?.first_name || null,
        created_by_lastname: organization.creator?.last_name || null,
        updated_by_name: organization.updater?.first_name || null,
        updated_by_lastname: organization.updater?.last_name || null
      };
    } catch (error) {
      throw ApiError.databaseError('Failed to fetch organization');
    }
  }

  static async findByUuid(uuid) {
    try {
      const organization = await Organization.findOne({
        where: { uuid },
        include: [
          { model: User, as: 'creator', attributes: ['first_name', 'last_name'] },
          { model: User, as: 'updater', attributes: ['first_name', 'last_name'] }
        ]
      });

      if (!organization) {
        return null;
      }

      const [totalCompanies, totalUsers] = await Promise.all([
        Company.count({ where: { organization_id: organization.id, deleted_at: null } }),
        OrganizationUser.count({ where: { organization_id: organization.id, deleted_at: null } })
      ]);

      return {
        ...organization.toJSON(),
        total_companies: totalCompanies,
        total_users: totalUsers
      };
    } catch (error) {
      throw ApiError.databaseError('Failed to fetch organization');
    }
  }

  static async findByEmail(email) {
    try {
      return await Organization.findOne({ where: { email } });
    } catch (error) {
      throw ApiError.databaseError('Failed to fetch organization');
    }
  }

  static async create(data, createdBy) {
    try {
      const {
        name,
        registration_number,
        tax_id,
        email,
        phone,
        website,
        address_line1,
        address_line2,
        city,
        state,
        country,
        postal_code,
        subscription_status = 'trial',
        subscription_start_date,
        subscription_end_date,
        max_companies = 10,
        max_users_per_company = 50,
        status = 'pending'
      } = data;

      const uuid = require('crypto').randomUUID();

      const organization = await Organization.create({
        uuid,
        name,
        registration_number: registration_number || null,
        tax_id: tax_id || null,
        email,
        phone: phone || null,
        website: website || null,
        address_line1: address_line1 || null,
        address_line2: address_line2 || null,
        city: city || null,
        state: state || null,
        country: country || null,
        postal_code: postal_code || null,
        subscription_status,
        subscription_start_date: subscription_start_date || null,
        subscription_end_date: subscription_end_date || null,
        max_companies,
        max_users_per_company,
        status,
        created_by: createdBy
      });

      return this.findById(organization.id);
    } catch (error) {
      throw ApiError.databaseError('Failed to create organization');
    }
  }

  static async createWithUser(data, createdBy) {
    const transaction = await Organization.sequelize.transaction();

    try {
      const {
        name,
        registration_number,
        tax_id,
        email,
        phone,
        website,
        address_line1,
        address_line2,
        city,
        state,
        country,
        postal_code,
        subscription_status = 'trial',
        subscription_start_date,
        subscription_end_date,
        max_companies = 10,
        max_users_per_company = 50,
        status = 'pending',
        user_first_name,
        user_last_name,
        user_email,
        user_phone,
        user_username,
        user_password,
        user_role_slug,
        user_role_id,
        user_department,
        user_job_title
      } = data;

      const orgUuid = require('crypto').randomUUID();

      const organization = await Organization.create({
        uuid: orgUuid,
        name,
        registration_number: registration_number || null,
        tax_id: tax_id || null,
        email,
        phone: phone || null,
        website: website || null,
        address_line1: address_line1 || null,
        address_line2: address_line2 || null,
        city: city || null,
        state: state || null,
        country: country || null,
        postal_code: postal_code || null,
        subscription_status,
        subscription_start_date: subscription_start_date || null,
        subscription_end_date: subscription_end_date || null,
        max_companies,
        max_users_per_company,
        status,
        created_by: createdBy
      }, { transaction });

      const organizationId = organization.id;

      const uFirstName = user_first_name || name;
      const uLastName = user_last_name || 'Admin';
      const uEmail = user_email || `admin-${orgUuid}@${email.split('@')[1] || 'system.local'}`;
      const uPassword = user_password || 'Admin@123456';
      const uUsername = user_username || uEmail;

      const hashedPassword = await bcrypt.hash(uPassword, 12);
      const userUuid = require('crypto').randomUUID();

      const roleSlug = user_role_slug || 'organizationuser';
      const role = await Role.findOne({ where: { slug: roleSlug }, transaction });
      const roleId = role ? role.id : user_role_id;

      const user = await User.create({
        uuid: userUuid,
        organization_id: organizationId,
        role_id: roleId,
        first_name: uFirstName,
        last_name: uLastName,
        email: uEmail,
        phone: user_phone || null,
        username: uUsername,
        password: hashedPassword,
        approval_status: 'pending',
        status: 'active',
        created_by: createdBy
      }, { transaction });

      const userId = user.id;

      const orgUserUuid = require('crypto').randomUUID();

      const orgUser = await OrganizationUser.create({
        uuid: orgUserUuid,
        organization_id: organizationId,
        user_id: userId,
        role_id: roleId,
        approval_status: 'pending',
        is_primary_contact: true,
        department: user_department || null,
        job_title: user_job_title || null,
        created_by: createdBy
      }, { transaction });

      const orgUserId = orgUser.id;

      const approvalUuid = require('crypto').randomUUID();

      const { ApprovalRequest } = require('../../models');
      await ApprovalRequest.create({
        uuid: approvalUuid,
        request_type: 'organization_user',
        request_id: orgUserId,
        requested_by: createdBy,
        approval_status: 'pending'
      }, { transaction });

      await transaction.commit();

      return this.findById(organizationId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async update(id, data, updatedBy) {
    try {
      const organization = await Organization.findByPk(id);

      if (!organization) {
        throw ApiError.notFound('Organization not found');
      }

      const updateData = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.registration_number !== undefined) updateData.registration_number = data.registration_number;
      if (data.tax_id !== undefined) updateData.tax_id = data.tax_id;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.website !== undefined) updateData.website = data.website;
      if (data.address_line1 !== undefined) updateData.address_line1 = data.address_line1;
      if (data.address_line2 !== undefined) updateData.address_line2 = data.address_line2;
      if (data.city !== undefined) updateData.city = data.city;
      if (data.state !== undefined) updateData.state = data.state;
      if (data.country !== undefined) updateData.country = data.country;
      if (data.postal_code !== undefined) updateData.postal_code = data.postal_code;
      if (data.subscription_status !== undefined) updateData.subscription_status = data.subscription_status;
      if (data.subscription_start_date !== undefined) updateData.subscription_start_date = data.subscription_start_date;
      if (data.subscription_end_date !== undefined) updateData.subscription_end_date = data.subscription_end_date;
      if (data.max_companies !== undefined) updateData.max_companies = data.max_companies;
      if (data.max_users_per_company !== undefined) updateData.max_users_per_company = data.max_users_per_company;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.is_verified !== undefined) {
        updateData.is_verified = data.is_verified;
        if (data.is_verified) {
          updateData.verified_at = new Date();
          updateData.verified_by = updatedBy;
        }
      }

      updateData.updated_by = updatedBy;

      await organization.update(updateData);

      return this.findById(id);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.databaseError('Failed to update organization');
    }
  }

  static async softDelete(id, deletedBy) {
    try {
      const organization = await Organization.findByPk(id);

      if (!organization) {
        throw ApiError.notFound('Organization not found');
      }

      await organization.destroy();

      return { message: 'Organization deleted successfully' };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.databaseError('Failed to delete organization');
    }
  }

  static async getCompanies(organizationId, filters = {}) {
    try {
      const {
        status,
        subscription_status,
        page = 1,
        limit = 10
      } = filters;

      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const offset = (pageNum - 1) * limitNum;

      const where = { organization_id: organizationId };

      if (status) {
        where.status = status;
      }

      if (subscription_status) {
        where.subscription_status = subscription_status;
      }

      const { count, rows: companies } = await Company.findAndCountAll({
        where,
        order: [['created_at', 'DESC']],
        limit: limitNum,
        offset
      });

      return {
        companies,
        pagination: {
          total: count,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(count / limitNum)
        }
      };
    } catch (error) {
      throw ApiError.databaseError('Failed to fetch companies');
    }
  }

  static async getUsers(organizationId, filters = {}) {
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
          { model: User, as: 'user', attributes: ['uuid', 'first_name', 'last_name', 'email', 'phone'] },
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
      throw ApiError.databaseError('Failed to fetch users');
    }
  }

  static async checkCompanyLimit(organizationId) {
    try {
      const organization = await Organization.findByPk(organizationId);

      if (!organization) {
        throw ApiError.notFound('Organization not found');
      }

      const currentCompanies = await Company.count({
        where: { organization_id: organizationId }
      });

      return {
        allowed: currentCompanies < organization.max_companies,
        current: currentCompanies,
        max: organization.max_companies
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.databaseError('Failed to check company limit');
    }
  }
}

module.exports = OrganizationModel;
