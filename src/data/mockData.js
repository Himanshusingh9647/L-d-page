// ── Users ──────────────────────────────────────────────────
export const users = [
  { id: 'u1', name: 'Priya Sharma', department: 'Engineering', role: 'employee', initials: 'PS' },
  { id: 'u2', name: 'Rahul Mehta', department: 'Marketing', role: 'employee', initials: 'RM' },
  { id: 'u3', name: 'Ananya Desai', department: 'Human Resources', role: 'employee', initials: 'AD' },
  { id: 'u4', name: 'Vikram Singh', department: 'Finance', role: 'employee', initials: 'VS' },
  { id: 'u5', name: 'Sneha Patel', department: 'Engineering', role: 'employee', initials: 'SP' },
  { id: 'u6', name: 'Arjun Kapoor', department: 'Operations', role: 'admin', initials: 'AK' },
];

// ── Training Modules ──────────────────────────────────────
export const modules = [
  {
    id: 'm1',
    title: 'Workplace Safety Fundamentals',
    type: 'video',
    required: true,
    duration: '12 min',
    description: 'Covers fire safety, emergency exits, ergonomic workstation setup, and first-aid basics.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    posterUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
  },
  {
    id: 'm2',
    title: 'Anti-Harassment Policy',
    type: 'pdf',
    required: true,
    duration: '8 min read',
    description: 'Mandatory reading on the company\'s zero-tolerance harassment policy and reporting procedures.',
  },
  {
    id: 'm3',
    title: 'Data Privacy & GDPR Compliance',
    type: 'video',
    required: true,
    duration: '15 min',
    description: 'Learn how to handle personal data, consent management, and breach notification protocols.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    posterUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
  },
  {
    id: 'm4',
    title: 'Code of Conduct',
    type: 'pdf',
    required: true,
    duration: '10 min read',
    description: 'Company-wide code of conduct covering ethics, conflicts of interest, and professional behavior.',
  },
  {
    id: 'm5',
    title: 'Cybersecurity Awareness',
    type: 'video',
    required: false,
    duration: '10 min',
    description: 'Best practices for phishing prevention, password hygiene, and secure remote work.',
    videoUrl: 'https://ia801602.us.archive.org/11/items/Rick_Astley_Never_Gonna_Give_You_Up/Rick_Astley_Never_Gonna_Give_You_Up.mp4',
    posterUrl: 'https://archive.org/download/Rick_Astley_Never_Gonna_Give_You_Up/Rick_Astley_Never_Gonna_Give_You_Up.thumbs/Rick_Astley_Never_Gonna_Give_You_Up_000030.jpg',
  },
  {
    id: 'm6',
    title: 'Diversity & Inclusion Guidelines',
    type: 'pdf',
    required: false,
    duration: '6 min read',
    description: 'Framework for building an inclusive workplace and understanding unconscious bias.',
  },
  {
    id: 'm7',
    title: 'Emergency Response Training',
    type: 'video',
    required: true,
    duration: '18 min',
    description: 'Protocols for natural disasters, medical emergencies, and evacuation procedures.',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    posterUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
  },
  {
    id: 'm8',
    title: 'IT Acceptable Use Policy',
    type: 'pdf',
    required: true,
    duration: '5 min read',
    description: 'Rules governing the use of company IT resources, software licensing, and network access.',
  },
];

// ── Initial Progress ──────────────────────────────────────
// Pre-populate some progress so dashboards have realistic data
export const initialProgress = [
  // Priya (u1) — mostly done
  { userId: 'u1', moduleId: 'm1', status: 'completed', resumeTime: 0 },
  { userId: 'u1', moduleId: 'm2', status: 'completed', resumeTime: 0 },
  { userId: 'u1', moduleId: 'm3', status: 'completed', resumeTime: 0 },
  { userId: 'u1', moduleId: 'm4', status: 'completed', resumeTime: 0 },
  { userId: 'u1', moduleId: 'm7', status: 'pending', resumeTime: 45 },
  { userId: 'u1', moduleId: 'm8', status: 'pending', resumeTime: 0 },

  // Rahul (u2) — halfway
  { userId: 'u2', moduleId: 'm1', status: 'completed', resumeTime: 0 },
  { userId: 'u2', moduleId: 'm2', status: 'completed', resumeTime: 0 },
  { userId: 'u2', moduleId: 'm3', status: 'pending', resumeTime: 120 },
  { userId: 'u2', moduleId: 'm4', status: 'pending', resumeTime: 0 },

  // Ananya (u3) — completed everything
  { userId: 'u3', moduleId: 'm1', status: 'completed', resumeTime: 0 },
  { userId: 'u3', moduleId: 'm2', status: 'completed', resumeTime: 0 },
  { userId: 'u3', moduleId: 'm3', status: 'completed', resumeTime: 0 },
  { userId: 'u3', moduleId: 'm4', status: 'completed', resumeTime: 0 },
  { userId: 'u3', moduleId: 'm5', status: 'completed', resumeTime: 0 },
  { userId: 'u3', moduleId: 'm6', status: 'completed', resumeTime: 0 },
  { userId: 'u3', moduleId: 'm7', status: 'completed', resumeTime: 0 },
  { userId: 'u3', moduleId: 'm8', status: 'completed', resumeTime: 0 },

  // Vikram (u4) — barely started
  { userId: 'u4', moduleId: 'm1', status: 'pending', resumeTime: 30 },

  // Sneha (u5) — some progress
  { userId: 'u5', moduleId: 'm1', status: 'completed', resumeTime: 0 },
  { userId: 'u5', moduleId: 'm2', status: 'completed', resumeTime: 0 },
  { userId: 'u5', moduleId: 'm3', status: 'pending', resumeTime: 60 },
  { userId: 'u5', moduleId: 'm7', status: 'completed', resumeTime: 0 },
  { userId: 'u5', moduleId: 'm8', status: 'completed', resumeTime: 0 },
];

// ── Initial Assignments ───────────────────────────────────
// Maps userId -> assigned modules with due dates
export const initialAssignments = [
  // Priya (u1)
  { userId: 'u1', moduleId: 'm1', required: true, dueDate: '2026-10-01' },
  { userId: 'u1', moduleId: 'm2', required: true, dueDate: '2026-10-01' },
  { userId: 'u1', moduleId: 'm3', required: true, dueDate: '2026-09-01' }, // Overdue
  { userId: 'u1', moduleId: 'm4', required: true, dueDate: '2026-11-15' },
  { userId: 'u1', moduleId: 'm7', required: true, dueDate: '2026-12-31' },
  { userId: 'u1', moduleId: 'm8', required: true, dueDate: '2026-10-15' },
  
  // Rahul (u2)
  { userId: 'u2', moduleId: 'm1', required: true, dueDate: '2026-10-01' },
  { userId: 'u2', moduleId: 'm2', required: true, dueDate: '2026-10-01' },
  { userId: 'u2', moduleId: 'm3', required: true, dueDate: '2026-09-01' },
  { userId: 'u2', moduleId: 'm4', required: true, dueDate: '2026-11-15' },
  { userId: 'u2', moduleId: 'm5', required: false, dueDate: null }, // Optional assignment

  // Ananya (u3) - Completed all assigned
  { userId: 'u3', moduleId: 'm1', required: true, dueDate: '2026-10-01' },
  { userId: 'u3', moduleId: 'm2', required: true, dueDate: '2026-10-01' },
  { userId: 'u3', moduleId: 'm3', required: true, dueDate: '2026-10-01' },
  { userId: 'u3', moduleId: 'm4', required: true, dueDate: '2026-10-01' },
  { userId: 'u3', moduleId: 'm5', required: true, dueDate: '2026-10-01' },
  { userId: 'u3', moduleId: 'm6', required: true, dueDate: '2026-10-01' },
  { userId: 'u3', moduleId: 'm7', required: true, dueDate: '2026-10-01' },
  { userId: 'u3', moduleId: 'm8', required: true, dueDate: '2026-10-01' },

  // Vikram (u4)
  { userId: 'u4', moduleId: 'm1', required: true, dueDate: '2026-08-15' }, // Overdue
  { userId: 'u4', moduleId: 'm4', required: true, dueDate: '2026-10-01' },

  // Sneha (u5)
  { userId: 'u5', moduleId: 'm1', required: true, dueDate: '2026-10-01' },
  { userId: 'u5', moduleId: 'm2', required: true, dueDate: '2026-10-01' },
  { userId: 'u5', moduleId: 'm3', required: true, dueDate: '2026-10-01' },
  { userId: 'u5', moduleId: 'm7', required: true, dueDate: '2026-10-01' },
  { userId: 'u5', moduleId: 'm8', required: true, dueDate: '2026-10-01' },
];
