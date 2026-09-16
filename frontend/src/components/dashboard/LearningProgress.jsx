import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Target, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const ProgressBar = ({ label, current, total, colorClass, delay = 0 }) => {
  const [width, setWidth] = useState(0);
  const percentage = Math.round((current / total) * 100);

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(percentage);
    }, delay);
    return () => clearTimeout(timer);
  }, [percentage, delay]);

  return (
    <div className="mb-5 last:mb-0 group cursor-default">
      <div className="flex justify-between items-end mb-2">
        <span className="text-sm font-semibold text-text group-hover:text-primary transition-colors">{label}</span>
        <span className="text-xs text-text-secondary font-medium"><span className="text-text font-bold">{current}</span> / {total}</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] ${colorClass}`}
          style={{ width: `${width}%` }} 
        />
      </div>
    </div>
  );
};

export default function LearningProgress() {
  return (
    <Card variant="featured" className="h-full flex flex-col">
      <CardHeader className="border-b border-slate-100 bg-slate-50/30 pb-4">
        <CardTitle className="text-text font-semibold flex items-center gap-2">
          <Target size={18} className="text-primary" /> Monthly Goals
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6 flex flex-col flex-1">
        {/* Primary Content */}
        <div className="flex-1">
          <div className="mb-8">
            <h4 className="text-3xl font-extrabold text-text tracking-tight mb-1">68%</h4>
            <p className="text-[13px] text-text-secondary font-medium">Overall Completion</p>
          </div>

          <div className="space-y-2">
            <ProgressBar label="Courses" current={4} total={6} colorClass="bg-blue-600" delay={100} />
            <ProgressBar label="Hours" current={12} total={20} colorClass="bg-indigo-500" delay={300} />
            <ProgressBar label="Quizzes" current={8} total={10} colorClass="bg-emerald-500" delay={500} />
          </div>
        </div>

        {/* Supporting Insight */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-[13px] text-text-secondary font-medium leading-relaxed mb-4">
            You're <span className="font-semibold text-text">ahead of schedule</span>. Complete 2 more courses to hit your September target.
          </p>
          
          {/* Action */}
          <button className="text-sm font-semibold text-primary hover:text-primary-hover flex items-center transition-colors">
            View Goal Details <ArrowRight size={14} className="ml-1.5" />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
