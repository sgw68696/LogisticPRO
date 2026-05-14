const success = (res, { statusCode = 200, message = 'Success', data = null, meta = null }) => {
  const body = {
    success: true,
    message,
    data
  };

  if (meta) body.meta = meta;

  return res.status(statusCode).json(body);
};

const error = (res, { statusCode = 500, message = 'Internal server error', errors = [] }) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};

module.exports = {
  success,
  error
};
