const Joi = require('joi');

const createCompanyUserSchema = Joi.object({
  company_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Company ID must be a number',
      'number.positive': 'Company ID must be positive',
      'any.required': 'Company ID is required'
    }),
  organization_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Organization ID must be a number',
      'number.positive': 'Organization ID must be positive',
      'any.required': 'Organization ID is required'
    }),
  role_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Role ID must be a number',
      'number.positive': 'Role ID must be positive',
      'any.required': 'Role ID is required'
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
  phone: Joi.string().trim().max(50).allow('', null)
    .messages({
      'string.max': 'Phone number must not exceed 50 characters'
    }),
  username: Joi.string().trim().min(3).max(100).required()
    .messages({
      'string.empty': 'Username is required',
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username must not exceed 100 characters'
    }),
  password: Joi.string().min(8).max(100).required()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 8 characters',
      'string.max': 'Password must not exceed 100 characters',
      'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
    }),
  status: Joi.string().valid('active', 'inactive').default('active')
    .messages({
      'any.only': 'Invalid status'
    })
});

const updateCompanyUserSchema = Joi.object({
  role_id: Joi.number().integer().positive()
    .messages({
      'number.base': 'Role ID must be a number',
      'number.positive': 'Role ID must be positive'
    }),
  first_name: Joi.string().trim().min(2).max(100)
    .messages({
      'string.min': 'First name must be at least 2 characters',
      'string.max': 'First name must not exceed 100 characters'
    }),
  last_name: Joi.string().trim().min(2).max(100)
    .messages({
      'string.min': 'Last name must be at least 2 characters',
      'string.max': 'Last name must not exceed 100 characters'
    }),
  email: Joi.string().trim().email()
    .messages({
      'string.email': 'Please provide a valid email address'
    }),
  phone: Joi.string().trim().max(50).allow('', null)
    .messages({
      'string.max': 'Phone number must not exceed 50 characters'
    }),
  username: Joi.string().trim().min(3).max(100)
    .messages({
      'string.min': 'Username must be at least 3 characters',
      'string.max': 'Username must not exceed 100 characters'
    }),
  status: Joi.string().valid('active', 'inactive', 'suspended')
    .messages({
      'any.only': 'Invalid status'
    })
});

const companyUserQuerySchema = Joi.object({
  company_id: Joi.number().integer().positive(),
  organization_id: Joi.number().integer().positive(),
  approval_status: Joi.string().valid('pending', 'approved', 'rejected', 'suspended'),
  role_id: Joi.number().integer().positive(),
  search: Joi.string().allow('', null),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort_by: Joi.string().valid('first_name', 'last_name', 'email', 'username', 'approval_status', 'status', 'created_at', 'updated_at').default('created_at'),
  sort_order: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').default('DESC')
});

const approvalActionSchema = Joi.object({
  notes: Joi.string().allow('', null)
});

module.exports = {
  createCompanyUserSchema,
  updateCompanyUserSchema,
  companyUserQuerySchema,
  approvalActionSchema
};
