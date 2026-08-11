import { Outlet } from 'react-router-dom';
import { DashboardSidebar, DashboardMobileTabs } from './DashboardSidebar';
import { EmailVerificationBanner } from './EmailVerificationBanner';

export function DashboardLayout() {
  return (
    <div className="container-page py-8">
      <EmailVerificationBanner />
      <div className="flex flex-col gap-8 lg:flex-row">
        <DashboardSidebar />
        <div className="min-w-0 flex-1">
          <DashboardMobileTabs />
          <Outlet />
        </div>
      </div>
    </div>
  );
}
