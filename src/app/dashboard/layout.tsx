import DashboardShell from '@/components/dashboard/DashboardShell';
import { requireDashboardSession } from '@/lib/dashboardAuth';

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await requireDashboardSession();

  return (
    <DashboardShell
      userEmail={session.email}
      userName={session.profile.full_name}
      userHandle={session.profile.username}
      avatarUrl={session.profile.avatar_url}
    >
      {children}
    </DashboardShell>
  );
}
