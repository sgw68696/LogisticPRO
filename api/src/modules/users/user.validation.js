const Joi = require('joi');

const getMeSchema = Joi.object({
  body: Joi.object({}),
  params: Joi.object({}),
  query: Joi.object({})
});

module.exports = {
  getMeSchema
};
