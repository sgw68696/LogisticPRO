const Joi = require('joi');

const createCompanyTypeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255).required()
    .messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters'
    }),
  slug: Joi.string().trim().min(2).max(100).required()
    .messages({
      'string.empty': 'Slug is required'
    }),
  description: Joi.string().allow('', null).max(500)
});

const updateCompanyTypeSchema = Joi.object({
  name: Joi.string().trim().min(2).max(255),
  slug: Joi.string().trim().min(2).max(100),
  description: Joi.string().allow('', null).max(500)
});

const companyTypeQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  sort_by: Joi.string().valid('name', 'slug', 'created_at', 'updated_at').default('name'),
  sort_order: Joi.string().valid('asc', 'desc', 'ASC', 'DESC').default('ASC')
});

module.exports = {
  createCompanyTypeSchema,
  updateCompanyTypeSchema,
  companyTypeQuerySchema
};
