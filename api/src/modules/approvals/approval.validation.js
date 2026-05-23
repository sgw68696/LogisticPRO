const Joi = require('joi');

const createApprovalSchema = Joi.object({
  request_type: Joi.string().valid('company_user', 'organization_user', 'company', 'organization').required()
    .messages({
      'string.empty': 'Request type is required',
      'any.only': 'Invalid request type'
    }),
  request_id: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Request ID must be a number',
      'number.positive': 'Request ID must be positive',
      'any.required': 'Request ID is required'
    }),
  requested_by: Joi.number().integer().positive().required()
    .messages({
      'number.base': 'Requested by must be a number',
      'number.positive': 'Requested by must be positive',
      'any.required': 'Requested by is required'
    }),
  organization_id: Joi.number().integer().positive().allow(null)
    .messages({
      'number.base': 'Organization ID must be a number',
      'number.positive': 'Organization ID must be positive'
    }),
  company_id: Joi.number().integer().positive().allow(null)
    .messages({
      'number.base': 'Company ID must be a number',
      'number.positive': 'Company ID must be positive'
    }),
  notes: Joi.string().allow('', null)
    .messages({
      'string.max': 'Notes must not exceed 500 characters'
    }),
  metadata: Joi.object().allow(null)
});

const approvalActionSchema = Joi.object({
  notes: Joi.string().allow('', null).max(500)
    .messages({
      'string.max': 'Notes must not exceed 500 characters'
    })
});

const approvalQuerySchema = Joi.object({
  request_type: Joi.string().valid('company_user', 'organization_user', 'company', 'organization'),
  approval_status: Joi.string().valid('pending', 'approved', 'rejected', 'suspended'),
  requested_by: Joi.number().integer().positive(),
  organization_id: Joi.number().integer().positive(),
  company_id: Joi.number().integer().positive(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort_by: Joi.string().valid('request_type', 'approval_status', 'created_at', 'updated_at').default('created_at'),
  sort_order: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').default('DESC')
});

module.exports = {
  createApprovalSchema,
  approvalActionSchema,
  approvalQuerySchema
};
