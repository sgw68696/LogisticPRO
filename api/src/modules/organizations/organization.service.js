const organizationRepository = require('./organization.repository');
const ApiError = require('../../utils/ApiError');
const logger = require('../../config/logger');

class OrganizationService {
  async getAllOrganizations(filters, currentUser) {
    try {
      // Only Super Admin can view all organizations
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('You do not have permission to view organizations');
      }

      return await organizationRepository.findAll(filters);
    } catch (error) {
      logger.error('Error in OrganizationService.getAllOrganizations:', error);
      throw error;
    }
  }

  async getOrganizationById(id, currentUser) {
    try {
      // Only Super Admin can view any organization
      // Organization users can only view their own organization
      if (currentUser.role_slug === 'superadmin') {
        return await organizationRepository.findById(id);
      } else if (currentUser.role_slug === 'organizationuser' && currentUser.organization_id === id) {
        return await organizationRepository.findById(id);
      } else {
        throw ApiError.forbidden('You do not have permission to view this organization');
      }
    } catch (error) {
      logger.error('Error in OrganizationService.getOrganizationById:', error);
      throw error;
    }
  }

  async getOrganizationByUuid(uuid, currentUser) {
    try {
      const organization = await organizationRepository.findByUuid(uuid);

      // Only Super Admin can view any organization
      // Organization users can only view their own organization
      if (currentUser.role_slug === 'superadmin') {
        return organization;
      } else if (currentUser.role_slug === 'organizationuser' && currentUser.organization_id === organization.id) {
        return organization;
      } else {
        throw ApiError.forbidden('You do not have permission to view this organization');
      }
    } catch (error) {
      logger.error('Error in OrganizationService.getOrganizationByUuid:', error);
      throw error;
    }
  }

  async createOrganization(data, currentUser) {
    try {
      // Only Super Admin can create organizations
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('You do not have permission to create organizations');
      }

      // Flatten address object if provided
      const organizationData = {
        ...data,
        address_line1: data.address?.address_line1 || data.address_line1,
        address_line2: data.address?.address_line2 || data.address_line2,
        city: data.address?.city || data.city,
        state: data.address?.state || data.state,
        country: data.address?.country || data.country,
        postal_code: data.address?.postal_code || data.postal_code
      };

      // Remove address object to avoid passing it to the model
      delete organizationData.address;

      // Check if user data is provided to create org user alongside org
      const hasUserData = data.user_first_name || data.user_email || data.user_username;
      
      if (hasUserData) {
        return await organizationRepository.createWithUser(organizationData, currentUser.id);
      }

      return await organizationRepository.create(organizationData, currentUser.id);
    } catch (error) {
      logger.error('Error in OrganizationService.createOrganization:', error);
      throw error;
    }
  }

  async updateOrganization(id, data, currentUser) {
    try {
      // Only Super Admin can update any organization
      // Organization users can update their own organization (limited fields)
      const organization = await organizationRepository.findById(id);

      if (currentUser.role_slug === 'superadmin') {
        // Flatten address object if provided
        const organizationData = {
          ...data,
          address_line1: data.address?.address_line1 || data.address_line1,
          address_line2: data.address?.address_line2 || data.address_line2,
          city: data.address?.city || data.city,
          state: data.address?.state || data.state,
          country: data.address?.country || data.country,
          postal_code: data.address?.postal_code || data.postal_code
        };

        // Remove address object
        delete organizationData.address;

        return await organizationRepository.update(id, organizationData, currentUser.id);
      } else if (currentUser.role_slug === 'organizationuser' && currentUser.organization_id === id) {
        // Organization users can only update certain fields
        const allowedFields = {
          name: data.name,
          phone: data.phone,
          address_line1: data.address?.address_line1 || data.address_line1,
          address_line2: data.address?.address_line2 || data.address_line2,
          city: data.address?.city || data.city,
          state: data.address?.state || data.state,
          country: data.address?.country || data.country,
          postal_code: data.address?.postal_code || data.postal_code
        };

        return await organizationRepository.update(id, allowedFields, currentUser.id);
      } else {
        throw ApiError.forbidden('You do not have permission to update this organization');
      }
    } catch (error) {
      logger.error('Error in OrganizationService.updateOrganization:', error);
      throw error;
    }
  }

  async deleteOrganization(id, currentUser) {
    try {
      // Only Super Admin can delete organizations
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('You do not have permission to delete organizations');
      }

      // Check if organization has any active companies
      const companies = await organizationRepository.getCompanies(id, { limit: 1 });
      if (companies.companies.length > 0) {
        throw ApiError.badRequest('Cannot delete organization with active companies. Please delete all companies first.');
      }

      return await organizationRepository.softDelete(id, currentUser.id);
    } catch (error) {
      logger.error('Error in OrganizationService.deleteOrganization:', error);
      throw error;
    }
  }

  async activateOrganization(id, currentUser) {
    try {
      // Only Super Admin can activate organizations
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('You do not have permission to activate organizations');
      }

      return await organizationRepository.update(id, { status: 'active' }, currentUser.id);
    } catch (error) {
      logger.error('Error in OrganizationService.activateOrganization:', error);
      throw error;
    }
  }

  async deactivateOrganization(id, currentUser) {
    try {
      // Only Super Admin can deactivate organizations
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('You do not have permission to deactivate organizations');
      }

      return await organizationRepository.update(id, { status: 'inactive' }, currentUser.id);
    } catch (error) {
      logger.error('Error in OrganizationService.deactivateOrganization:', error);
      throw error;
    }
  }

  async getOrganizationCompanies(organizationId, filters, currentUser) {
    try {
      // Super Admin can view any organization's companies
      // Organization users can view their own organization's companies
      if (currentUser.role_slug === 'superadmin') {
        return await organizationRepository.getCompanies(organizationId, filters);
      } else if (currentUser.role_slug === 'organizationuser' && currentUser.organization_id === organizationId) {
        return await organizationRepository.getCompanies(organizationId, filters);
      } else {
        throw ApiError.forbidden('You do not have permission to view these companies');
      }
    } catch (error) {
      logger.error('Error in OrganizationService.getOrganizationCompanies:', error);
      throw error;
    }
  }

  async getOrganizationUsers(organizationId, filters, currentUser) {
    try {
      // Super Admin can view any organization's users
      // Organization users can view their own organization's users
      if (currentUser.role_slug === 'superadmin') {
        return await organizationRepository.getUsers(organizationId, filters);
      } else if (currentUser.role_slug === 'organizationuser' && currentUser.organization_id === organizationId) {
        return await organizationRepository.getUsers(organizationId, filters);
      } else {
        throw ApiError.forbidden('You do not have permission to view these users');
      }
    } catch (error) {
      logger.error('Error in OrganizationService.getOrganizationUsers:', error);
      throw error;
    }
  }

  async verifyOrganization(id, currentUser) {
    try {
      // Only Super Admin can verify organizations
      if (currentUser.role_slug !== 'superadmin') {
        throw ApiError.forbidden('You do not have permission to verify organizations');
      }

      return await organizationRepository.update(id, { 
        is_verified: true,
        status: 'active'
      }, currentUser.id);
    } catch (error) {
      logger.error('Error in OrganizationService.verifyOrganization:', error);
      throw error;
    }
  }

  async checkCompanyLimit(organizationId, currentUser) {
    try {
      // Super Admin can check any organization's limit
      // Organization users can check their own organization's limit
      if (currentUser.role_slug === 'superadmin') {
        return await organizationRepository.checkCompanyLimit(organizationId);
      } else if (currentUser.role_slug === 'organizationuser' && currentUser.organization_id === organizationId) {
        return await organizationRepository.checkCompanyLimit(organizationId);
      } else {
        throw ApiError.forbidden('You do not have permission to check this organization\'s limit');
      }
    } catch (error) {
      logger.error('Error in OrganizationService.checkCompanyLimit:', error);
      throw error;
    }
  }
}

module.exports = new OrganizationService();
