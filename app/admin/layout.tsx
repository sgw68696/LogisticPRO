import { SuperAdminSidebar } from '@/components/layout/SuperAdminSidebar';
import { Navbar } from '@/components/layout/Navbar';

export const metadata = {
  title: 'SuperAdmin Dashboard | LogisticsPro',
  description: 'SuperAdmin control panel for LogisticsPro platform',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#050d1a]">
      <SuperAdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
