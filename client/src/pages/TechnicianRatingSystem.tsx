import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/shared/PageHeader';

const TechnicianRatingSystem : React.FC = () => {
  return (
    <DashboardLayout>
      <PageHeader title="技术员评分系统" description="评估技术员表现" />
      <div className="p-6">
        {/* Content goes here */}
      </div>
    </DashboardLayout>
  );
};

export default TechnicianRatingSystem;
