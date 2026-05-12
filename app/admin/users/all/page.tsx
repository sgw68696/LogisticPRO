'use client';

import { PageWrapper } from '@/components/layout/PageWrapper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { mockUsers } from '@/data/mockData';
import { Search, Plus, Eye, Edit, Trash2, Badge } from 'lucide-react';

export default function UsersPage() {
  return (
    <PageWrapper title="User Management" description="Manage all platform users">
      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-[rgba(148,163,184,0.5)]" />
            <Input placeholder="Search users..." className="pl-10 bg-[rgba(255,255,255,0.05)] border-[rgba(14,165,233,0.2)]" />
          </div>
          <Button className="gap-2"><Plus className="w-4 h-4" />Add User</Button>
        </div>

        <div className="bg-[rgba(255,255,255,0.02)] border border-[rgba(14,165,233,0.1)] rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[rgba(14,165,233,0.1)] bg-[rgba(14,165,233,0.05)]">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#7dd3fc]">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#7dd3fc]">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#7dd3fc]">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-[#7dd3fc]">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-[#7dd3fc]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {mockUsers.map((user) => (
                  <tr key={user.id} className="border-b border-[rgba(14,165,233,0.05)] hover:bg-[rgba(14,165,233,0.05)]">
                    <td className="px-6 py-4 text-sm text-[#e0f2fe] font-medium">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-[rgba(148,163,184,0.8)]">{user.email}</td>
                    <td className="px-6 py-4 text-sm"><Badge className="bg-blue-500/20 text-blue-400">{user.role}</Badge></td>
                    <td className="px-6 py-4 text-sm"><Badge className={user.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}>{user.status}</Badge></td>
                    <td className="px-6 py-4 text-right flex gap-2 justify-end">
                      <Button size="sm" variant="ghost"><Eye className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost"><Edit className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost"><Trash2 className="w-4 h-4 text-red-400" /></Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
