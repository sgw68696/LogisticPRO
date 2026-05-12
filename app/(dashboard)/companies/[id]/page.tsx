"use client";

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2, MapPin, Mail, Phone, Globe, Users, BarChart3,
  ArrowLeft, FileText, Calendar, DollarSign, Package,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { companyService } from '@/services/companyService';
import { organizationService } from '@/services/organizationService';
import { agentService } from '@/services/agentService';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Company, Organization, Agent } from '@/data/mockData';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

export default function CompanyDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { isSuperAdmin } = useAuth();
  const companyId = params.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSuperAdmin) {
      router.push('/dashboard');
      return;
    }

    loadData();
  }, [isSuperAdmin, router, companyId]);

  async function loadData() {
    setLoading(true);
    try {
      const [companyData, orgsResponse, agentsResponse] = await Promise.all([
        companyService.getCompanyById(companyId),
        organizationService.getOrganizationsByCompany(companyId),
        agentService.getAgentsByCompany(companyId),
      ]);

      if (companyData) {
        setCompany(companyData);
      }
      setOrganizations(orgsResponse.organizations);
      setAgents(agentsResponse.agents);
    } catch (error) {
      console.error('Failed to load company data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <PageWrapper>
        <div className="text-center py-8">Loading company details...</div>
      </PageWrapper>
    );
  }

  if (!company) {
    return (
      <PageWrapper>
        <div className="text-center py-8">Company not found</div>
      </PageWrapper>
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Suspended': 'bg-red-100 text-red-800',
      'Inactive': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getRegistrationColor = (status: string) => {
    const colors: Record<string, string> = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Submitted': 'bg-blue-100 text-blue-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="mt-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Building2 className="h-8 w-8 text-primary" />
                {company.name}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">{company.id}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={getStatusColor(company.status)}>
              {company.status}
            </Badge>
            <Badge className={getRegistrationColor(company.registrationStatus)}>
              {company.registrationStatus}
            </Badge>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Organizations</p>
                  <p className="text-2xl font-bold mt-1">{organizations.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Agents</p>
                  <p className="text-2xl font-bold mt-1">{agents.length}</p>
                </div>
                <Users className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Plan</p>
                  <p className="text-2xl font-bold mt-1">{company.plan}</p>
                </div>
                <Package className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Billing</p>
                  <p className="text-2xl font-bold mt-1">{company.billingCycle}</p>
                </div>
                <DollarSign className="h-8 w-8 text-primary opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="organizations">Organizations</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{company.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{company.phone}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Website</p>
                          <p className="font-medium">{company.website || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Registration Details */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Registration Details</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Tax ID</p>
                        <p className="font-medium">{company.taxId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Business Type</p>
                        <p className="font-medium">{company.businessType}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Registered Date</p>
                        <p className="font-medium">{formatDate(company.registrationDate)}</p>
                      </div>
                      {company.approvalDate && (
                        <div>
                          <p className="text-sm text-muted-foreground">Approval Date</p>
                          <p className="font-medium">{formatDate(company.approvalDate)}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-3">Registered Address</h3>
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <p>{company.registeredAddress}</p>
                      <p className="text-sm text-muted-foreground">
                        {company.city}, {company.state} {company.pincode}
                      </p>
                      <p className="text-sm text-muted-foreground">{company.country}</p>
                    </div>
                  </div>
                </div>

                {/* Capacity */}
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-3">Capacity</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Max Organizations</p>
                      <p className="text-xl font-bold">{company.maxOrganizations}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Used: {company.currentOrganizations}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Max Agents</p>
                      <p className="text-xl font-bold">{company.maxAgents}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Used: {company.currentAgents}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Organizations Tab */}
          <TabsContent value="organizations">
            <Card>
              <CardHeader>
                <CardTitle>Organizations</CardTitle>
                <CardDescription>
                  {organizations.length} organization{organizations.length !== 1 ? 's' : ''} in this company
                </CardDescription>
              </CardHeader>
              <CardContent>
                {organizations.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No organizations yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {organizations.map((org) => (
                      <div key={org.id} className="border rounded-lg p-4 hover:bg-muted/50">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{org.name}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {org.type} • {org.agentCount} agent{org.agentCount !== 1 ? 's' : ''}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {org.address}, {org.city}
                            </p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">
                            {org.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents">
            <Card>
              <CardHeader>
                <CardTitle>Agents</CardTitle>
                <CardDescription>
                  {agents.length} agent{agents.length !== 1 ? 's' : ''} in this company
                </CardDescription>
              </CardHeader>
              <CardContent>
                {agents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No agents yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {agents.map((agent) => (
                      <div key={agent.id} className="border rounded-lg p-4 hover:bg-muted/50">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{agent.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {agent.email} • {agent.phone}
                            </p>
                            <div className="flex gap-2 mt-2">
                              {agent.roleAssignments.map((role) => (
                                <Badge key={role.id} variant="outline" className="text-xs">
                                  {role.roleType}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            {agent.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>
                  {company.documents.length} document{company.documents.length !== 1 ? 's' : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {company.documents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No documents uploaded
                  </p>
                ) : (
                  <div className="space-y-3">
                    {company.documents.map((doc, idx) => (
                      <div key={idx} className="border rounded-lg p-4 hover:bg-muted/50">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <h4 className="font-semibold capitalize">{doc.type}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Uploaded: {formatDate(doc.uploadedAt)}
                            </p>
                          </div>
                          <Badge className={doc.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {doc.verified ? 'Verified' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageWrapper>
  );
}
