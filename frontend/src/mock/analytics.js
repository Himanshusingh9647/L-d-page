// TODO: Replace with analytics API response
export const mockAnalytics = {
  learningStreak: 12,
  hoursLearned: 45.5,
  hoursRemaining: 12.5,
  currentLevel: 'Intermediate',
  recentMilestone: '10 Courses Completed',
  weeklyActivity: [
    { name: 'Mon', hours: 1.5 },
    { name: 'Tue', hours: 2.0 },
    { name: 'Wed', hours: 0.5 },
    { name: 'Thu', hours: 3.0 },
    { name: 'Fri', hours: 1.0 },
    { name: 'Sat', hours: 4.5 },
    { name: 'Sun', hours: 2.5 }
  ],
  courseCompletion: [
    { name: 'Completed', value: 65, fill: 'var(--primary)' },
    { name: 'In Progress', value: 25, fill: 'var(--warning)' },
    { name: 'Not Started', value: 10, fill: 'var(--border)' }
  ],
  sparklines: {
    assigned: [{ value: 10 }, { value: 12 }, { value: 11 }, { value: 14 }, { value: 15 }, { value: 18 }, { value: 20 }],
    completed: [{ value: 2 }, { value: 3 }, { value: 5 }, { value: 8 }, { value: 8 }, { value: 10 }, { value: 12 }],
    hours: [{ value: 4 }, { value: 7 }, { value: 15 }, { value: 22 }, { value: 30 }, { value: 38 }, { value: 45 }],
    streak: [{ value: 5 }, { value: 6 }, { value: 7 }, { value: 8 }, { value: 9 }, { value: 10 }, { value: 12 }]
  }
};

