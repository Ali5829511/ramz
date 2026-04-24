import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

const MaintenanceSplitwise : React.FC = () => {
  return (
    <DashboardLayout>
      <PageHeader title="维护费用分摊" description="维护费用分摊管理" />
      <div className="p-6">
        {/* Content goes here */}
      </div>
    </DashboardLayout>
  );
};

export default MaintenanceSplitwise;
