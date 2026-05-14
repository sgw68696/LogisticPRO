const ApiError = require('../utils/ApiError');

const validate = (schema) => {
  return (req, res, next) => {
    const { value, error } = schema.validate(
      {
        body: req.body,
        params: req.params,
        query: req.query
      },
      {
        abortEarly: false,
        stripUnknown: true
      }
    );

    if (error) {
      const errors = error.details.map((detail) => detail.message);
      return next(new ApiError(400, 'Validation failed', errors));
    }

    req.body = value.body;
    req.params = value.params;

    return next();
  };
};

module.exports = validate;
