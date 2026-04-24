import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

const CollectionTracker : React.FC = () => {
  return (
    <DashboardLayout>
      <PageHeader title="收款跟踪器" description="追踪收款进展" />
      <div className="p-6">
        {/* Content goes here */}
      </div>
    </DashboardLayout>
  );
};

export default CollectionTracker;
