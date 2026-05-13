import React from 'react';
import { UserRole } from '@/data/mockData';
import { cn } from '@/lib/utils';
import {
  Crown, Briefcase, Users, PackageCheck, Zap,
  User, UserCog, Ship, FileCheck2, ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'subtle';
}

const roleConfig: Record<UserRole, { color: string; bgColor: string; icon: LucideIcon; label: string }> = {
  SuperAdmin: { color: 'text-purple-400', bgColor: 'bg-purple-500/10', icon: Crown, label: 'Super Admin' },
  CompanyAdmin: { color: 'text-blue-400', bgColor: 'bg-blue-500/10', icon: Briefcase, label: 'Company Admin' },
  Manager: { color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', icon: Users, label: 'Manager' },
  Dispatcher: { color: 'text-orange-400', bgColor: 'bg-orange-500/10', icon: PackageCheck, label: 'Dispatcher' },
  Agent: { color: 'text-sky-400', bgColor: 'bg-sky-500/10', icon: User, label: 'Agent' },
  Operator: { color: 'text-emerald-400', bgColor: 'bg-emerald-500/10', icon: Zap, label: 'Operator' },
  Staff: { color: 'text-slate-400', bgColor: 'bg-slate-500/10', icon: UserCog, label: 'Staff' },
  CustomsAgent: { color: 'text-indigo-400', bgColor: 'bg-indigo-500/10', icon: FileCheck2, label: 'Customs Agent' },
  PortAgent: { color: 'text-cyan-400', bgColor: 'bg-cyan-500/10', icon: Ship, label: 'Port Agent' },
  CustomerPortal: { color: 'text-green-400', bgColor: 'bg-green-500/10', icon: User, label: 'Customer Portal' },
  AuditorReadOnly: { color: 'text-zinc-400', bgColor: 'bg-zinc-500/10', icon: ShieldCheck, label: 'Auditor Read Only' },
};

export function RoleBadge({ role, size = 'md', variant = 'default' }: RoleBadgeProps) {
  const config = roleConfig[role];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const variantClasses = {
    default: cn('rounded-full font-medium flex items-center gap-2', config.bgColor, config.color),
    outline: cn('rounded-full font-medium flex items-center gap-2 border', `border-${config.color.split('-')[1]}-500/30`),
    subtle: cn('rounded-md font-medium flex items-center gap-1', config.bgColor, config.color),
  };

  return (
    <div className={cn(variantClasses[variant], sizeClasses[size])}>
      <Icon className={cn('w-4 h-4', size === 'sm' && 'w-3 h-3')} />
      <span>{config.label}</span>
    </div>
  );
}
