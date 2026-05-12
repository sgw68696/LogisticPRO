'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { Check, Plus, Pencil, Trash2, Star, Zap, Building2 } from 'lucide-react';

const PLANS = [
  {
    id: 1,
    name: 'Starter',
    price: '₹4,999',
    period: '/month',
    description: 'Perfect for small logistics teams getting started.',
    icon: Zap,
    highlight: false,
    color: {
      icon:   'text-sky-400',
      bg:     'bg-sky-500/10 border-sky-500/20',
      price:  'text-sky-400',
      badge:  'bg-sky-500/10 text-sky-400 border-sky-500/20',
    },
    features: [
      'Up to 5 users',
      '500 shipments/month',
      'Basic analytics',
      'Email support',
      '1 organization',
    ],
    limits: { orgs: 1, agents: 5 },
  },
  {
    id: 2,
    name: 'Professional',
    price: '₹14,999',
    period: '/month',
    description: 'For growing teams needing advanced tools and integrations.',
    icon: Star,
    highlight: true,
    color: {
      icon:   'text-primary',
      bg:     'bg-primary/10 border-primary/20',
      price:  'text-primary',
      badge:  'bg-primary/10 text-primary border-primary/20',
    },
    features: [
      'Up to 50 users',
      '5,000 shipments/month',
      'Advanced analytics',
      'Priority support',
      'API access',
      '5 organizations',
    ],
    limits: { orgs: 5, agents: 50 },
  },
  {
    id: 3,
    name: 'Enterprise',
    price: 'Custom',
    period: ' pricing',
    description: 'Full-scale solution with custom integrations and SLA guarantees.',
    icon: Building2,
    highlight: false,
    color: {
      icon:   'text-violet-400',
      bg:     'bg-violet-500/10 border-violet-500/20',
      price:  'text-violet-400',
      badge:  'bg-violet-500/10 text-violet-400 border-violet-500/20',
    },
    features: [
      'Unlimited users',
      'Unlimited shipments',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
      'Unlimited organizations',
    ],
    limits: { orgs: Infinity, agents: Infinity },
  },
];

export default function SubscriptionPlansPage() {
  return (
    <PageWrapper
      title="Subscription Plans"
      description="Manage subscription tiers and pricing"
      actions={
        <button
          className="
            flex items-center gap-2 px-3.5 py-2
            rounded-[10px] cursor-pointer
            text-[0.82rem] font-bold text-white font-display
            transition-all duration-200
            hover:-translate-y-px
            hover:shadow-[0_6px_20px_oklch(var(--primary)/0.35)]
          "
          style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
        >
          <Plus size={14} />
          New Plan
        </button>
      }
    >

      {/* ── Plans Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.id}
              className={`
                group relative flex flex-col
                bg-card border rounded-xl p-6 shadow-soft
                transition-all duration-300
                hover:-translate-y-1
                ${plan.highlight
                  ? 'border-primary/40 shadow-[0_4px_24px_oklch(var(--primary)/0.12)] hover:shadow-[0_12px_40px_oklch(var(--primary)/0.18)]'
                  : 'border-border/60 hover:border-primary/25 hover:shadow-[0_8px_32px_oklch(var(--primary)/0.08)]'
                }
              `}
            >

              {/* Popular badge — only on highlighted plan */}
              {plan.highlight && (
                <div className="
                  absolute -top-3 left-1/2 -translate-x-1/2
                  px-3 py-0.5 rounded-full
                  text-[0.68rem] font-bold text-white
                  shadow-[0_4px_12px_oklch(var(--primary)/0.4)]
                "
                  style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}
                >
                  ★ Most Popular
                </div>
              )}

              {/* ── Card Header ── */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className={`
                    w-10 h-10 rounded-xl flex-shrink-0
                    border flex items-center justify-center
                    ${plan.color.bg}
                  `}>
                    <Icon className={`w-5 h-5 ${plan.color.icon}`} />
                  </div>
                  <div>
                    <h3 className="text-[0.92rem] font-bold font-display text-foreground">
                      {plan.name}
                    </h3>
                    <span className={`
                      inline-flex items-center px-2 py-0.5 rounded-full mt-0.5
                      text-[0.65rem] font-bold border
                      ${plan.color.badge}
                    `}>
                      {plan.limits.orgs === Infinity ? 'Unlimited orgs' : `${plan.limits.orgs} org${plan.limits.orgs !== 1 ? 's' : ''}`}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="
                  flex items-center gap-0.5
                  opacity-0 group-hover:opacity-100
                  transition-opacity duration-200
                ">
                  <button className="
                    w-7 h-7 flex items-center justify-center rounded-lg
                    text-muted-foreground
                    hover:bg-sky-500/10 hover:text-sky-400
                    transition-colors duration-150
                  ">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button className="
                    w-7 h-7 flex items-center justify-center rounded-lg
                    text-muted-foreground
                    hover:bg-destructive/10 hover:text-destructive
                    transition-colors duration-150
                  ">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* ── Pricing ── */}
              <div className="mb-2">
                <div className="flex items-baseline gap-1">
                  <span className={`text-3xl font-bold font-display ${plan.color.price}`}>
                    {plan.price}
                  </span>
                  <span className="text-[0.78rem] text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
                <p className="text-[0.75rem] text-muted-foreground mt-1 leading-relaxed">
                  {plan.description}
                </p>
              </div>

              {/* ── Divider ── */}
              <div className="border-t border-border/40 my-4" />

              {/* ── Features ── */}
              <ul className="space-y-2.5 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <div className="
                      w-4 h-4 rounded-full flex-shrink-0
                      bg-success/15 border border-success/25
                      flex items-center justify-center
                    ">
                      <Check className="w-2.5 h-2.5 text-success" strokeWidth={3} />
                    </div>
                    <span className="text-[0.78rem] text-muted-foreground">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* ── Footer ── */}
              <div className="mt-5 pt-4 border-t border-border/40">
                <button
                  className="
                    w-full py-2 rounded-[9px]
                    text-[0.78rem] font-bold
                    border transition-all duration-200
                    hover:-translate-y-px
                  "
                  style={plan.highlight ? {
                    background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                    color: '#fff',
                    border: 'none',
                    boxShadow: '0 4px 16px oklch(var(--primary)/0.3)',
                  } : {}}
                  {...(!plan.highlight ? {
                    className: `
                      w-full py-2 rounded-[9px]
                      text-[0.78rem] font-bold
                      border border-border/60
                      bg-muted/30 text-muted-foreground
                      hover:bg-primary/8 hover:border-primary/30 hover:text-foreground
                      transition-all duration-200 hover:-translate-y-px
                    `
                  } : {})}
                >
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Assign to Company'}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </PageWrapper>
  );
}