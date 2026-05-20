const responseHandler = (req, res, next) => {
  res.success = (data = null, message = 'Success', statusCode = 200) => {
    const body = {
      success: true,
      message
    };

    if (data && typeof data === 'object') {
      if (data.pagination) {
        body.data = data.data || data;
        body.meta = data.pagination;
      } else {
        body.data = data;
      }
    } else if (data !== null) {
      body.data = data;
    }

    return res.status(statusCode).json(body);
  };

  res.error = (message = 'Internal server error', statusCode = 500, errors = []) => {
    return res.status(statusCode).json({
      success: false,
      message,
      errors
    });
  };

  next();
};

module.exports = responseHandler;
