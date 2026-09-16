import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { mockAnalytics } from '../../mock/analytics';
import { ArrowRight, TrendingUp } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { cn } from '../../lib/utils';

export function ActivityChart() {
  return (
    <Card variant="featured" className="h-full overflow-hidden flex flex-col">
      <CardHeader className="border-b border-slate-100 bg-slate-50/30 pb-4">
        <CardTitle className="text-text font-semibold flex items-center gap-2">
          <TrendingUp size={18} className="text-primary" /> Learning Activity
        </CardTitle>
      </CardHeader>
      
      <div className="flex flex-col md:flex-row flex-1">
        {/* 70% Chart Area */}
        <div className="w-full md:w-[70%] p-6">
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockAnalytics.weeklyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                  itemStyle={{ color: '#0F172A', fontWeight: 600 }}
                  cursor={{ stroke: '#4F46E5', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="hours" stroke="#4F46E5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHours)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 30% Insights Panel */}
        <div className="w-full md:w-[30%] bg-slate-50/50 p-6 border-t md:border-t-0 md:border-l border-slate-100 flex flex-col">
          <h3 className="text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-6">Activity Insights</h3>
          
          <div className="space-y-6 flex-1">
            <div>
              <p className="text-xs text-text-secondary font-medium mb-1">Learning Pace</p>
              <div className="flex items-end gap-2">
                <span className="text-xl font-bold text-emerald-600">↑ 18%</span>
                <span className="text-[11px] text-text-secondary mb-1">vs last week</span>
              </div>
            </div>
            
            <div>
              <p className="text-xs text-text-secondary font-medium mb-1">Most Active Day</p>
              <div className="text-lg font-bold text-text">Wednesday</div>
            </div>

            <div>
              <p className="text-xs text-text-secondary font-medium mb-1">Recommendation</p>
              <p className="text-sm text-text font-medium leading-snug">
                Complete <span className="font-semibold text-primary">Security Awareness</span> this week to maintain your momentum.
              </p>
            </div>
          </div>
          
          <button className="mt-6 text-sm font-semibold text-primary hover:text-primary-hover flex items-center transition-colors">
            View Full Report <ArrowRight size={14} className="ml-1.5" />
          </button>
        </div>
      </div>
    </Card>
  );
}

export function DistributionChart() {
  return (
    <Card variant="featured" className="h-full">
      <CardHeader className="border-b border-slate-100 bg-slate-50/30 pb-4">
        <CardTitle className="text-text font-semibold">Course Completion</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockAnalytics.courseCompletion} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12, fontWeight: 500 }} />
              <Tooltip 
                cursor={{ fill: '#F1F5F9' }}
                contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E2E8F0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                itemStyle={{ color: '#0F172A', fontWeight: 600 }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
