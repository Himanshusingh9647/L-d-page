import { PlayCircle, FileText, Clock, CheckCircle2, Bookmark } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';

export default function AssignedCourses({ trainings = [] }) {
  const navigate = useNavigate();
  
  if (trainings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <h3 className="text-lg font-semibold text-text mb-1">All caught up!</h3>
          <p className="text-text-secondary text-sm">You have no pending training assignments.</p>
        </CardContent>
      </Card>
    );
  }

  // Helper logic
  const isOverdue = (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed';

  const getStatusBadge = (training) => {
    if (isOverdue(training)) return <Badge variant="danger">Overdue</Badge>;
    if (training.status === 'Completed') return <Badge variant="success">Completed</Badge>;
    if (training.status === 'InProgress') return <Badge variant="warning">In Progress</Badge>;
    return <Badge variant="default">Not Started</Badge>;
  };

  return (
    <Card variant="featured">
      <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 bg-slate-50/30 pb-4">
        <CardTitle className="text-text font-semibold">Assigned Courses</CardTitle>
        <Button variant="ghost" size="sm" className="font-medium text-text-secondary">Manage Assignments</Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-[11px] text-text-secondary bg-slate-50/80 uppercase tracking-wider border-y border-border">
              <tr>
                <th className="px-6 py-3 font-semibold w-1/2">Course</th>
                <th className="px-6 py-3 font-semibold w-1/4">Progress</th>
                <th className="px-6 py-3 font-semibold hidden lg:table-cell">Deadline</th>
                <th className="px-6 py-3 font-semibold text-right w-32">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {trainings.map((training) => (
                <tr 
                  key={training.moduleId} 
                  className="group relative hover:bg-slate-50/80 transition-colors duration-200 cursor-pointer"
                  onClick={() => navigate(`/training/${training.moduleId}`)}
                >
                  <td className="px-6 py-4 relative">
                    {/* Hover Accent Bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary scale-y-0 group-hover:scale-y-100 transition-transform duration-200 ease-in-out origin-center rounded-r" />

                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center shrink-0 text-primary overflow-hidden relative">
                        <div className="absolute inset-0 bg-primary/5 scale-100 group-hover:scale-110 transition-transform duration-300" />
                        {training.moduleType === 'Video' ? <PlayCircle size={24} className="group-hover:scale-110 transition-transform duration-200" /> : <FileText size={24} className="group-hover:scale-110 transition-transform duration-200" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-text line-clamp-1 group-hover:text-primary transition-colors duration-200">{training.moduleTitle}</div>
                        <div className="text-[13px] text-text-secondary mt-0.5 line-clamp-1">{training.moduleDescription}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4">
                    {training.status === 'InProgress' && training.moduleType === 'Video' ? (
                      <div className="space-y-1.5 w-40">
                        <div className="flex justify-between text-[11px] font-medium text-text-secondary">
                          <span>Progress</span>
                          <span className="text-text group-hover:text-primary transition-colors duration-200">{Math.round(training.videoWatchedPercent)}%</span>
                        </div>
                        <ProgressBar value={training.videoWatchedPercent} indicatorClassName="bg-primary group-hover:bg-primary-hover transition-colors" />
                      </div>
                    ) : (
                      <span className="text-text-secondary text-[13px]">
                        {training.status === 'Completed' ? '100% Completed' : '0% Started'}
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 hidden lg:table-cell whitespace-nowrap">
                    {training.dueDate ? (
                      <div className="flex items-center gap-1.5 text-text-secondary group-hover:text-text transition-colors duration-200">
                        <Clock size={14} className={cn(isOverdue(training) && "text-danger")} />
                        <span className={cn("text-[13px]", isOverdue(training) && "text-danger font-medium")}>
                          {new Date(training.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    ) : (
                      <span className="text-text-secondary">-</span>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3">
                      {getStatusBadge(training)}
                      
                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button className="p-1.5 text-text-secondary hover:text-text rounded-md transition-colors" onClick={(e) => { e.stopPropagation(); }}>
                          <span className="font-bold tracking-widest leading-none block -mt-1 text-lg">...</span>
                        </button>
                      </div>

                      {/* Primary Action (Ghost to Solid) */}
                      <Button 
                        variant="secondary" 
                        size="sm"
                        className="h-8 min-w-[80px] shadow-none bg-slate-50 text-text-secondary group-hover:bg-primary group-hover:text-white transition-all duration-300"
                        onClick={(e) => { e.stopPropagation(); navigate(`/training/${training.moduleId}`); }}
                      >
                        {training.status === 'Completed' ? 'Review' : training.status === 'InProgress' ? 'Resume' : 'Start'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
