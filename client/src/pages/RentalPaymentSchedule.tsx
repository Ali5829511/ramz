import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

const RentalPaymentSchedule : React.FC = () => {
  return (
    <DashboardLayout>
      <PageHeader title="租赁付款计划" description="管理租赁付款时间表" />
      <div className="p-6">
        {/* Content goes here */}
      </div>
    </DashboardLayout>
  );
};

export default RentalPaymentSchedule;
