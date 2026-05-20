const Joi = require('joi');

// Common address schema
const addressSchema = Joi.object({
  address_line1: Joi.string().allow('', null),
  address_line2: Joi.string().allow('', null),
  city: Joi.string().allow('', null),
  state: Joi.string().allow('', null),
  country: Joi.string().allow('', null),
  postal_code: Joi.string().allow('', null)
});

// Create company validation
const createCompanySchema = Joi.object({
  organization_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Organization ID must be a number',
      'number.positive': 'Organization ID must be positive',
      'any.required': 'Organization ID is required'
    }),
  company_type_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Company type ID must be a number',
      'number.positive': 'Company type ID must be positive',
      'any.required': 'Company type ID is required'
    }),
  name: Joi.string().trim().min(2).max(255).required()
    .messages({
      'string.empty': 'Company name is required',
      'string.min': 'Company name must be at least 2 characters',
      'string.max': 'Company name must not exceed 255 characters'
    }),
  registration_number: Joi.string().trim().max(100).allow('', null)
    .messages({
      'string.max': 'Registration number must not exceed 100 characters'
    }),
  tax_id: Joi.string().trim().max(50).allow('', null)
    .messages({
      'string.max': 'Tax ID must not exceed 50 characters'
    }),
  email: Joi.string().trim().email().required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address'
    }),
  phone: Joi.string().trim().max(50).allow('', null)
    .messages({
      'string.max': 'Phone number must not exceed 50 characters'
    }),
  website: Joi.string().uri().allow('', null)
    .messages({
      'string.uri': 'Please provide a valid website URL'
    }),
  address: addressSchema,
  address_line1: Joi.string().allow('', null),
  address_line2: Joi.string().allow('', null),
  city: Joi.string().allow('', null),
  state: Joi.string().allow('', null),
  country: Joi.string().allow('', null),
  postal_code: Joi.string().allow('', null),
  subscription_status: Joi.string().valid('trial', 'active', 'suspended', 'cancelled').default('trial')
    .messages({
      'any.only': 'Invalid subscription status'
    }),
  subscription_start_date: Joi.date().iso().allow(null),
  subscription_end_date: Joi.date().iso().allow(null).greater(Joi.ref('subscription_start_date'))
    .messages({
      'date.greater': 'Subscription end date must be after start date'
    }),
  status: Joi.string().valid('pending', 'active', 'suspended', 'inactive').default('pending')
    .messages({
      'any.only': 'Invalid status'
    }),
  user_first_name: Joi.string().trim().min(2).max(100).allow('', null),
  user_last_name: Joi.string().trim().min(2).max(100).allow('', null),
  user_email: Joi.string().trim().email().allow('', null),
  user_phone: Joi.string().trim().max(50).allow('', null),
  user_username: Joi.string().trim().min(3).max(100).allow('', null),
  user_password: Joi.string().min(8).max(100).allow('', null),
  user_role_id: Joi.number().integer().positive().allow(null),
  user_role_slug: Joi.string().valid('companyadmin', 'superadmin', 'organizationuser', 'manager', 'dispatcher', 'operator', 'agent', 'staff', 'customsagent', 'portagent', 'customerportal', 'auditorreadonly').allow(null)
});

// Update company validation
const updateCompanySchema = Joi.object({
  company_type_id: Joi.number().integer().positive()
    .messages({
      'number.base': 'Company type ID must be a number',
      'number.positive': 'Company type ID must be positive'
    }),
  name: Joi.string().trim().min(2).max(255)
    .messages({
      'string.min': 'Company name must be at least 2 characters',
      'string.max': 'Company name must not exceed 255 characters'
    }),
  registration_number: Joi.string().trim().max(100).allow('', null),
  tax_id: Joi.string().trim().max(50).allow('', null),
  email: Joi.string().trim().email()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
  phone: Joi.string().trim().max(50).allow('', null),
  website: Joi.string().uri().allow('', null)
    .messages({
      'string.uri': 'Please provide a valid website URL'
    }),
  address: addressSchema,
  address_line1: Joi.string().allow('', null),
  address_line2: Joi.string().allow('', null),
  city: Joi.string().allow('', null),
  state: Joi.string().allow('', null),
  country: Joi.string().allow('', null),
  postal_code: Joi.string().allow('', null),
  subscription_status: Joi.string().valid('trial', 'active', 'suspended', 'cancelled')
    .messages({
      'any.only': 'Invalid subscription status'
    }),
  subscription_start_date: Joi.date().iso().allow(null),
  subscription_end_date: Joi.date().iso().allow(null).greater(Joi.ref('subscription_start_date'))
    .messages({
      'date.greater': 'Subscription end date must be after start date'
    }),
  status: Joi.string().valid('pending', 'active', 'suspended', 'inactive')
    .messages({
      'any.only': 'Invalid status'
    }),
  is_verified: Joi.boolean()
});

// Query validation
const companyQuerySchema = Joi.object({
  search: Joi.string().allow('', null),
  status: Joi.string().valid('pending', 'active', 'suspended', 'inactive'),
  subscription_status: Joi.string().valid('trial', 'active', 'suspended', 'cancelled'),
  organization_id: Joi.number().integer().positive(),
  company_type_id: Joi.number().integer().positive(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort_by: Joi.string().valid('name', 'email', 'status', 'subscription_status', 'created_at', 'updated_at').default('created_at'),
  sort_order: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').default('DESC')
});

module.exports = {
  createCompanySchema,
  updateCompanySchema,
  companyQuerySchema
};
