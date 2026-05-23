import { APP_CONFIG } from '@/config/appConfig';
import { apiClient, type ApiResponse } from '@/lib/apiClient';

export interface BackendApproval {
  id: number;
  uuid: string;
  request_type: 'company_user' | 'organization_user' | 'company' | 'organization';
  request_id: number;
  requested_by: number;
  organization_id: number | null;
  company_id: number | null;
  approval_status: 'pending' | 'approved' | 'rejected' | 'suspended';
  notes: string | null;
  approved_at: string | null;
  approved_by: number | null;
  rejected_at: string | null;
  rejected_by: number | null;
  suspended_at: string | null;
  suspended_by: number | null;
  reactivated_at: string | null;
  reactivated_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  requested_by_name?: string;
  requested_by_lastname?: string;
  requested_by_email?: string;
  organization_name?: string;
  company_name?: string;
  approved_by_name?: string;
  approved_by_lastname?: string;
  rejected_by_name?: string;
  rejected_by_lastname?: string;
}

export interface ApprovalItem {
  id: number;
  uuid: string;
  company: string;
  type: string;
  submittedBy: string;
  email: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Suspended';
  urgency: 'High' | 'Normal';
  request_type: string;
  request_id: number;
  organization_id: number | null;
  company_id: number | null;
  notes: string | null;
}

export interface ApprovalListResponse {
  approvals: ApprovalItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function mapBackendToApproval(approval: BackendApproval): ApprovalItem {
  const statusMap: Record<string, ApprovalItem['status']> = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    suspended: 'Suspended',
  };

  const typeMap: Record<string, string> = {
    company_user: 'Company User Registration',
    organization_user: 'Organization User Registration',
    company: 'Company Registration',
    organization: 'Organization Registration',
  };

  return {
    id: approval.id,
    uuid: approval.uuid,
    company: approval.company_name || approval.organization_name || 'N/A',
    type: typeMap[approval.request_type] || approval.request_type,
    submittedBy: `${approval.requested_by_name || ''} ${approval.requested_by_lastname || ''}`.trim() || 'Unknown',
    email: approval.requested_by_email || '',
    date: approval.created_at,
    status: statusMap[approval.approval_status] || 'Pending',
    urgency: approval.approval_status === 'pending' ? 'Normal' : 'Normal',
    request_type: approval.request_type,
    request_id: approval.request_id,
    organization_id: approval.organization_id,
    company_id: approval.company_id,
    notes: approval.notes,
  };
}

export const approvalService = {
  getApprovals: async (
    page: number = 1,
    limit: number = 10,
    filters?: { request_type?: string; approval_status?: string; organization_id?: number; company_id?: number }
  ): Promise<ApprovalListResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      const mockApprovals: ApprovalItem[] = [
        {
          id: 1, uuid: 'appr-001', company: 'Global Express Cargo', type: 'Company User Registration',
          submittedBy: 'Priya Sharma', email: 'priya@globalexpress.com', date: '2025-01-14T09:30:00Z',
          status: 'Pending', urgency: 'High', request_type: 'company_user', request_id: 1,
          organization_id: null, company_id: 1, notes: null,
        },
        {
          id: 2, uuid: 'appr-002', company: 'Sunrise Logistics', type: 'Organization User Registration',
          submittedBy: 'Amit Patel', email: 'amit@sunriselog.com', date: '2025-01-13T14:00:00Z',
          status: 'Pending', urgency: 'Normal', request_type: 'organization_user', request_id: 2,
          organization_id: 1, company_id: null, notes: null,
        },
        {
          id: 3, uuid: 'appr-003', company: 'Metro Freight Co.', type: 'Company Registration',
          submittedBy: 'Neha Tripathi', email: 'neha@metrofreight.com', date: '2025-01-12T11:20:00Z',
          status: 'Pending', urgency: 'Normal', request_type: 'company', request_id: 3,
          organization_id: 1, company_id: null, notes: null,
        },
      ];
      return { approvals: mockApprovals, total: mockApprovals.length, page, limit, totalPages: 1 };
    }

    const response = await apiClient.get<{ approvals: BackendApproval[] }>('/approvals', {
      page,
      limit,
      request_type: filters?.request_type,
      approval_status: filters?.approval_status,
      organization_id: filters?.organization_id,
      company_id: filters?.company_id,
    });

    if (!response.success) {
      return { approvals: [], total: 0, page, limit, totalPages: 0 };
    }

    const backendApprovals = response.data.approvals || [];
    return {
      approvals: backendApprovals.map(mapBackendToApproval),
      total: response.meta?.total || 0,
      page: response.meta?.page || page,
      limit: response.meta?.limit || limit,
      totalPages: response.meta?.totalPages || 1,
    };
  },

  getPendingApprovals: async (filters?: { request_type?: string }): Promise<ApprovalItem[]> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return [
        {
          id: 1, uuid: 'appr-001', company: 'Global Express Cargo', type: 'Company User Registration',
          submittedBy: 'Priya Sharma', email: 'priya@globalexpress.com', date: '2025-01-14T09:30:00Z',
          status: 'Pending', urgency: 'High', request_type: 'company_user', request_id: 1,
          organization_id: null, company_id: 1, notes: null,
        },
        {
          id: 2, uuid: 'appr-002', company: 'Sunrise Logistics', type: 'Organization User Registration',
          submittedBy: 'Amit Patel', email: 'amit@sunriselog.com', date: '2025-01-13T14:00:00Z',
          status: 'Pending', urgency: 'Normal', request_type: 'organization_user', request_id: 2,
          organization_id: 1, company_id: null, notes: null,
        },
      ];
    }

    const response = await apiClient.get<BackendApproval[]>('/approvals/pending', {
      request_type: filters?.request_type,
    });

    if (!response.success) return [];
    return (response.data as BackendApproval[]).map(mapBackendToApproval);
  },

  approveRequest: async (id: number, notes?: string): Promise<ApiResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true, message: 'Request approved successfully' };
    }

    return apiClient.post(`/approvals/${id}/approve`, { notes });
  },

  rejectRequest: async (id: number, notes?: string): Promise<ApiResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true, message: 'Request rejected successfully' };
    }

    return apiClient.post(`/approvals/${id}/reject`, { notes });
  },

  suspendRequest: async (id: number, notes?: string): Promise<ApiResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true, message: 'Request suspended successfully' };
    }

    return apiClient.post(`/approvals/${id}/suspend`, { notes });
  },

  reactivateRequest: async (id: number, notes?: string): Promise<ApiResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true, message: 'Request reactivated successfully' };
    }

    return apiClient.post(`/approvals/${id}/reactivate`, { notes });
  },

  deleteApproval: async (id: number): Promise<ApiResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true, message: 'Approval request deleted' };
    }

    return apiClient.delete(`/approvals/${id}`);
  },
};
