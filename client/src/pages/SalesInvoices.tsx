import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

const SalesInvoices : React.FC = () => {
  return (
    <DashboardLayout>
      <PageHeader title="销售发票" description="销售发票管理" />
      <div className="p-6">
        {/* Content goes here */}
      </div>
    </DashboardLayout>
  );
};

export default SalesInvoices;
