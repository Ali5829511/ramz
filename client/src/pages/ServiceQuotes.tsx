import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

const ServiceQuotes : React.FC = () => {
  return (
    <DashboardLayout>
      <PageHeader title="服务报价" description="管理服务报价" />
      <div className="p-6">
        {/* Content goes here */}
      </div>
    </DashboardLayout>
  );
};

export default ServiceQuotes;
