const Joi = require('joi');

// Create organization user with existing user
const createOrganizationUserSchema = Joi.object({
  organization_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Organization ID must be a number',
      'number.positive': 'Organization ID must be positive',
      'any.required': 'Organization ID is required'
    }),
  user_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'User ID must be a number',
      'number.positive': 'User ID must be positive',
      'any.required': 'User ID is required'
    }),
  role_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Role ID must be a number',
      'number.positive': 'Role ID must be positive',
      'any.required': 'Role ID is required'
    }),
  is_primary_contact: Joi.boolean().default(false),
  department: Joi.string().trim().max(100).allow('', null),
  job_title: Joi.string().trim().max(100).allow('', null)
});

// Create organization user with new user
const createOrganizationUserWithUserSchema = Joi.object({
  organization_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Organization ID must be a number',
      'number.positive': 'Organization ID must be positive',
      'any.required': 'Organization ID is required'
    }),
  first_name: Joi.string().trim().min(2).max(100).required()
    .messages({
      'string.empty': 'First name is required',
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name must not exceed 100 characters'
    }),
  last_name: Joi.string().trim().min(2).max(100).required()
    .messages({
      'string.empty': 'Last name is required',
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name must not exceed 100 characters'
    }),
  email: Joi.string().trim().email().required()
    .messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email address'
    }),
  phone: Joi.string().trim().max(50).allow('', null),
  username: Joi.string().trim().min(3).max(100).alphanum().required()
    .messages({
      'string.empty': 'Username is required',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username must not exceed 100 characters',
      'string.alphanum': 'Username must contain only letters and numbers'
    }),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/).required()
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }),
  role_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Role ID must be a number',
      'number.positive': 'Role ID must be positive',
      'any.required': 'Role ID is required'
    }),
  is_primary_contact: Joi.boolean().default(false),
  department: Joi.string().trim().max(100).allow('', null),
  job_title: Joi.string().trim().max(100).allow('', null)
});

// Update organization user
const updateOrganizationUserSchema = Joi.object({
  role_id: Joi.number().integer().positive()
    .messages({
      'number.base': 'Role ID must be a number',
      'number.positive': 'Role ID must be positive'
    }),
  is_primary_contact: Joi.boolean(),
  department: Joi.string().trim().max(100).allow('', null),
  job_title: Joi.string().trim().max(100).allow('', null)
});

// Approval action schema
const approvalActionSchema = Joi.object({
  approval_status: Joi.string().valid('approved', 'rejected', 'suspended', 'pending').required()
    .messages({
      'any.required': 'Approval status is required',
      'any.only': 'Invalid approval status'
    }),
  rejection_reason: Joi.string().trim().max(500).allow('', null)
    .when('approval_status', {
      is: 'rejected',
      then: Joi.required().messages({
        'any.required': 'Rejection reason is required when rejecting'
      }),
      otherwise: Joi.optional()
    }),
  suspension_reason: Joi.string().trim().max(500).allow('', null)
    .when('approval_status', {
      is: 'suspended',
      then: Joi.required().messages({
        'any.required': 'Suspension reason is required when suspending'
      }),
      otherwise: Joi.optional()
    })
});

// Query validation
const organizationUserQuerySchema = Joi.object({
  organization_id: Joi.number().integer().positive(),
  approval_status: Joi.string().valid('pending', 'approved', 'rejected', 'suspended'),
  role_id: Joi.number().integer().positive(),
  search: Joi.string().allow('', null),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort_by: Joi.string().valid('first_name', 'last_name', 'email', 'approval_status', 'created_at', 'updated_at').default('created_at'),
  sort_order: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').default('DESC')
});

module.exports = {
  createOrganizationUserSchema,
  createOrganizationUserWithUserSchema,
  updateOrganizationUserSchema,
  approvalActionSchema,
  organizationUserQuerySchema
};
