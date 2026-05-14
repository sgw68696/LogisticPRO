const Joi = require('joi');

const loginSchema = Joi.object({
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required()
  }),
  params: Joi.object({}),
  query: Joi.object({})
});

module.exports = {
  loginSchema
};
