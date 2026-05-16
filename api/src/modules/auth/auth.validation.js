const Joi = require('joi');

const loginSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().required(),
    password: Joi.string().min(8).max(128).required()
  }),
  params: Joi.object({}),
  query: Joi.object({})
});

const refreshTokenSchema = Joi.object({
  body: Joi.object({
    refreshToken: Joi.string().optional()
  }),
  params: Joi.object({}),
  query: Joi.object({})
});

const changePasswordSchema = Joi.object({
  body: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).max(128)
      .not(Joi.ref('currentPassword'))
      .messages({ 'any.invalid': 'New password must be different from current password' }),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword'))
      .messages({ 'any.only': 'Passwords do not match' })
  }),
  params: Joi.object({}),
  query: Joi.object({})
});

const forgotPasswordSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required()
  }),
  params: Joi.object({}),
  query: Joi.object({})
});

const resetPasswordSchema = Joi.object({
  body: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(8).max(128).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password'))
      .messages({ 'any.only': 'Passwords do not match' })
  }),
  params: Joi.object({}),
  query: Joi.object({})
});

module.exports = {
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema
};
