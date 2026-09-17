import { BookOpen, CheckCircle2, Clock, Target, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { cn } from '../../lib/utils';
import { mockAnalytics } from '../../mock/analytics';

const LargeStatCard = ({ title, value, icon: Icon, trend, trendValue, colorClass, subtitle }) => (
  <Card className="col-span-1 lg:col-span-2 group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 border border-slate-200/40 flex flex-col h-full">
    <CardContent className="p-6 flex-1 flex flex-col relative z-10">
      <div className="flex justify-between items-start mb-6">
        <div className={cn("text-text-secondary transition-transform duration-300 group-hover:scale-110 group-hover:text-primary")}>
          <Icon size={24} strokeWidth={1.5} />
        </div>
        {trend && (
          <span className={cn(
            "text-xs font-bold px-2 py-1 rounded",
            trend === 'up' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}>
            {trend === 'up' ? '+' : '-'}{trendValue}% this month
          </span>
        )}
      </div>
      
      <div className="mt-auto">
        <div className="text-4xl font-extrabold text-text tracking-tight mb-1">{value}</div>
        <h4 className="text-text font-medium mb-1">{title}</h4>
        <p className="text-xs text-text-secondary">{subtitle}</p>
      </div>

      <div className="absolute bottom-6 right-6 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
        <span className="text-sm font-semibold text-primary flex items-center">
          View details <ArrowRight size={14} className="ml-1" />
        </span>
      </div>
    </CardContent>
  </Card>
);

const SmallStatCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
  <Card className="col-span-1 group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/30 border border-slate-200/40 bg-slate-50/50 hover:bg-white flex flex-col h-full">
    <CardContent className="p-6 flex-1 flex flex-col relative z-10">
      <div className="mb-4">
        <div className={cn("text-text-secondary transition-transform duration-300 group-hover:scale-110 group-hover:text-primary")}>
          <Icon size={20} strokeWidth={1.5} />
        </div>
      </div>
      
      <div className="mt-auto relative z-10">
        <div className="text-3xl font-extrabold text-text tracking-tight mb-1">{value}</div>
        <h4 className="text-sm text-text font-medium mb-0.5">{title}</h4>
        <p className="text-[11px] text-text-secondary">{subtitle}</p>
      </div>

      <div className="absolute bottom-6 right-6 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
        <span className="text-sm font-semibold text-primary flex items-center">
          View <ArrowRight size={14} className="ml-1" />
        </span>
      </div>
    </CardContent>
  </Card>
);

export default function KPICards({ trainings = [] }) {
  const total = trainings.length;
  const completed = trainings.filter(t => t.status === 'Completed').length;
  const inProgress = trainings.filter(t => t.status === 'InProgress').length;
  const overdue = trainings.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <LargeStatCard
        title="Assigned Courses"
        value={total}
        icon={BookOpen}
        trend="up"
        trendValue={12}
        subtitle="You are ahead of 82% of your department"
      />
      <SmallStatCard title="Completed" value={completed} icon={CheckCircle2} subtitle="This month" />
      <SmallStatCard title="In Progress" value={inProgress} icon={Clock} subtitle="Keep going" />
      <SmallStatCard title="Overdue" value={overdue} icon={Target} subtitle="Needs attention" />
    </div>
  );
}

