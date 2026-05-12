"use client";

import { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Building, Search, Plus, MapPin, Users, Trash2,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { organizationService } from '@/services/organizationService';
import type { Organization } from '@/data/mockData';
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

const ORG_TYPES = ['Regional', 'Department', 'Branch', 'Division'];

export default function OrganizationsPage() {
  const { user, canManageOrganizations, getCurrentCompanyId } = useAuth();
  const router = useRouter();
  const companyId = getCurrentCompanyId();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newOrgForm, setNewOrgForm] = useState({
    name: '',
    type: 'Regional',
    address: '',
    city: '',
    state: '',
    pincode: '',
    managerId: '',
  });

  useEffect(() => {
    if (!canManageOrganizations) {
      router.push('/dashboard');
      return;
    }

    loadOrganizations();
  }, [canManageOrganizations, router, companyId]);

  async function loadOrganizations() {
    if (!companyId) return;
    
    setLoading(true);
    try {
      const response = await organizationService.getOrganizationsByCompany(companyId);
      setOrganizations(response.organizations);
    } catch (error) {
      console.error('Failed to load organizations:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(search.toLowerCase()) ||
    org.city.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800',
      'Inactive': 'bg-gray-100 text-gray-800',
      'Suspended': 'bg-red-100 text-red-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  async function handleCreateOrganization() {
    if (!companyId) return;
    
    try {
      const result = await organizationService.createOrganization({
        companyId,
        name: newOrgForm.name,
        type: newOrgForm.type as any,
        address: newOrgForm.address,
        city: newOrgForm.city,
        state: newOrgForm.state,
        pincode: newOrgForm.pincode,
        managerId: newOrgForm.managerId,
      });

      if (result.success) {
        await loadOrganizations();
        setShowCreateDialog(false);
        setNewOrgForm({
          name: '',
          type: 'Regional',
          address: '',
          city: '',
          state: '',
          pincode: '',
          managerId: '',
        });
      }
    } catch (error) {
      console.error('Failed to create organization:', error);
    }
  }

  async function handleDeleteOrganization(orgId: string) {
    if (confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      try {
        await organizationService.deleteOrganization(orgId);
        await loadOrganizations();
      } catch (error) {
        console.error('Failed to delete organization:', error);
      }
    }
  }

  if (!canManageOrganizations) {
    return null;
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Building className="h-8 w-8 text-primary" />
              Organizations
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your company's regional and departmental divisions
            </p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Organization
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Organization</DialogTitle>
                <DialogDescription>
                  Add a new regional office or department to your company
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="org-name">Organization Name</Label>
                  <Input
                    id="org-name"
                    placeholder="e.g., Bangalore Regional Office"
                    value={newOrgForm.name}
                    onChange={(e) => setNewOrgForm(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-type">Type</Label>
                  <Select value={newOrgForm.type} onValueChange={(value) => 
                    setNewOrgForm(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger id="org-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORG_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-address">Address</Label>
                  <Input
                    id="org-address"
                    placeholder="Street address"
                    value={newOrgForm.address}
                    onChange={(e) => setNewOrgForm(prev => ({
                      ...prev,
                      address: e.target.value
                    }))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="org-city">City</Label>
                    <Input
                      id="org-city"
                      placeholder="City"
                      value={newOrgForm.city}
                      onChange={(e) => setNewOrgForm(prev => ({
                        ...prev,
                        city: e.target.value
                      }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="org-state">State</Label>
                    <Input
                      id="org-state"
                      placeholder="State"
                      value={newOrgForm.state}
                      onChange={(e) => setNewOrgForm(prev => ({
                        ...prev,
                        state: e.target.value
                      }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org-pincode">Pincode</Label>
                  <Input
                    id="org-pincode"
                    placeholder="Postal code"
                    value={newOrgForm.pincode}
                    onChange={(e) => setNewOrgForm(prev => ({
                      ...prev,
                      pincode: e.target.value
                    }))}
                  />
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
                    onClick={handleCreateOrganization}
                    className="flex-1"
                  >
                    Create Organization
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
            placeholder="Search organizations..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Organizations Grid */}
        {loading ? (
          <div className="text-center py-12">
            Loading organizations...
          </div>
        ) : filteredOrganizations.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No organizations yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first organization to manage regional offices or departments
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Organization
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrganizations.map((org) => (
              <Card key={org.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{org.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {org.type} • {org.id}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(org.status)}>
                      {org.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Address */}
                  <div className="flex gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium">{org.address}</p>
                      <p className="text-muted-foreground">
                        {org.city}, {org.state} {org.pincode}
                      </p>
                    </div>
                  </div>

                  {/* Agents */}
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <span className="font-medium">{org.agentCount} agent{org.agentCount !== 1 ? 's' : ''}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => router.push(`/organizations/${org.id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDeleteOrganization(org.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        {organizations.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-muted-foreground">Total Organizations</div>
                <p className="text-2xl font-bold mt-2">{organizations.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-muted-foreground">Active</div>
                <p className="text-2xl font-bold mt-2">
                  {organizations.filter(o => o.status === 'Active').length}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-muted-foreground">Total Agents</div>
                <p className="text-2xl font-bold mt-2">
                  {organizations.reduce((sum, o) => sum + o.agentCount, 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-sm font-medium text-muted-foreground">Regional</div>
                <p className="text-2xl font-bold mt-2">
                  {organizations.filter(o => o.type === 'Regional').length}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
