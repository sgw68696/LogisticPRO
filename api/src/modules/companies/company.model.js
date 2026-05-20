const { Company, User, Role, Organization, CompanyType, ApprovalRequest } = require('../../models');
const ApiError = require('../../utils/ApiError');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

class CompanyModel {
  static async findAll(filters = {}) {
    try {
      const {
        search,
        status,
        subscription_status,
        organization_id,
        company_type_id,
        page = 1,
        limit = 10,
        sort_by = 'created_at',
        sort_order = 'DESC'
      } = filters;

      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
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

      if (organization_id) {
        where.organization_id = organization_id;
      }

      if (company_type_id) {
        where.company_type_id = company_type_id;
      }

      const allowedSortFields = ['name', 'email', 'status', 'subscription_status', 'created_at', 'updated_at'];
      const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'created_at';
      const sortDirection = sort_order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

      const { count, rows: companies } = await Company.findAndCountAll({
        where,
        include: [
          { model: CompanyType, as: 'companyType', attributes: ['name', 'slug'] },
          { model: Organization, as: 'organization', attributes: ['name', 'uuid'] },
          { model: User, as: 'creator', attributes: ['first_name', 'last_name'] },
          { model: User, as: 'updater', attributes: ['first_name', 'last_name'] }
        ],
        order: [[sortField, sortDirection]],
        limit: limitNum,
        offset,
        distinct: true
      });

      const companiesWithCounts = await Promise.all(
        companies.map(async (company) => {
          const totalUsers = await User.count({
            where: { company_id: company.id, deleted_at: null }
          });

          return {
            ...company.toJSON(),
            total_users: totalUsers,
            company_type_name: company.companyType?.name || null,
            company_type_slug: company.companyType?.slug || null,
            organization_name: company.organization?.name || null,
            organization_uuid: company.organization?.uuid || null,
            created_by_name: company.creator?.first_name || null,
            created_by_lastname: company.creator?.last_name || null,
            updated_by_name: company.updater?.first_name || null,
            updated_by_lastname: company.updater?.last_name || null
          };
        })
      );

      return {
        companies: companiesWithCounts,
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

  static async findById(id) {
    try {
      const company = await Company.findByPk(id, {
        include: [
          { model: CompanyType, as: 'companyType', attributes: ['name', 'slug'] },
          { model: Organization, as: 'organization', attributes: ['name', 'uuid'] },
          { model: User, as: 'creator', attributes: ['first_name', 'last_name'] },
          { model: User, as: 'updater', attributes: ['first_name', 'last_name'] }
        ]
      });

      if (!company) {
        return null;
      }

      const totalUsers = await User.count({
        where: { company_id: id, deleted_at: null }
      });

      return {
        ...company.toJSON(),
        total_users: totalUsers,
        company_type_name: company.companyType?.name || null,
        company_type_slug: company.companyType?.slug || null,
        organization_name: company.organization?.name || null,
        organization_uuid: company.organization?.uuid || null,
        created_by_name: company.creator?.first_name || null,
        created_by_lastname: company.creator?.last_name || null,
        updated_by_name: company.updater?.first_name || null,
        updated_by_lastname: company.updater?.last_name || null
      };
    } catch (error) {
      throw ApiError.databaseError('Failed to fetch company');
    }
  }

  static async findByUuid(uuid) {
    try {
      const company = await Company.findOne({
        where: { uuid },
        include: [
          { model: CompanyType, as: 'companyType', attributes: ['name', 'slug'] },
          { model: Organization, as: 'organization', attributes: ['name', 'uuid'] }
        ]
      });

      if (!company) {
        return null;
      }

      const totalUsers = await User.count({
        where: { company_id: company.id, deleted_at: null }
      });

      return {
        ...company.toJSON(),
        total_users: totalUsers,
        company_type_name: company.companyType?.name || null,
        company_type_slug: company.companyType?.slug || null,
        organization_name: company.organization?.name || null,
        organization_uuid: company.organization?.uuid || null
      };
    } catch (error) {
      throw ApiError.databaseError('Failed to fetch company');
    }
  }

  static async findByEmail(email) {
    try {
      return await Company.findOne({ where: { email } });
    } catch (error) {
      throw ApiError.databaseError('Failed to fetch company');
    }
  }

  static async create(data, createdBy) {
    const transaction = await Company.sequelize.transaction();

    try {
      const {
        organization_id,
        company_type_id,
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
        status = 'pending'
      } = data;

      const uuid = require('crypto').randomUUID();

      const company = await Company.create({
        uuid,
        organizationId: organization_id,
        companyTypeId: company_type_id || null,
        name,
        registrationNumber: registration_number || null,
        taxId: tax_id || null,
        email,
        phone: phone || null,
        website: website || null,
        addressLine1: address_line1 || null,
        addressLine2: address_line2 || null,
        city: city || null,
        state: state || null,
        country: country || null,
        postalCode: postal_code || null,
        subscriptionStatus: subscription_status,
        subscriptionStartDate: subscription_start_date || null,
        subscriptionEndDate: subscription_end_date || null,
        status,
        createdBy: createdBy
      }, { transaction });

      await ApprovalRequest.create({
        uuid: require('crypto').randomUUID(),
        requestType: 'company',
        requestId: company.id,
        requestedBy: createdBy,
        approvalStatus: 'pending',
        notes: `Company registration request for ${name}`
      }, { transaction });

      await transaction.commit();

      return this.findById(company.id);
    } catch (error) {
      await transaction.rollback();
      throw ApiError.databaseError('Failed to create company');
    }
  }

  static async createWithUser(data, createdBy) {
    const transaction = await Company.sequelize.transaction();

    try {
      const {
        organization_id,
        company_type_id,
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
        status = 'pending',
        user_first_name,
        user_last_name,
        user_email,
        user_phone,
        user_username,
        user_password,
        user_role_id,
        user_role_slug
      } = data;

      const companyUuid = require('crypto').randomUUID();

      const company = await Company.create({
        uuid: companyUuid,
        organizationId: organization_id,
        companyTypeId: company_type_id || null,
        name,
        registrationNumber: registration_number || null,
        taxId: tax_id || null,
        email,
        phone: phone || null,
        website: website || null,
        addressLine1: address_line1 || null,
        addressLine2: address_line2 || null,
        city: city || null,
        state: state || null,
        country: country || null,
        postalCode: postal_code || null,
        subscriptionStatus: subscription_status,
        subscriptionStartDate: subscription_start_date || null,
        subscriptionEndDate: subscription_end_date || null,
        status,
        createdBy: createdBy
      }, { transaction });

      const companyId = company.id;

      let userId = null;

      if (user_first_name && user_email && user_password) {
        const hashedPassword = await bcrypt.hash(user_password, 12);
        const userUuid = require('crypto').randomUUID();

        const roleSlug = user_role_slug || 'companyadmin';
        const role = await Role.findOne({ where: { slug: roleSlug }, transaction });
        const roleId = role ? role.id : user_role_id;

        const user = await User.create({
          uuid: userUuid,
          companyId: companyId,
          organizationId: organization_id,
          roleId: roleId,
          firstName: user_first_name,
          lastName: user_last_name,
          email: user_email,
          phone: user_phone || null,
          username: user_username || user_email,
          password: hashedPassword,
          approvalStatus: 'pending',
          status: 'active',
          createdBy: createdBy
        }, { transaction });

        userId = user.id;
      }

      const crypto = require('crypto');

      await ApprovalRequest.create({
        uuid: crypto.randomUUID(),
        requestType: 'company',
        requestId: companyId,
        requestedBy: createdBy,
        approvalStatus: 'pending',
        notes: `Company registration request for ${name}`
      }, { transaction });

      if (userId) {
        await ApprovalRequest.create({
          uuid: crypto.randomUUID(),
          requestType: 'company_user',
          requestId: userId,
          requestedBy: createdBy,
          approvalStatus: 'pending',
          notes: `Company user registration for ${user_first_name} ${user_last_name}`
        }, { transaction });
      }

      await transaction.commit();

      return this.findById(companyId);
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  static async update(id, data, updatedBy) {
    try {
      const company = await Company.findByPk(id);

      if (!company) {
        throw ApiError.notFound('Company not found');
      }

      const updateData = {};

      if (data.company_type_id !== undefined) updateData.companyTypeId = data.company_type_id;
      if (data.companyTypeId !== undefined) updateData.companyTypeId = data.companyTypeId;
      if (data.name !== undefined) updateData.name = data.name;
      if (data.registration_number !== undefined) updateData.registrationNumber = data.registration_number;
      if (data.registrationNumber !== undefined) updateData.registrationNumber = data.registrationNumber;
      if (data.tax_id !== undefined) updateData.taxId = data.tax_id;
      if (data.taxId !== undefined) updateData.taxId = data.taxId;
      if (data.email !== undefined) updateData.email = data.email;
      if (data.phone !== undefined) updateData.phone = data.phone;
      if (data.website !== undefined) updateData.website = data.website;
      if (data.address_line1 !== undefined) updateData.addressLine1 = data.address_line1;
      if (data.addressLine1 !== undefined) updateData.addressLine1 = data.addressLine1;
      if (data.address_line2 !== undefined) updateData.addressLine2 = data.address_line2;
      if (data.addressLine2 !== undefined) updateData.addressLine2 = data.addressLine2;
      if (data.city !== undefined) updateData.city = data.city;
      if (data.state !== undefined) updateData.state = data.state;
      if (data.country !== undefined) updateData.country = data.country;
      if (data.postal_code !== undefined) updateData.postalCode = data.postal_code;
      if (data.postalCode !== undefined) updateData.postalCode = data.postalCode;
      if (data.subscription_status !== undefined) updateData.subscriptionStatus = data.subscription_status;
      if (data.subscriptionStatus !== undefined) updateData.subscriptionStatus = data.subscriptionStatus;
      if (data.subscription_start_date !== undefined) updateData.subscriptionStartDate = data.subscription_start_date;
      if (data.subscriptionStartDate !== undefined) updateData.subscriptionStartDate = data.subscriptionStartDate;
      if (data.subscription_end_date !== undefined) updateData.subscriptionEndDate = data.subscription_end_date;
      if (data.subscriptionEndDate !== undefined) updateData.subscriptionEndDate = data.subscriptionEndDate;
      if (data.status !== undefined) updateData.status = data.status;
      if (data.is_verified !== undefined) {
        updateData.isVerified = data.is_verified;
        if (data.is_verified) {
          updateData.verifiedAt = new Date();
        }
      }
      if (data.isVerified !== undefined) {
        updateData.isVerified = data.isVerified;
        if (data.isVerified) {
          updateData.verifiedAt = new Date();
        }
      }

      updateData.updatedBy = updatedBy;

      await company.update(updateData);

      return this.findById(id);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.databaseError('Failed to update company');
    }
  }

  static async softDelete(id, deletedBy) {
    try {
      const company = await Company.findByPk(id);

      if (!company) {
        throw ApiError.notFound('Company not found');
      }

      await company.destroy();

      return { message: 'Company deleted successfully' };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.databaseError('Failed to delete company');
    }
  }

  static async getUsers(companyId, filters = {}) {
    try {
      const {
        approval_status,
        role_id,
        page = 1,
        limit = 10
      } = filters;

      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      const offset = (pageNum - 1) * limitNum;

      const where = { company_id: companyId };

      if (approval_status) {
        where.approval_status = approval_status;
      }

      if (role_id) {
        where.role_id = role_id;
      }

      const { count, rows: users } = await User.findAndCountAll({
        where,
        include: [
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

  static async verifyCompany(id, verifiedBy) {
    try {
      const company = await Company.findByPk(id);

      if (!company) {
        throw ApiError.notFound('Company not found');
      }

      await company.update({
        is_verified: true,
        verified_at: new Date(),
        status: 'active',
        updated_by: verifiedBy
      });

      return this.findById(id);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.databaseError('Failed to verify company');
    }
  }
}

module.exports = CompanyModel;
