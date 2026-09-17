import { useState, useEffect } from 'react';
import { assignmentsApi } from '../../api/apiClient';
import { mockAnalytics } from '../../mock/analytics';
import HeroSection from '../../components/dashboard/HeroSection';
import KPICards from '../../components/dashboard/KPICards';
import { DistributionChart } from '../../components/dashboard/ChartsSection';
import AssignedCourses from '../../components/dashboard/AssignedCourses';
import UpcomingDeadlines from '../../components/dashboard/UpcomingDeadlines';
import RecentActivity from '../../components/dashboard/RecentActivity';
import { Skeleton } from '../../components/ui/Skeleton';

export default function EmployeeDashboard() {
  const [trainings, setTrainings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Perceived Performance: Staggered revealing state
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    loadTrainings();
  }, []);

  const loadTrainings = async () => {
    try {
      const response = await assignmentsApi.getMy();
      setTrainings(response.data.data);
    } catch (error) {
      console.error('Error loading trainings:', error);
    } finally {
      setLoading(false);
      // Stagger actual content reveal by a tiny bit to make it feel deliberate
      setTimeout(() => setShowContent(true), 150);
    }
  };

  if (loading || !showContent) return (
    <div className="p-8 space-y-8 animate-pulse">
      <Skeleton className="h-64 w-full rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 -mt-12 relative z-10 px-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-8">
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-80 rounded-xl" />
          <Skeleton className="h-96 rounded-xl" />
        </div>
        <div className="space-y-8">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="pb-20 bg-background min-h-screen">
      {/* Hero anchors the page */}
      <div className="p-6 lg:p-8 max-w-[1440px] mx-auto pb-0">
        <HeroSection trainings={trainings} analytics={mockAnalytics} />
      </div>

      <div className="px-6 lg:px-8 max-w-[1440px] mx-auto">
        {/* KPI Cards overlap the hero */}
        <div className="relative z-10 -mt-8 lg:-mt-10 mb-12">
          <KPICards trainings={trainings} />
        </div>

      </div>

    {/* Subtle Background Change for Tables/Lists */}
    <div className="bg-slate-50/50 border-t border-slate-200/50 py-16">
      <div className="px-6 lg:px-8 max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (Wider) */}
          <div className="lg:col-span-2 space-y-8">
            <AssignedCourses trainings={trainings} />
            
            <div className="mt-8">
              <DistributionChart />
            </div>
          </div>
          
          {/* Right Column (Narrower) */}
          <div className="space-y-8">
            <UpcomingDeadlines trainings={trainings} />
            <RecentActivity />
          </div>

        </div>
      </div>
    </div>
  </div>
  );
}

