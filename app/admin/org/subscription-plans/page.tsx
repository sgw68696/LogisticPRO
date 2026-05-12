'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { Check, Plus } from 'lucide-react';

const plans = [
  { id: 1, name: 'Starter', price: '$99/month', features: ['Up to 5 users', 'Basic analytics', 'Email support'] },
  { id: 2, name: 'Professional', price: '$299/month', features: ['Up to 50 users', 'Advanced analytics', 'Priority support', 'API access'] },
  { id: 3, name: 'Enterprise', price: 'Custom', features: ['Unlimited users', 'Custom integrations', 'Dedicated support', 'SLA guarantee'] },
];

export default function SubscriptionPlansPage() {
  return (
    <PageWrapper title="Subscription Plans" description="Manage subscription tiers and pricing">
      <div className="space-y-6">
        <Button className="gap-2"><Plus className="w-4 h-4" />New Plan</Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="bg-[rgba(255,255,255,0.02)] border border-[rgba(14,165,233,0.1)] rounded-lg p-6">
              <h3 className="font-bold text-[#e0f2fe] mb-2 text-lg">{plan.name}</h3>
              <p className="text-2xl font-bold text-[#7dd3fc] mb-6">{plan.price}</p>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex gap-2 text-sm text-[rgba(148,163,184,0.8)]">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
