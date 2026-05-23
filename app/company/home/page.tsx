'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { mockHomeFeatures } from '@/data/mockCompanyTypeData';
import { useFeatureFlags } from '@/hooks/use-accessible-menus';
import { COMPANY_OPERATIONAL_TYPE_MAP } from '@/types/company-operational-types';
import { useRouter } from 'next/navigation';
import {
  ClipboardList, Map, ClipboardCheck, Network, Calendar,
  BarChart3, FileText, Leaf, Sparkles, ArrowRight,
} from 'lucide-react';

const iconMap: Record<string, React.FC<React.SVGProps<SVGSVGElement>>> = {
  ClipboardList, Map, ClipboardCheck, Network, Calendar,
  BarChart3, FileText, Leaf,
};

const statusStyles: Record<string, string> = {
  Active: 'bg-success/10 text-success border border-success/20',
  New: 'bg-primary/10 text-primary border border-primary/20',
  'Coming Soon': 'bg-muted/60 text-muted-foreground border border-border/50',
};

const statusDots: Record<string, string> = {
  Active: 'bg-success',
  New: 'bg-primary',
  'Coming Soon': 'bg-muted-foreground',
};

export default function CompanyTypeHomePage() {
  const router = useRouter();
  const { companyType } = useFeatureFlags();
  const meta = COMPANY_OPERATIONAL_TYPE_MAP[companyType];

  return (
    <PageWrapper
      title={`${meta?.label ?? 'Standard'} Dashboard`}
      description="Welcome to your company type operational hub"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-card border border-border/60 rounded-xl p-6 shadow-soft">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-[1rem] font-bold font-display text-foreground">{meta?.label ?? 'Standard'} Module</h3>
              <p className="text-[0.78rem] text-muted-foreground">{meta?.description ?? 'General logistics operations'}</p>
            </div>
          </div>
          <p className="text-[0.84rem] text-muted-foreground leading-relaxed">
            Your company is configured as a <strong className="text-foreground">{meta?.label ?? 'Standard'}</strong>.
            Explore the new operational modules available to you below.
          </p>
        </div>

        <div className="bg-card border border-border/60 rounded-xl p-6 shadow-soft">
          <h3 className="text-[0.94rem] font-bold font-display text-foreground mb-4">Quick Stats</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-[1.5rem] font-bold text-primary font-display">8</p>
              <p className="text-[0.72rem] text-muted-foreground">Active Modules</p>
            </div>
            <div className="text-center">
              <p className="text-[1.5rem] font-bold text-success font-display">6</p>
              <p className="text-[0.72rem] text-muted-foreground">New Features</p>
            </div>
            <div className="text-center">
              <p className="text-[1.5rem] font-bold text-amber-400 font-display">2</p>
              <p className="text-[0.72rem] text-muted-foreground">Coming Soon</p>
            </div>
          </div>
        </div>
      </div>

      <h3 className="text-[0.94rem] font-bold font-display text-foreground mb-4">Available Modules & Features</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {mockHomeFeatures.map((feature) => {
          const Icon = iconMap[feature.icon];
          return (
            <button
              key={feature.id}
              onClick={() => feature.href !== '#' && router.push(feature.href)}
              disabled={feature.href === '#'}
              className="group bg-card border border-border/60 rounded-xl p-5 text-left shadow-soft hover:shadow-md hover:border-primary/30 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                  {Icon && <Icon className="w-4.5 h-4.5 text-primary" />}
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.65rem] font-bold ${statusStyles[feature.status]}`}>
                  <span className={`w-1 h-1 rounded-full ${statusDots[feature.status]}`} />
                  {feature.status}
                </span>
              </div>
              <h4 className="text-[0.84rem] font-bold text-foreground mb-1">{feature.title}</h4>
              <p className="text-[0.72rem] text-muted-foreground leading-relaxed">{feature.description}</p>
              {feature.href !== '#' && (
                <div className="mt-3 flex items-center gap-1 text-[0.72rem] font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  Explore <ArrowRight size={12} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </PageWrapper>
  );
}
