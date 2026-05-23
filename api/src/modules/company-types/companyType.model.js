const { CompanyType: CompanyTypeModel } = require('../../models');
const ApiError = require('../../utils/ApiError');

class CompanyType {
  static async findAll(filters = {}) {
    try {
      const { page = 1, limit = 10, sort_by = 'name', sort_order = 'ASC' } = filters;

      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      const offset = (pageNum - 1) * limitNum;

      const allowedSortFields = ['name', 'slug'];
      const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'name';
      const sortDirection = sort_order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

      const { count, rows: companyTypes } = await CompanyTypeModel.findAndCountAll({
        order: [[sortField, sortDirection]],
        limit: limitNum,
        offset,
        distinct: true
      });

      return {
        companyTypes,
        pagination: {
          total: count,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(count / limitNum)
        }
      };
    } catch (error) {
      throw ApiError.databaseError('Failed to fetch company types');
    }
  }

  static async findAllSimple() {
    try {
      return await CompanyTypeModel.findAll({
        attributes: ['id', 'name', 'slug', 'description'],
        order: [['name', 'ASC']]
      });
    } catch (error) {
      throw ApiError.databaseError('Failed to fetch company types');
    }
  }

  static async findById(id) {
    try {
      return await CompanyTypeModel.findByPk(id);
    } catch (error) {
      throw ApiError.databaseError('Failed to fetch company type');
    }
  }

  static async create(data) {
    try {
      const { name, slug, description } = data;
      const companyType = await CompanyTypeModel.create({ name, slug, description });
      return companyType;
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw ApiError.conflict('Company type with this slug already exists');
      }
      throw ApiError.databaseError('Failed to create company type');
    }
  }

  static async update(id, data) {
    try {
      const companyType = await CompanyTypeModel.findByPk(id);
      if (!companyType) {
        throw ApiError.notFound('Company type not found');
      }

      const updateData = {};
      if (data.name !== undefined) updateData.name = data.name;
      if (data.slug !== undefined) updateData.slug = data.slug;
      if (data.description !== undefined) updateData.description = data.description;

      await companyType.update(updateData);
      return companyType;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.databaseError('Failed to update company type');
    }
  }

  static async delete(id) {
    try {
      const companyType = await CompanyTypeModel.findByPk(id);
      if (!companyType) {
        throw ApiError.notFound('Company type not found');
      }
      await companyType.destroy();
      return { message: 'Company type deleted successfully' };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw ApiError.databaseError('Failed to delete company type');
    }
  }
}

module.exports = CompanyType;
