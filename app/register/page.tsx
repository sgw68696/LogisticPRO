"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Building2, CheckCircle, AlertCircle, Loader2,
  ChevronRight, FileText,
} from 'lucide-react';
import { companyService } from '@/services/companyService';
import type { CreateCompanyRequest } from '@/services/companyService';

const BUSINESS_TYPES = ['Freight', 'Express', 'Courier', 'Logistics', 'Mixed'];
const PLANS = ['Starter', 'Professional', 'Enterprise'];
const BILLING_CYCLES = ['Monthly', 'Quarterly', 'Yearly'];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'form' | 'documents' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<File[]>([]);

  const [formData, setFormData] = useState<CreateCompanyRequest>({
    name: '',
    email: '',
    phone: '',
    registeredAddress: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    taxId: '',
    businessType: 'Logistics',
    contactPerson: '',
    contactPhone: '',
    website: '',
    plan: 'Starter',
    billingCycle: 'Monthly',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setError('');
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Company name is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Valid email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (!formData.registeredAddress.trim()) {
      setError('Address is required');
      return false;
    }
    if (!formData.city.trim()) {
      setError('City is required');
      return false;
    }
    if (!formData.state.trim()) {
      setError('State is required');
      return false;
    }
    if (!formData.pincode.trim()) {
      setError('Pincode is required');
      return false;
    }
    if (!formData.taxId.trim()) {
      setError('Tax ID is required');
      return false;
    }
    if (!formData.contactPerson.trim()) {
      setError('Contact person name is required');
      return false;
    }
    return true;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await companyService.registerCompany(formData);
      
      if (result.success) {
        setStep('documents');
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('An error occurred during registration');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDocumentSubmit() {
    setLoading(true);
    setError('');

    try {
      // In a real implementation, upload documents here
      // For now, just proceed to success
      setStep('success');
    } catch (err) {
      setError('Failed to submit documents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setDocuments(prev => [...prev, ...Array.from(files)]);
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50">
      {/* Header */}
      <div className="border-b bg-background sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Building2 className="h-6 w-6 text-primary" />
            LogisticPRO
          </Link>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
            Already registered? Log in
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress Indicator */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div className={`flex flex-col items-center ${step === 'form' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                step === 'form' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                1
              </div>
              <span className="text-sm font-medium">Company Details</span>
            </div>
            <div className="flex-1 h-1 mx-4 mb-8" style={{
              background: step !== 'form' ? 'var(--color-primary)' : 'var(--color-muted)',
              opacity: 0.3
            }} />
            <div className={`flex flex-col items-center ${step === 'documents' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                step === 'documents' || step === 'success' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step === 'success' ? <CheckCircle className="h-5 w-5" /> : '2'}
              </div>
              <span className="text-sm font-medium">Documents</span>
            </div>
            <div className="flex-1 h-1 mx-4 mb-8" style={{
              background: step === 'success' ? 'var(--color-primary)' : 'var(--color-muted)',
              opacity: 0.3
            }} />
            <div className={`flex flex-col items-center ${step === 'success' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                step === 'success' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              }`}>
                {step === 'success' ? <CheckCircle className="h-5 w-5" /> : '3'}
              </div>
              <span className="text-sm font-medium">Complete</span>
            </div>
          </div>
        </div>

        {/* Form Step */}
        {step === 'form' && (
          <Card>
            <CardHeader>
              <CardTitle>Company Registration</CardTitle>
              <CardDescription>
                Register your logistics company on LogisticPRO platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="flex gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                {/* Company Information */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Company Information</h3>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Company Name *</Label>
                      <Input
                        id="name"
                        placeholder="Enter company name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="businessType">Business Type *</Label>
                      <Select value={formData.businessType} onValueChange={(value) => handleInputChange('businessType', value)}>
                        <SelectTrigger id="businessType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {BUSINESS_TYPES.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="company@example.com"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        placeholder="+91 XXXXX XXXXX"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="taxId">Tax ID *</Label>
                      <Input
                        id="taxId"
                        placeholder="Enter tax ID"
                        value={formData.taxId}
                        onChange={(e) => handleInputChange('taxId', e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        placeholder="https://example.com"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-4 border-t pt-6">
                  <h3 className="font-semibold text-lg">Registered Address</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address *</Label>
                    <Input
                      id="address"
                      placeholder="Street address"
                      value={formData.registeredAddress}
                      onChange={(e) => handleInputChange('registeredAddress', e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="City"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        placeholder="State"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        placeholder="Postal code"
                        value={formData.pincode}
                        onChange={(e) => handleInputChange('pincode', e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="country">Country *</Label>
                      <Input
                        id="country"
                        placeholder="Country"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Person */}
                <div className="space-y-4 border-t pt-6">
                  <h3 className="font-semibold text-lg">Contact Person</h3>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Name *</Label>
                      <Input
                        id="contactPerson"
                        placeholder="Contact person name"
                        value={formData.contactPerson}
                        onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                        disabled={loading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Phone *</Label>
                      <Input
                        id="contactPhone"
                        placeholder="+91 XXXXX XXXXX"
                        value={formData.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>

                {/* Plan Selection */}
                <div className="space-y-4 border-t pt-6">
                  <h3 className="font-semibold text-lg">Subscription Plan</h3>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {PLANS.map(plan => (
                      <button
                        key={plan}
                        type="button"
                        onClick={() => handleInputChange('plan', plan)}
                        className={`p-4 rounded-lg border-2 transition-colors text-left ${
                          formData.plan === plan
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        <div className="font-semibold">{plan}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {plan === 'Starter' && '2 orgs, 10 agents'}
                          {plan === 'Professional' && '5 orgs, 50 agents'}
                          {plan === 'Enterprise' && 'Unlimited'}
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {BILLING_CYCLES.map(cycle => (
                      <button
                        key={cycle}
                        type="button"
                        onClick={() => handleInputChange('billingCycle', cycle)}
                        className={`p-3 rounded-lg border-2 transition-colors ${
                          formData.billingCycle === cycle
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-primary/50'
                        }`}
                      >
                        {cycle}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-6">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Continue to Documents
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Documents Step */}
        {step === 'documents' && (
          <Card>
            <CardHeader>
              <CardTitle>Submit Documents</CardTitle>
              <CardDescription>
                Upload required registration documents for verification
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Required documents:</strong> Business registration certificate, Tax ID proof, Company address proof
                  </p>
                </div>

                {/* Document Upload */}
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    className="w-full border-2 border-dashed rounded-lg p-8 hover:border-primary hover:bg-primary/5 transition-colors text-center disabled:opacity-50"
                  >
                    <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="font-medium">Click to upload documents</p>
                    <p className="text-sm text-muted-foreground">or drag and drop</p>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    disabled={loading}
                  />
                </div>

                {/* Uploaded Documents */}
                {documents.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium">Uploaded Documents ({documents.length})</h4>
                    <div className="space-y-2">
                      {documents.map((doc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{doc.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDocument(idx)}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep('form')}
                    disabled={loading}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleDocumentSubmit}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Application
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success Step */}
        {step === 'success' && (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Registration Submitted!</h2>
              <p className="text-muted-foreground mb-6">
                Your company registration has been submitted successfully. Our admin team will review your application within 2-3 business days.
              </p>
              
              <div className="bg-muted p-6 rounded-lg mb-6 text-left space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Company Name</p>
                  <p className="font-semibold">{formData.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Submission Status</p>
                  <p className="font-semibold">Pending Approval</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{formData.email}</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-6">
                You'll receive an email notification once your application is reviewed. Check your email regularly for updates.
              </p>

              <Button onClick={() => router.push('/login')} className="w-full">
                Go to Login Page
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
