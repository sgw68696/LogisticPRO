const companyUserRepository = require('./companyUser.repository');
const ApiError = require('../../utils/ApiError');
const logger = require('../../config/logger');

class CompanyUserService {
  async getAllCompanyUsers(filters, currentUser) {
    try {
      if (currentUser.role_slug === 'superadmin') {
        return await companyUserRepository.findAll(filters);
      } else if (currentUser.role_slug === 'organizationuser') {
        return await companyUserRepository.findAll({
          ...filters,
          organization_id: currentUser.organization_id
        });
      } else if (currentUser.role_slug === 'companyadmin' || currentUser.role_slug === 'companyuser') {
        return await companyUserRepository.findAll({
          ...filters,
          company_id: currentUser.company_id
        });
      } else {
        throw ApiError.forbidden('You do not have permission to view company users');
      }
    } catch (error) {
      logger.error('Error in CompanyUserService.getAllCompanyUsers:', error);
      throw error;
    }
  }

  async getCompanyUserById(id, currentUser) {
    try {
      const companyUser = await companyUserRepository.findById(id);

      if (currentUser.role_slug === 'superadmin') {
        return companyUser;
      } else if (currentUser.role_slug === 'organizationuser' && companyUser.organization_id === currentUser.organization_id) {
        return companyUser;
      } else if ((currentUser.role_slug === 'companyadmin' || currentUser.role_slug === 'companyuser') && companyUser.company_id === currentUser.company_id) {
        return companyUser;
      } else {
        throw ApiError.forbidden('You do not have permission to view this company user');
      }
    } catch (error) {
      logger.error('Error in CompanyUserService.getCompanyUserById:', error);
      throw error;
    }
  }

  async getCompanyUserByUuid(uuid, currentUser) {
    try {
      const companyUser = await companyUserRepository.findByUuid(uuid);

      if (currentUser.role_slug === 'superadmin') {
        return companyUser;
      } else if (currentUser.role_slug === 'organizationuser' && companyUser.organization_id === currentUser.organization_id) {
        return companyUser;
      } else if ((currentUser.role_slug === 'companyadmin' || currentUser.role_slug === 'companyuser') && companyUser.company_id === currentUser.company_id) {
        return companyUser;
      } else {
        throw ApiError.forbidden('You do not have permission to view this company user');
      }
    } catch (error) {
      logger.error('Error in CompanyUserService.getCompanyUserByUuid:', error);
      throw error;
    }
  }

  async createCompanyUser(data, currentUser) {
    try {
      if (currentUser.role_slug !== 'superadmin' && currentUser.role_slug !== 'organizationuser' && currentUser.role_slug !== 'companyadmin') {
        throw ApiError.forbidden('You do not have permission to create company users');
      }

      if (currentUser.role_slug === 'organizationuser' && data.organization_id !== currentUser.organization_id) {
        throw ApiError.forbidden('You can only create users within your organization');
      }

      if ((currentUser.role_slug === 'companyadmin' || currentUser.role_slug === 'companyuser') && data.company_id !== currentUser.company_id) {
        throw ApiError.forbidden('You can only create users within your company');
      }

      return await companyUserRepository.create(data, currentUser.id);
    } catch (error) {
      logger.error('Error in CompanyUserService.createCompanyUser:', error);
      throw error;
    }
  }

  async createCompanyUserWithCompany(data, currentUser) {
    try {
      if (currentUser.role_slug !== 'superadmin' && currentUser.role_slug !== 'organizationuser' && currentUser.role_slug !== 'companyadmin') {
        throw ApiError.forbidden('You do not have permission to create company users');
      }

      if (currentUser.role_slug === 'organizationuser' && data.organization_id !== currentUser.organization_id) {
        throw ApiError.forbidden('You can only create users within your organization');
      }

      if ((currentUser.role_slug === 'companyadmin' || currentUser.role_slug === 'companyuser') && data.company_id !== currentUser.company_id) {
        throw ApiError.forbidden('You can only create users within your company');
      }

      return await companyUserRepository.createWithCompany(data, currentUser.id);
    } catch (error) {
      logger.error('Error in CompanyUserService.createCompanyUserWithCompany:', error);
      throw error;
    }
  }

  async updateCompanyUser(id, data, currentUser) {
    try {
      const companyUser = await companyUserRepository.findById(id);

      if (currentUser.role_slug === 'superadmin') {
        return await companyUserRepository.update(id, data, currentUser.id);
      } else if (currentUser.role_slug === 'organizationuser' && companyUser.organization_id === currentUser.organization_id) {
        const allowedFields = {
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          role_id: data.role_id
        };
        return await companyUserRepository.update(id, allowedFields, currentUser.id);
      } else if ((currentUser.role_slug === 'companyadmin' || currentUser.role_slug === 'companyuser') && companyUser.company_id === currentUser.company_id) {
        const allowedFields = {
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone
        };
        return await companyUserRepository.update(id, allowedFields, currentUser.id);
      } else {
        throw ApiError.forbidden('You do not have permission to update this company user');
      }
    } catch (error) {
      logger.error('Error in CompanyUserService.updateCompanyUser:', error);
      throw error;
    }
  }

  async deleteCompanyUser(id, currentUser) {
    try {
      const companyUser = await companyUserRepository.findById(id);

      if (currentUser.role_slug !== 'superadmin' && currentUser.role_slug !== 'organizationuser' && currentUser.role_slug !== 'companyadmin') {
        throw ApiError.forbidden('You do not have permission to delete company users');
      }

      if (currentUser.role_slug === 'organizationuser' && companyUser.organization_id !== currentUser.organization_id) {
        throw ApiError.forbidden('You can only delete users within your organization');
      }

      if ((currentUser.role_slug === 'companyadmin' || currentUser.role_slug === 'companyuser') && companyUser.company_id !== currentUser.company_id) {
        throw ApiError.forbidden('You can only delete users within your company');
      }

      return await companyUserRepository.softDelete(id, currentUser.id);
    } catch (error) {
      logger.error('Error in CompanyUserService.deleteCompanyUser:', error);
      throw error;
    }
  }

  async approveCompanyUser(id, currentUser) {
    try {
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('Only Super Admin can approve company users');
      }

      return await companyUserRepository.approveUser(id, currentUser.id);
    } catch (error) {
      logger.error('Error in CompanyUserService.approveCompanyUser:', error);
      throw error;
    }
  }

  async rejectCompanyUser(id, currentUser) {
    try {
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('Only Super Admin can reject company users');
      }

      return await companyUserRepository.rejectUser(id, currentUser.id);
    } catch (error) {
      logger.error('Error in CompanyUserService.rejectCompanyUser:', error);
      throw error;
    }
  }

  async suspendCompanyUser(id, currentUser) {
    try {
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('Only Super Admin can suspend company users');
      }

      return await companyUserRepository.suspendUser(id, currentUser.id);
    } catch (error) {
      logger.error('Error in CompanyUserService.suspendCompanyUser:', error);
      throw error;
    }
  }

  async reactivateCompanyUser(id, currentUser) {
    try {
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('Only Super Admin can reactivate company users');
      }

      return await companyUserRepository.reactivateUser(id, currentUser.id);
    } catch (error) {
      logger.error('Error in CompanyUserService.reactivateCompanyUser:', error);
      throw error;
    }
  }

  async getPendingApprovals(filters, currentUser) {
    try {
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('You do not have permission to view pending approvals');
      }

      return await companyUserRepository.getPendingApprovals(filters.company_id, filters.organization_id);
    } catch (error) {
      logger.error('Error in CompanyUserService.getPendingApprovals:', error);
      throw error;
    }
  }
}

module.exports = new CompanyUserService();
