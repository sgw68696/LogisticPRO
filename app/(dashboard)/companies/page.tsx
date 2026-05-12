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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2, Search, Plus, MoreVertical, Eye, Check, X,
  Calendar, MapPin, User, Mail, Phone,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { companyService } from '@/services/companyService';
import { formatDate } from '@/lib/utils';
import type { Company, CompanyStatus, RegistrationStatus } from '@/data/mockData';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function CompaniesPage() {
  const { user, isSuperAdmin } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | 'all'>('all');
  const [registrationFilter, setRegistrationFilter] = useState<RegistrationStatus | 'all'>('all');

  useEffect(() => {
    if (!isSuperAdmin) {
      router.push('/dashboard');
      return;
    }

    loadCompanies();
  }, [isSuperAdmin, router]);

  async function loadCompanies() {
    setLoading(true);
    try {
      const filters: any = {};
      if (statusFilter !== 'all') filters.status = statusFilter;
      if (registrationFilter !== 'all') filters.registrationStatus = registrationFilter;

      const response = await companyService.getCompanies(1, 50, filters);
      setCompanies(response.companies);
    } catch (error) {
      console.error('Failed to load companies:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(search.toLowerCase()) ||
    company.email.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status: CompanyStatus) => {
    const colors: Record<CompanyStatus, string> = {
      'Active': 'bg-green-100 text-green-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Suspended': 'bg-red-100 text-red-800',
      'Inactive': 'bg-gray-100 text-gray-800',
    };
    return colors[status];
  };

  const getRegistrationColor = (status: RegistrationStatus) => {
    const colors: Record<RegistrationStatus, string> = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Submitted': 'bg-blue-100 text-blue-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
    };
    return colors[status];
  };

  async function handleApprove(companyId: string) {
    try {
      const result = await companyService.approveCompany(companyId, user!.id);
      if (result.success) {
        await loadCompanies();
      }
    } catch (error) {
      console.error('Failed to approve company:', error);
    }
  }

  async function handleReject(companyId: string) {
    try {
      const result = await companyService.rejectCompany(companyId, 'Rejected by admin');
      if (result.success) {
        await loadCompanies();
      }
    } catch (error) {
      console.error('Failed to reject company:', error);
    }
  }

  if (!isSuperAdmin) {
    return null;
  }

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              Companies
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and oversee all registered companies
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search companies..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value as any);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={registrationFilter}
              onValueChange={(value) => {
                setRegistrationFilter(value as any);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Registration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Registration</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Companies Table */}
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="border-b hover:bg-transparent">
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Registration</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Loading companies...
                  </TableCell>
                </TableRow>
              ) : filteredCompanies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No companies found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCompanies.map((company) => (
                  <TableRow key={company.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="space-y-1">
                        <p className="font-semibold">{company.name}</p>
                        <p className="text-xs text-muted-foreground">{company.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-muted-foreground" />
                          {company.email}
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          {company.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(company.status)}>
                        {company.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRegistrationColor(company.registrationStatus)}>
                        {company.registrationStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{company.plan}</span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(company.registrationDate)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => router.push(`/companies/${company.id}`)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {company.registrationStatus === 'Submitted' && (
                            <>
                              <DropdownMenuItem onClick={() => handleApprove(company.id)}>
                                <Check className="mr-2 h-4 w-4 text-green-600" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleReject(company.id)}>
                                <X className="mr-2 h-4 w-4 text-red-600" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm font-medium text-muted-foreground">Total Companies</div>
            <p className="text-2xl font-bold mt-2">{companies.length}</p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm font-medium text-muted-foreground">Active</div>
            <p className="text-2xl font-bold mt-2">
              {companies.filter(c => c.status === 'Active').length}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm font-medium text-muted-foreground">Pending Registration</div>
            <p className="text-2xl font-bold mt-2">
              {companies.filter(c => c.registrationStatus === 'Submitted').length}
            </p>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-sm font-medium text-muted-foreground">Suspended</div>
            <p className="text-2xl font-bold mt-2">
              {companies.filter(c => c.status === 'Suspended').length}
            </p>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
