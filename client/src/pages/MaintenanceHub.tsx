import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

const MaintenanceHub : React.FC = () => {
  return (
    <DashboardLayout>
      <PageHeader title="维护中心" description="维护任务管理" />
      <div className="p-6">
        {/* Content goes here */}
      </div>
    </DashboardLayout>
  );
};

export default MaintenanceHub;
