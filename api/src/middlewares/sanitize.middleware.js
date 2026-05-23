const xss = require('xss');

const sanitizeValue = (value) => {
  if (typeof value === 'string') return xss(value);
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object') {
    return Object.keys(value).reduce((result, key) => {
      result[key] = sanitizeValue(value[key]);
      return result;
    }, {});
  }

  return value;
};

const sanitizeRequest = (req, res, next) => {
  req.body = sanitizeValue(req.body);
  req.params = sanitizeValue(req.params);
  next();
};

module.exports = sanitizeRequest;
