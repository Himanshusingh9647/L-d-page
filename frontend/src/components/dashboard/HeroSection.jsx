import { ArrowRight, BookOpen, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

export default function HeroSection({ trainings = [], analytics = {} }) {
  // Data-driven insights
  const mandatoryCount = trainings.filter(t => t.isRequired && t.status !== 'Completed').length;
  const inProgressCount = trainings.filter(t => t.status === 'InProgress').length;
  const overdueCount = trainings.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Completed').length;

  const nextUp = trainings
    .filter(t => t.status !== 'Completed' && t.dueDate)
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0];

  const greeting = "Good Morning, Arjun"; // Ideally from user context
  const completionPercent = 68; // Ideally calculated from goals
  
  // Intelligent subtext
  let heroInsight = "You're making great progress.";
  if (overdueCount > 0) {
    heroInsight = `${overdueCount} training${overdueCount > 1 ? 's are' : ' is'} overdue and require${overdueCount > 1 ? '' : 's'} your attention.`;
  } else if (mandatoryCount > 0) {
    heroInsight = `${mandatoryCount} mandatory training${mandatoryCount > 1 ? 's require' : ' requires'} your attention this week.`;
  } else if (inProgressCount > 0) {
    heroInsight = `You have ${inProgressCount} course${inProgressCount > 1 ? 's' : ''} in progress. Let's keep the momentum going.`;
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface border border-slate-200/40 shadow-sm isolate">
      {/* Light, productive background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-50/40 via-background to-background" />

      <div className="px-8 py-10 lg:px-12 lg:py-12 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12">
        
        {/* Left Side: Summary Engine */}
        <div className="max-w-xl">
          <h1 className="text-3xl font-bold text-text tracking-tight mb-3">
            {greeting}
          </h1>
          <p className="text-[15px] text-text-secondary leading-relaxed mb-8">
            {heroInsight} Estimated completion time: <span className="font-semibold text-text">2 hours</span>.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg" className="shadow-none font-semibold">
              Continue Learning <ArrowRight size={16} className="ml-2" />
            </Button>
            <Button variant="secondary" size="lg" className="font-semibold bg-white border-slate-200 hover:bg-slate-50 text-text">
              <BookOpen size={16} className="mr-2 text-text-secondary" /> Browse Library
            </Button>
          </div>
        </div>

        {/* Right Side: Stacked Smart Widgets */}
        <div className="w-full lg:w-[380px] space-y-4 shrink-0">
          
          {/* Widget 1: Next Up */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <h3 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-3">Next Up</h3>
            {nextUp ? (
              <div>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h4 className="text-[15px] font-semibold text-text leading-snug line-clamp-1">{nextUp.moduleTitle}</h4>
                  <span className="text-[11px] font-bold bg-amber-50 text-amber-600 px-2 py-0.5 rounded shrink-0">
                    Due Soon
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-text-secondary font-medium mb-4">
                  <span className="flex items-center gap-1.5"><Clock size={14} /> 35 min</span>
                  <span className="flex items-center gap-1.5">• {new Date(nextUp.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                </div>
                <button className="text-sm font-semibold text-primary hover:text-primary-hover flex items-center transition-colors">
                  Resume <ArrowRight size={14} className="ml-1.5" />
                </button>
              </div>
            ) : (
              <div className="py-4 text-center text-sm text-text-secondary">No upcoming deadlines.</div>
            )}
          </div>

          {/* Widget 2: Monthly Goal */}
          <div className="bg-white rounded-xl p-5 border border-slate-200/50 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider">September Goal</h3>
              <span className="text-xs font-bold text-text">{completionPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${completionPercent}%` }} />
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
