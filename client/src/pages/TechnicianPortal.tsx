import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

const TechnicianPortal : React.FC = () => {
  return (
    <DashboardLayout>
      <PageHeader title="技术员门户" description="技术员管理平台" />
      <div className="p-6">
        {/* Content goes here */}
      </div>
    </DashboardLayout>
  );
};

export default TechnicianPortal;
