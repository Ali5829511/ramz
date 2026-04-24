import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

const ExpensesManager : React.FC = () => {
  return (
    <DashboardLayout>
      <PageHeader title="费用管理器" description="管理运营费用" />
      <div className="p-6">
        {/* Content goes here */}
      </div>
    </DashboardLayout>
  );
};

export default ExpensesManager;
