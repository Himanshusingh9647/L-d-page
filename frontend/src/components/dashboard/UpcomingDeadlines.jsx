import { Calendar, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

export default function UpcomingDeadlines({ trainings = [] }) {
  const navigate = useNavigate();

  // Get up to 3 upcoming trainings that are not completed
  const deadlines = trainings
    .filter(t => t.status !== 'Completed' && t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

  if (deadlines.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Calendar size={18} className="text-primary" /> Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-6 text-center text-text-secondary text-sm">No upcoming deadlines.</div>
        </CardContent>
      </Card>
    );
  }

  const getUrgency = (date) => {
    const days = (new Date(date) - new Date()) / 86400000;
    if (days < 0) return { label: 'Overdue', color: 'bg-danger text-white' };
    if (days <= 3) return { label: 'Due Soon', color: 'bg-warning text-warning-foreground' };
    return { label: 'Upcoming', color: 'bg-slate-100 text-text-secondary' };
  };

  return (
    <Card variant="compact">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><Calendar size={18} className="text-primary" /> Upcoming Deadlines</CardTitle>
        <Button variant="ghost" size="sm">View All</Button>
      </CardHeader>
      <CardContent>
        <div className="relative border-l border-border/60 ml-3 space-y-6">
          {deadlines.map((t) => {
            const urgency = getUrgency(t.dueDate);
            return (
              <div 
                key={t.moduleId} 
                className="relative pl-6 group cursor-pointer"
                onClick={() => navigate(`/training/${t.moduleId}`)}
              >
                {/* Timeline Dot */}
                <span className={cn(
                  "absolute -left-1.5 top-1.5 w-3 h-3 rounded-full ring-4 ring-surface transition-transform duration-300 group-hover:scale-125",
                  urgency.color.includes('danger') ? 'bg-danger' : 
                  urgency.color.includes('warning') ? 'bg-amber-500' : 'bg-slate-300 group-hover:bg-primary'
                )} />
                
                <div className="group-hover:-translate-y-0.5 transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]">
                  <div className="flex items-start justify-between gap-4 mb-1">
                    <h4 className="text-sm font-semibold text-text group-hover:text-primary transition-colors duration-200 line-clamp-1">{t.moduleTitle}</h4>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap", urgency.color)}>
                      {urgency.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                    <Clock size={12} className="group-hover:text-primary transition-colors duration-200" />
                    <span>{new Date(t.dueDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
