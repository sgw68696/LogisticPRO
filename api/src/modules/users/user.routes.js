const express = require('express');
const userController = require('./user.controller');
const authenticate = require('../../middlewares/auth.middleware');
const authorizeRoles = require('../../middlewares/role.middleware');
const validate = require('../../middlewares/validate.middleware');
const { getMeSchema } = require('./user.validation');

const router = express.Router();

router.get('/me', authenticate, authorizeRoles('admin', 'manager', 'user'), validate(getMeSchema), userController.getMe);

module.exports = router;
