import { APP_CONFIG } from '@/config/appConfig';
import { mockAgents, type Agent, type AgentRole, type AgentPermission, type UserRole } from '@/data/mockData';

export interface CreateAgentRequest {
  companyId: string;
  organizationId?: string | null;
  name: string;
  email: string;
  phone: string;
  username: string;
  roles: Array<{
    roleType: UserRole;
    scope: 'company' | 'organization' | 'department';
    scopeId: string | null;
  }>;
}

export interface UpdateAgentRequest {
  name?: string;
  email?: string;
  phone?: string;
  status?: 'Active' | 'Inactive' | 'Suspended';
}

export interface AgentListResponse {
  agents: Agent[];
  total: number;
  page: number;
  pageSize: number;
}

export const agentService = {
  // Get agents by company
  getAgentsByCompany: async (
    companyId: string,
    page: number = 1,
    pageSize: number = 10,
    filters?: { organizationId?: string; status?: string }
  ): Promise<AgentListResponse> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      let filtered = mockAgents.filter(a => a.companyId === companyId);
      
      if (filters?.organizationId) {
        filtered = filtered.filter(a => a.organizationId === filters.organizationId);
      }
      if (filters?.status) {
        filtered = filtered.filter(a => a.status === filters.status);
      }
      
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      
      return {
        agents: filtered.slice(start, end),
        total: filtered.length,
        page,
        pageSize,
      };
    }
    
    const params = new URLSearchParams({
      companyId,
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...(filters?.organizationId && { organizationId: filters.organizationId }),
      ...(filters?.status && { status: filters.status }),
    });
    
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/agents?${params}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    
    return response.json();
  },

  // Get agent by ID
  getAgentById: async (agentId: string): Promise<Agent | null> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 200));
      return mockAgents.find(a => a.id === agentId) || null;
    }
    
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/agents/${agentId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    
    if (!response.ok) return null;
    return response.json();
  },

  // Create agent
  createAgent: async (data: CreateAgentRequest): Promise<{ success: boolean; agentId?: string; error?: string }> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const createdBy = user?.id || 'usr-001';
      
      const newAgent: Agent = {
        id: `agt-${Date.now()}`,
        companyId: data.companyId,
        organizationId: data.organizationId || null,
        name: data.name,
        email: data.email,
        phone: data.phone,
        username: data.username,
        status: 'Active',
        roleAssignments: data.roles.map((role, idx) => ({
          id: `rl-${Date.now()}-${idx}`,
          agentId: `agt-${Date.now()}`,
          roleType: role.roleType,
          permissions: getDefaultPermissions(role.roleType),
          assignedAt: new Date().toISOString(),
          assignedBy: createdBy,
          scope: role.scope,
          scopeId: role.scopeId,
        })),
        createdAt: new Date().toISOString(),
        createdBy,
        updatedAt: new Date().toISOString(),
      };
      
      (mockAgents as any).push(newAgent);
      return { success: true, agentId: newAgent.id };
    }
    
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/agents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    
    return response.json();
  },

  // Update agent
  updateAgent: async (agentId: string, data: UpdateAgentRequest): Promise<{ success: boolean; error?: string }> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const agent = mockAgents.find(a => a.id === agentId);
      if (agent) {
        Object.assign(agent, data, { updatedAt: new Date().toISOString() });
        return { success: true };
      }
      return { success: false, error: 'Agent not found' };
    }
    
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/agents/${agentId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(data),
    });
    
    return response.json();
  },

  // Assign role to agent
  assignRole: async (
    agentId: string,
    roleType: UserRole,
    scope: 'company' | 'organization' | 'department',
    scopeId: string | null
  ): Promise<{ success: boolean; roleId?: string; error?: string }> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const agent = mockAgents.find(a => a.id === agentId);
      if (agent) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const assignedBy = user?.id || 'usr-001';
        
        const newRole: AgentRole = {
          id: `rl-${Date.now()}`,
          agentId,
          roleType,
          permissions: getDefaultPermissions(roleType),
          assignedAt: new Date().toISOString(),
          assignedBy,
          scope,
          scopeId,
        };
        
        agent.roleAssignments.push(newRole);
        agent.updatedAt = new Date().toISOString();
        return { success: true, roleId: newRole.id };
      }
      return { success: false, error: 'Agent not found' };
    }
    
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/agents/${agentId}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ roleType, scope, scopeId }),
    });
    
    return response.json();
  },

  // Revoke role from agent
  revokeRole: async (agentId: string, roleId: string): Promise<{ success: boolean; error?: string }> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const agent = mockAgents.find(a => a.id === agentId);
      if (agent) {
        const idx = agent.roleAssignments.findIndex(r => r.id === roleId);
        if (idx > -1) {
          agent.roleAssignments.splice(idx, 1);
          agent.updatedAt = new Date().toISOString();
          return { success: true };
        }
      }
      return { success: false, error: 'Role not found' };
    }
    
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/agents/${agentId}/roles/${roleId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    
    return response.json();
  },

  // Update permissions for a role
  updateRolePermissions: async (
    agentId: string,
    roleId: string,
    permissions: AgentPermission[]
  ): Promise<{ success: boolean; error?: string }> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const agent = mockAgents.find(a => a.id === agentId);
      if (agent) {
        const role = agent.roleAssignments.find(r => r.id === roleId);
        if (role) {
          role.permissions = permissions;
          agent.updatedAt = new Date().toISOString();
          return { success: true };
        }
      }
      return { success: false, error: 'Role not found' };
    }
    
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/agents/${agentId}/roles/${roleId}/permissions`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ permissions }),
    });
    
    return response.json();
  },

  // Delete agent
  deleteAgent: async (agentId: string): Promise<{ success: boolean; error?: string }> => {
    if (APP_CONFIG.USE_MOCK) {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const index = mockAgents.findIndex(a => a.id === agentId);
      if (index > -1) {
        mockAgents.splice(index, 1);
        return { success: true };
      }
      return { success: false, error: 'Agent not found' };
    }
    
    const response = await fetch(`${APP_CONFIG.API_BASE_URL}/agents/${agentId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    
    return response.json();
  },
};

// Helper function to get default permissions for a role type
function getDefaultPermissions(roleType: UserRole): AgentPermission[] {
  const defaultPermissions: Record<UserRole, AgentPermission[]> = {
    'SuperAdmin': [
      { module: 'companies', action: 'view', allowed: true, grantedAt: new Date().toISOString() },
      { module: 'companies', action: 'create', allowed: true, grantedAt: new Date().toISOString() },
      { module: 'companies', action: 'edit', allowed: true, grantedAt: new Date().toISOString() },
      { module: 'companies', action: 'delete', allowed: true, grantedAt: new Date().toISOString() },
    ],
    'CompanyAdmin': [
      { module: 'agents', action: 'view', allowed: true, grantedAt: new Date().toISOString() },
      { module: 'agents', action: 'create', allowed: true, grantedAt: new Date().toISOString() },
      { module: 'agents', action: 'edit', allowed: true, grantedAt: new Date().toISOString() },
      { module: 'agents', action: 'delete', allowed: true, grantedAt: new Date().toISOString() },
      { module: 'shipments', action: 'view', allowed: true, grantedAt: new Date().toISOString() },
      { module: 'shipments', action: 'create', allowed: true, grantedAt: new Date().toISOString() },
    ],
    'Manager': [
      { module: 'shipments', action: 'view', allowed: true, grantedAt: new Date().toISOString() },
      { module: 'shipments', action: 'create', allowed: true, grantedAt: new Date().toISOString() },
      { module: 'shipments', action: 'edit', allowed: true, grantedAt: new Date().toISOString() },
    ],
    'Dispatcher': [
      { module: 'shipments', action: 'view', allowed: true, grantedAt: new Date().toISOString() },
      { module: 'dispatch', action: 'view', allowed: true, grantedAt: new Date().toISOString() },
      { module: 'dispatch', action: 'edit', allowed: true, grantedAt: new Date().toISOString() },
    ],
    'Agent': [
      { module: 'shipments', action: 'view', allowed: true, grantedAt: new Date().toISOString() },
      { module: 'shipments', action: 'create', allowed: true, grantedAt: new Date().toISOString() },
    ],
    'Staff': [
      { module: 'shipments', action: 'view', allowed: true, grantedAt: new Date().toISOString() },
    ],
    'Operator': [
      { module: 'shipments', action: 'view', allowed: true, grantedAt: new Date().toISOString() },
      { module: 'dispatch', action: 'view', allowed: true, grantedAt: new Date().toISOString() },
    ],
    'Admin': [
      { module: 'shipments', action: 'view', allowed: true, grantedAt: new Date().toISOString() },
      { module: 'shipments', action: 'create', allowed: true, grantedAt: new Date().toISOString() },
      { module: 'shipments', action: 'edit', allowed: true, grantedAt: new Date().toISOString() },
      { module: 'shipments', action: 'delete', allowed: true, grantedAt: new Date().toISOString() },
    ],
  };
  
  return defaultPermissions[roleType] || [];
}
