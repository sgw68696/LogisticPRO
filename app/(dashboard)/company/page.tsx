"use client";

import { useEffect, useState } from 'react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Building2, Mail, Phone, MapPin, Globe, FileText,
  AlertCircle, CheckCircle, Clock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { companyService } from '@/services/companyService';
import { formatDate } from '@/lib/utils';
import type { Company } from '@/data/mockData';

export default function CompanySettingsPage() {
  const { user, canManageCompany, getCurrentCompanyId } = useAuth();
  const router = useRouter();
  const companyId = getCurrentCompanyId();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Company>>({});

  useEffect(() => {
    if (!canManageCompany) {
      router.push('/dashboard');
      return;
    }

    loadCompany();
  }, [canManageCompany, router, companyId]);

  async function loadCompany() {
    if (!companyId) return;
    
    setLoading(true);
    try {
      const response = await companyService.getCompanyById(companyId);
      if (response.company) {
        setCompany(response.company);
        setFormData(response.company);
      }
    } catch (error) {
      console.error('Failed to load company:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveChanges() {
    if (!companyId) return;
    
    try {
      const result = await companyService.updateCompany(companyId, formData);
      if (result.success) {
        await loadCompany();
        setEditMode(false);
      }
    } catch (error) {
      console.error('Failed to update company:', error);
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Active': 'bg-green-100 text-green-800 flex items-center gap-1',
      'Inactive': 'bg-gray-100 text-gray-800 flex items-center gap-1',
      'Suspended': 'bg-red-100 text-red-800 flex items-center gap-1',
      'Pending': 'bg-yellow-100 text-yellow-800 flex items-center gap-1',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle className="h-3 w-3" />;
      case 'Pending':
        return <Clock className="h-3 w-3" />;
      case 'Suspended':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return null;
    }
  };

  if (!canManageCompany || loading || !company) {
    return (
      <PageWrapper>
        <div className="text-center py-12">
          {loading ? 'Loading company details...' : 'No company found'}
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              Company Settings
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your company profile and information
            </p>
          </div>
          
          {!editMode && (
            <Button onClick={() => setEditMode(true)}>
              Edit Company
            </Button>
          )}
        </div>

        {/* Status Overview */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div className="space-y-4 flex-1">
                <div>
                  <h2 className="text-2xl font-bold">{company.name}</h2>
                  <p className="text-muted-foreground mt-1">ID: {company.id}</p>
                </div>
                
                <div className="flex gap-2">
                  <Badge className={getStatusColor(company.status)}>
                    {getStatusIcon(company.status)}
                    {company.status}
                  </Badge>
                  <Badge variant="secondary">{company.businessType}</Badge>
                  <Badge variant="outline">{company.plan} Plan</Badge>
                </div>
              </div>

              <div className="text-right space-y-2">
                <p className="text-sm text-muted-foreground">Billing Cycle</p>
                <p className="text-lg font-semibold">{company.billingCycle}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Basic details about your company
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {editMode ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input
                      id="company-name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-email">Email</Label>
                    <Input
                      id="company-email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-phone">Phone</Label>
                    <Input
                      id="company-phone"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-website">Website</Label>
                    <Input
                      id="company-website"
                      value={formData.website || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-tax-id">Tax ID</Label>
                    <Input
                      id="company-tax-id"
                      value={formData.taxId || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company-contact">Contact Person</Label>
                    <Input
                      id="company-contact"
                      value={formData.contactPerson || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => {
                    setEditMode(false);
                    setFormData(company);
                  }}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveChanges}>
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </div>
                  <p className="font-medium">{company.email}</p>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone
                  </div>
                  <p className="font-medium">{company.phone}</p>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Tax ID</div>
                  <p className="font-medium">{company.taxId}</p>
                </div>

                {company.website && (
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Website
                    </div>
                    <p className="font-medium">
                      <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {company.website}
                      </a>
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Contact Person</div>
                  <p className="font-medium">{company.contactPerson}</p>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Contact Phone</div>
                  <p className="font-medium">{company.contactPhone}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Address Information */}
        <Card>
          <CardHeader>
            <CardTitle>Registered Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{company.registeredAddress}</p>
                <p className="text-muted-foreground">
                  {company.city}, {company.state} {company.pincode}
                </p>
                <p className="text-muted-foreground">{company.country}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Information */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription</CardTitle>
            <CardDescription>
              Your current subscription plan and billing information
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <div className="text-sm text-muted-foreground">Plan</div>
              <p className="text-2xl font-bold mt-2">{company.plan}</p>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Billing Cycle</div>
              <p className="text-2xl font-bold mt-2">{company.billingCycle}</p>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Started On</div>
              <p className="text-lg font-semibold mt-2">
                {formatDate(company.createdAt)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card className="text-sm">
          <CardHeader>
            <CardTitle className="text-base">Additional Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <div className="text-muted-foreground">Created</div>
              <p className="font-medium">{formatDate(company.createdAt)}</p>
            </div>
            <div>
              <div className="text-muted-foreground">Last Updated</div>
              <p className="font-medium">{formatDate(company.updatedAt)}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
