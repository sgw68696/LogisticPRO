const companyRepository = require('./company.repository');
const ApiError = require('../../utils/ApiError');
const logger = require('../../config/logger');

class CompanyService {
  async getAllCompanies(filters, currentUser) {
    try {
      if (currentUser.role_slug === 'superadmin') {
        return await companyRepository.findAll(filters);
      } else if (currentUser.role_slug === 'organizationuser') {
        return await companyRepository.findAll({
          ...filters,
          organization_id: currentUser.organization_id
        });
      } else if (currentUser.role_slug === 'companyadmin' || currentUser.role_slug === 'companyuser') {
        return await companyRepository.findAll({
          ...filters,
          organization_id: currentUser.organization_id
        });
      } else {
        throw ApiError.forbidden('You do not have permission to view companies');
      }
    } catch (error) {
      logger.error('Error in CompanyService.getAllCompanies:', error);
      throw error;
    }
  }

  async getCompanyById(id, currentUser) {
    try {
      const company = await companyRepository.findById(id);

      if (currentUser.role_slug === 'superadmin') {
        return company;
      } else if (currentUser.role_slug === 'organizationuser' && company.organization_id === currentUser.organization_id) {
        return company;
      } else if ((currentUser.role_slug === 'companyadmin' || currentUser.role_slug === 'companyuser') && company.id === currentUser.company_id) {
        return company;
      } else {
        throw ApiError.forbidden('You do not have permission to view this company');
      }
    } catch (error) {
      logger.error('Error in CompanyService.getCompanyById:', error);
      throw error;
    }
  }

  async getCompanyByUuid(uuid, currentUser) {
    try {
      const company = await companyRepository.findByUuid(uuid);

      if (currentUser.role_slug === 'superadmin') {
        return company;
      } else if (currentUser.role_slug === 'organizationuser' && company.organization_id === currentUser.organization_id) {
        return company;
      } else if ((currentUser.role_slug === 'companyadmin' || currentUser.role_slug === 'companyuser') && company.id === currentUser.company_id) {
        return company;
      } else {
        throw ApiError.forbidden('You do not have permission to view this company');
      }
    } catch (error) {
      logger.error('Error in CompanyService.getCompanyByUuid:', error);
      throw error;
    }
  }

  async createCompany(data, currentUser) {
    try {
      if (currentUser.role_slug !== 'superadmin' && currentUser.role_slug !== 'organizationuser') {
        throw ApiError.forbidden('You do not have permission to create companies');
      }

      if (currentUser.role_slug === 'organizationuser' && data.organization_id !== currentUser.organization_id) {
        throw ApiError.forbidden('You can only create companies within your organization');
      }

      const companyData = {
        ...data,
        address_line1: data.address?.address_line1 || data.address_line1,
        address_line2: data.address?.address_line2 || data.address_line2,
        city: data.address?.city || data.city,
        state: data.address?.state || data.state,
        country: data.address?.country || data.country,
        postal_code: data.address?.postal_code || data.postal_code
      };

      delete companyData.address;

      return await companyRepository.create(companyData, currentUser.id);
    } catch (error) {
      logger.error('Error in CompanyService.createCompany:', error);
      throw error;
    }
  }

  async updateCompany(id, data, currentUser) {
    try {
      const company = await companyRepository.findById(id);

      if (currentUser.role_slug === 'superadmin') {
        const companyData = {
          ...data,
          address_line1: data.address?.address_line1 || data.address_line1,
          address_line2: data.address?.address_line2 || data.address_line2,
          city: data.address?.city || data.city,
          state: data.address?.state || data.state,
          country: data.address?.country || data.country,
          postal_code: data.address?.postal_code || data.postal_code
        };

        delete companyData.address;

        return await companyRepository.update(id, companyData, currentUser.id);
      } else if (currentUser.role_slug === 'organizationuser' && company.organization_id === currentUser.organization_id) {
        const allowedFields = {
          name: data.name,
          phone: data.phone,
          website: data.website,
          address_line1: data.address?.address_line1 || data.address_line1,
          address_line2: data.address?.address_line2 || data.address_line2,
          city: data.address?.city || data.city,
          state: data.address?.state || data.state,
          country: data.address?.country || data.country,
          postal_code: data.address?.postal_code || data.postal_code
        };

        return await companyRepository.update(id, allowedFields, currentUser.id);
      } else if ((currentUser.role_slug === 'companyadmin' || currentUser.role_slug === 'companyuser') && company.id === currentUser.company_id) {
        const allowedFields = {
          name: data.name,
          phone: data.phone,
          website: data.website,
          address_line1: data.address?.address_line1 || data.address_line1,
          address_line2: data.address?.address_line2 || data.address_line2,
          city: data.address?.city || data.city,
          state: data.address?.state || data.state,
          country: data.address?.country || data.country,
          postal_code: data.address?.postal_code || data.postal_code
        };

        return await companyRepository.update(id, allowedFields, currentUser.id);
      } else {
        throw ApiError.forbidden('You do not have permission to update this company');
      }
    } catch (error) {
      logger.error('Error in CompanyService.updateCompany:', error);
      throw error;
    }
  }

  async deleteCompany(id, currentUser) {
    try {
      const company = await companyRepository.findById(id);

      if (currentUser.role_slug !== 'superadmin' && currentUser.role_slug !== 'organizationuser') {
        throw ApiError.forbidden('You do not have permission to delete companies');
      }

      if (currentUser.role_slug === 'organizationuser' && company.organization_id !== currentUser.organization_id) {
        throw ApiError.forbidden('You can only delete companies within your organization');
      }

      const users = await companyRepository.getUsers(id, { limit: 1 });
      if (users.users.length > 0) {
        throw ApiError.badRequest('Cannot delete company with active users. Please delete all users first.');
      }

      return await companyRepository.softDelete(id, currentUser.id);
    } catch (error) {
      logger.error('Error in CompanyService.deleteCompany:', error);
      throw error;
    }
  }

  async activateCompany(id, currentUser) {
    try {
      if (currentUser.role_slug !== 'superadmin' && currentUser.role_slug !== 'organizationuser') {
        throw ApiError.forbidden('You do not have permission to activate companies');
      }

      const company = await companyRepository.findById(id);
      if (currentUser.role_slug === 'organizationuser' && company.organization_id !== currentUser.organization_id) {
        throw ApiError.forbidden('You can only activate companies within your organization');
      }

      return await companyRepository.update(id, { status: 'active' }, currentUser.id);
    } catch (error) {
      logger.error('Error in CompanyService.activateCompany:', error);
      throw error;
    }
  }

  async deactivateCompany(id, currentUser) {
    try {
      if (currentUser.role_slug !== 'superadmin' && currentUser.role_slug !== 'organizationuser') {
        throw ApiError.forbidden('You do not have permission to deactivate companies');
      }

      const company = await companyRepository.findById(id);
      if (currentUser.role_slug === 'organizationuser' && company.organization_id !== currentUser.organization_id) {
        throw ApiError.forbidden('You can only deactivate companies within your organization');
      }

      return await companyRepository.update(id, { status: 'inactive' }, currentUser.id);
    } catch (error) {
      logger.error('Error in CompanyService.deactivateCompany:', error);
      throw error;
    }
  }

  async getCompanyUsers(companyId, filters, currentUser) {
    try {
      const company = await companyRepository.findById(companyId);

      if (currentUser.role_slug === 'superadmin') {
        return await companyRepository.getUsers(companyId, filters);
      } else if (currentUser.role_slug === 'organizationuser' && company.organization_id === currentUser.organization_id) {
        return await companyRepository.getUsers(companyId, filters);
      } else if ((currentUser.role_slug === 'companyadmin' || currentUser.role_slug === 'companyuser') && company.id === currentUser.company_id) {
        return await companyRepository.getUsers(companyId, filters);
      } else {
        throw ApiError.forbidden('You do not have permission to view these users');
      }
    } catch (error) {
      logger.error('Error in CompanyService.getCompanyUsers:', error);
      throw error;
    }
  }

  async verifyCompany(id, currentUser) {
    try {
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('You do not have permission to verify companies');
      }

      return await companyRepository.verifyCompany(id, currentUser.id);
    } catch (error) {
      logger.error('Error in CompanyService.verifyCompany:', error);
      throw error;
    }
  }
}

module.exports = new CompanyService();
