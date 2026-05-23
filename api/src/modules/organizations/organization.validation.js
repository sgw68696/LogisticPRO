const Joi = require('joi');

// Common schemas
const addressSchema = Joi.object({
  address_line1: Joi.string().allow('', null),
  address_line2: Joi.string().allow('', null),
  city: Joi.string().allow('', null),
  state: Joi.string().allow('', null),
  country: Joi.string().allow('', null),
  postal_code: Joi.string().allow('', null)
});

// Create organization validation
const createOrganizationSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).required()
    .messages({
      'string.empty': 'Organization name is required',
      'string.min': 'Organization name must be at least 2 characters',
      'string.max': 'Organization name must not exceed 255 characters'
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
  max_companies: Joi.number().integer().min(1).max(1000).default(10)
    .messages({
      'number.min': 'Maximum companies must be at least 1',
      'number.max': 'Maximum companies cannot exceed 1000'
    }),
  max_users_per_company: Joi.number().integer().min(1).max(500).default(50)
    .messages({
      'number.min': 'Maximum users per company must be at least 1',
      'number.max': 'Maximum users per company cannot exceed 500'
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
  user_role_slug: Joi.string().valid('organizationuser', 'superadmin', 'companyadmin', 'manager', 'dispatcher', 'operator', 'agent', 'staff', 'customsagent', 'portagent', 'customerportal', 'auditorreadonly').allow(null),
  user_department: Joi.string().trim().max(100).allow('', null),
  user_job_title: Joi.string().trim().max(100).allow('', null)
});

// Update organization validation
const updateOrganizationSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255)
    .messages({
      'string.min': 'Organization name must be at least 2 characters',
      'string.max': 'Organization name must not exceed 255 characters'
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
  max_companies: Joi.number().integer().min(1).max(1000)
    .messages({
      'number.min': 'Maximum companies must be at least 1',
      'number.max': 'Maximum companies cannot exceed 1000'
    }),
  max_users_per_company: Joi.number().integer().min(1).max(500)
    .messages({
      'number.min': 'Maximum users per company must be at least 1',
      'number.max': 'Maximum users per company cannot exceed 500'
    }),
  status: Joi.string().valid('pending', 'active', 'suspended', 'inactive')
    .messages({
      'any.only': 'Invalid status'
    }),
  is_verified: Joi.boolean()
});

// Query validation
const organizationQuerySchema = Joi.object({
  search: Joi.string().allow('', null).default(null),
  status: Joi.string().valid('pending', 'active', 'suspended', 'inactive'),
  subscription_status: Joi.string().valid('trial', 'active', 'suspended', 'cancelled'),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort_by: Joi.string().valid('name', 'email', 'status', 'subscription_status', 'created_at', 'updated_at').default('created_at'),
  sort_order: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').default('DESC')
});

module.exports = {
  createOrganizationSchema,
  updateOrganizationSchema,
  organizationQuerySchema
};
