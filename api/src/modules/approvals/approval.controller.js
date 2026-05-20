const approvalService = require('./approval.service');
const { createApprovalSchema, approvalActionSchema, approvalQuerySchema } = require('./approval.validation');
const asyncHandler = require('../../utils/asyncHandler');

class ApprovalController {
  getAllApprovals = asyncHandler(async (req, res) => {
    const filters = await approvalQuerySchema.validateAsync(req.query);
    const result = await approvalService.getAllApprovals(filters, req.user);
    
    res.success({
      approvals: result.approvals,
      pagination: result.pagination
    }, 'Approval requests retrieved successfully');
  });

  getApprovalById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const approval = await approvalService.getApprovalById(id, req.user);
    
    res.success(approval, 'Approval request retrieved successfully');
  });

  getApprovalByUuid = asyncHandler(async (req, res) => {
    const { uuid } = req.params;
    const approval = await approvalService.getApprovalByUuid(uuid, req.user);
    
    res.success(approval, 'Approval request retrieved successfully');
  });

  createApprovalRequest = asyncHandler(async (req, res) => {
    const data = await createApprovalSchema.validateAsync(req.body);
    const approval = await approvalService.createApprovalRequest(data, req.user);
    
    res.success(approval, 'Approval request created successfully', 201);
  });

  approveRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { notes } = await approvalActionSchema.validateAsync(req.body);
    const approval = await approvalService.approveRequest(id, notes, req.user);
    
    res.success(approval, 'Approval request approved successfully');
  });

  rejectRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { notes } = await approvalActionSchema.validateAsync(req.body);
    const approval = await approvalService.rejectRequest(id, notes, req.user);
    
    res.success(approval, 'Approval request rejected successfully');
  });

  suspendRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { notes } = await approvalActionSchema.validateAsync(req.body);
    const approval = await approvalService.suspendRequest(id, notes, req.user);
    
    res.success(approval, 'Approval request suspended successfully');
  });

  reactivateRequest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { notes } = await approvalActionSchema.validateAsync(req.body);
    const approval = await approvalService.reactivateRequest(id, notes, req.user);
    
    res.success(approval, 'Approval request reactivated successfully');
  });

  getPendingApprovals = asyncHandler(async (req, res) => {
    const filters = await approvalQuerySchema.validateAsync(req.query);
    const pendingApprovals = await approvalService.getPendingApprovals(filters, req.user);
    
    res.success(pendingApprovals, 'Pending approvals retrieved successfully');
  });

  deleteApproval = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const result = await approvalService.deleteApproval(id, req.user);
    
    res.success(result, 'Approval request deleted successfully');
  });
}

module.exports = new ApprovalController();
