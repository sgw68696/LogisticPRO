const express = require('express');
const { success } = require('../utils/response');

const router = express.Router();

router.get('/health', (req, res) => {
  return success(res, {
    message: 'Service is healthy',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = router;
