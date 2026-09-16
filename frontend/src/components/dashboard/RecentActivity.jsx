import { Activity } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { mockActivity } from '../../mock/activity';
import { Button } from '../ui/Button';

export default function RecentActivity() {
  return (
    <Card variant="compact">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2"><Activity size={18} className="text-primary" /> Recent Activity</CardTitle>
        <Button variant="ghost" size="sm">View All</Button>
      </CardHeader>
      <CardContent>
        <div className="relative border-l border-border/60 ml-3 space-y-6">
          {mockActivity.map((activity) => (
            <div key={activity.id} className="relative pl-6 group cursor-default">
              <span className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full ring-4 ring-surface bg-slate-200 group-hover:bg-primary transition-colors duration-300 group-hover:scale-125" />
              <div className="group-hover:-translate-y-0.5 transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]">
                <p className="text-sm text-text font-medium leading-snug group-hover:text-primary transition-colors duration-200">
                  {activity.action} <span className="font-semibold text-text group-hover:text-primary transition-colors duration-200">{activity.target}</span>
                </p>
                <div className="text-xs text-text-secondary mt-1 font-medium">{activity.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
