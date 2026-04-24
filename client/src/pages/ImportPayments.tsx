import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

const ImportPayments : React.FC = () => {
  return (
    <DashboardLayout>
      <PageHeader title="导入付款" description="导入付款数据" />
      <div className="p-6">
        {/* Content goes here */}
      </div>
    </DashboardLayout>
  );
};

export default ImportPayments;
