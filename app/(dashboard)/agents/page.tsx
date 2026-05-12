"use client";

import { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users, Search, Plus, MoreVertical, Eye, Trash2,
  Mail, Phone, Shield,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { agentService } from '@/services/agentService';
import { formatDate } from '@/lib/utils';
import type { Agent } from '@/data/mockData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const AVAILABLE_ROLES = ['Manager', 'Dispatcher', 'Agent', 'Staff', 'Operator'];

export default function AgentsPage() {
  const { user, canManageAgents, getCurrentCompanyId } = useAuth();
  const router = useRouter();
  const companyId = getCurrentCompanyId();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newAgentForm, setNewAgentForm] = useState({
    name: '',
    email: '',
    phone: '',
    username: '',
    selectedRole: 'Agent',
  });

  useEffect(() => {
    if (!canManageAgents) {
      router.push('/dashboard');
      return;
    }

    loadAgents();
  }, [canManageAgents, router, companyId]);

  async function loadAgents() {
    if (!companyId) return;
    
    setLoading(true);
    try {
      const response = await agentService.getAgentsByCompany(companyId, 1, 50);
      setAgents(response.agents);
    } catch (error) {
      console.error('Failed to load agents:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(search.toLowerCase()) ||
    agent.email.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Suspended': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  async function handleCreateAgent() {
    if (!companyId) return;
    
    try {
      const result = await agentService.createAgent({
        companyId,
        name: newAgentForm.name,
        email: newAgentForm.email,
        phone: newAgentForm.phone,
        username: newAgentForm.username,
        roles: [{
          roleType: newAgentForm.selectedRole as any,
          scope: 'company',
          scopeId: null,
        }],
      });

      if (result.success) {
        await loadAgents();
        setShowCreateDialog(false);
        setNewAgentForm({
          name: '',
          email: '',
          phone: '',
          username: '',
          selectedRole: 'Agent',
        });
      }
    } catch (error) {
      console.error('Failed to create agent:', error);
    }
  }

  async function handleDeleteAgent(agentId: string) {
    if (confirm('Are you sure you want to delete this agent?')) {
      try {
        await agentService.deleteAgent(agentId);
        await loadAgents();
      } catch (error) {
        console.error('Failed to delete agent:', error);
      }
    }
  }

  if (!canManageAgents) {
    return null;
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              Agents
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your company agents and their roles
            </p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Agent
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Agent</DialogTitle>
                <DialogDescription>
                  Add a new agent to your company
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="agent-name">Full Name</Label>
                  <Input
                    id="agent-name"
                    placeholder="Agent name"
                    value={newAgentForm.name}
                    onChange={(e) => setNewAgentForm(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agent-email">Email</Label>
                  <Input
                    id="agent-email"
                    type="email"
                    placeholder="agent@company.com"
                    value={newAgentForm.email}
                    onChange={(e) => setNewAgentForm(prev => ({
                      ...prev,
                      email: e.target.value
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agent-phone">Phone</Label>
                  <Input
                    id="agent-phone"
                    placeholder="+91 XXXXX XXXXX"
                    value={newAgentForm.phone}
                    onChange={(e) => setNewAgentForm(prev => ({
                      ...prev,
                      phone: e.target.value
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agent-username">Username</Label>
                  <Input
                    id="agent-username"
                    placeholder="agent_username"
                    value={newAgentForm.username}
                    onChange={(e) => setNewAgentForm(prev => ({
                      ...prev,
                      username: e.target.value
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agent-role">Role</Label>
                  <Select value={newAgentForm.selectedRole} onValueChange={(value) => 
                    setNewAgentForm(prev => ({ ...prev, selectedRole: value }))
                  }>
                    <SelectTrigger id="agent-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_ROLES.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateAgent}
                    className="flex-1"
                  >
                    Create Agent
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Agents Table */}
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-b hover:bg-transparent">
                <TableHead>Agent</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading agents...
                  </TableCell>
                </TableRow>
              ) : filteredAgents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {agents.length === 0 ? 'No agents created yet' : 'No agents found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAgents.map((agent) => (
                  <TableRow key={agent.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <p className="font-semibold">{agent.name}</p>
                        <p className="text-xs text-muted-foreground">{agent.username}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {agent.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {agent.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 flex-wrap">
                        {agent.roleAssignments.map((role) => (
                          <Badge key={role.id} variant="secondary" className="text-xs">
                            {role.roleType}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(agent.status)}>
                        {agent.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(agent.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/agents/${agent.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteAgent(agent.id)}>
                            <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm font-medium text-muted-foreground">Total Agents</div>
            <p className="text-2xl font-bold mt-2">{agents.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm font-medium text-muted-foreground">Active</div>
            <p className="text-2xl font-bold mt-2">
              {agents.filter(a => a.status === 'Active').length}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm font-medium text-muted-foreground">Suspended</div>
            <p className="text-2xl font-bold mt-2">
              {agents.filter(a => a.status === 'Suspended').length}
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
