import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

const MaintenancePortal : React.FC = () => {
  return (
    <DashboardLayout>
      <PageHeader title="维护门户" description="维护团队协作平台" />
      <div className="p-6">
        {/* Content goes here */}
      </div>
    </DashboardLayout>
  );
};

export default MaintenancePortal;
