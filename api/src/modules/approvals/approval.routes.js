const express = require('express');
const approvalController = require('./approval.controller');
const authenticate = require('../../middlewares/auth.middleware');
const { requireRole } = require('../../middlewares/role.middleware');

const router = express.Router();

router.use(authenticate);
router.use(requireRole(['superadmin']));

router.post('/', 
  approvalController.createApprovalRequest
);

router.get('/', 
  approvalController.getAllApprovals
);

router.get('/pending', 
  approvalController.getPendingApprovals
);

router.get('/:id', 
  approvalController.getApprovalById
);

router.get('/uuid/:uuid', 
  approvalController.getApprovalByUuid
);

router.post('/:id/approve', 
  approvalController.approveRequest
);

router.post('/:id/reject', 
  approvalController.rejectRequest
);

router.post('/:id/suspend', 
  approvalController.suspendRequest
);

router.post('/:id/reactivate', 
  approvalController.reactivateRequest
);

router.delete('/:id', 
  approvalController.deleteApproval
);

module.exports = router;
