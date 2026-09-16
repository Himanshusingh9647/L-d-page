export const mockUser = {
  data: {
    data: {
      user: {
        userId: 2,
        employeeCode: 'EMP002',
        fullName: 'Priya Sharma',
        email: 'priya.sharma@company.com',
        department: 'Engineering',
        role: 'Employee',
        initials: 'PS'
      },
      token: 'mock-jwt-token'
    }
  }
};

export const mockAdminUser = {
  data: {
    data: {
      user: {
        userId: 1,
        employeeCode: 'EMP001',
        fullName: 'Arjun Kapoor',
        email: 'arjun.kapoor@company.com',
        department: 'HR',
        role: 'Admin',
        initials: 'AK'
      },
      token: 'mock-jwt-token'
    }
  }
};

export const mockAssignments = {
  data: {
    data: [
      {
        moduleId: 1,
        moduleTitle: "Company Code of Conduct",
        moduleType: "Video",
        moduleDescription: "Annual required compliance training regarding workplace ethics and conduct.",
        duration: "15 mins",
        isRequired: true,
        dueDate: new Date(Date.now() - 2 * 86400000).toISOString(),
        status: "NotStarted"
      },
      {
        moduleId: 2,
        moduleTitle: "Information Security Basics",
        moduleType: "Video",
        moduleDescription: "Learn how to protect company assets and avoid phishing attacks.",
        duration: "20 mins",
        isRequired: true,
        dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
        status: "InProgress",
        videoWatchedPercent: 45
      },
      {
        moduleId: 3,
        moduleTitle: "Leadership Principles",
        moduleType: "Document",
        moduleDescription: "Core leadership values for prospective managers.",
        duration: "30 mins",
        isRequired: false,
        dueDate: new Date(Date.now() + 14 * 86400000).toISOString(),
        status: "NotStarted"
      },
      {
        moduleId: 4,
        moduleTitle: "Workplace Safety",
        moduleType: "Video",
        moduleDescription: "General office safety guidelines.",
        duration: "10 mins",
        isRequired: true,
        dueDate: new Date(Date.now() - 10 * 86400000).toISOString(),
        status: "Completed",
        completedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ]
  }
};

export const mockModules = {
  data: {
    data: mockAssignments.data.data.map(m => ({ ...m, isActive: true }))
  }
};

export const mockAdminDashboard = {
  data: {
    data: {
      totalEmployees: 145,
      activeModules: 12,
      overallCompletionRate: 78,
      overdueAssignments: 23,
      recentActivity: [
        { id: 1, user: "John Doe", action: "Completed Workplace Safety", time: "2 mins ago" },
        { id: 2, user: "Jane Smith", action: "Started Code of Conduct", time: "1 hour ago" }
      ]
    }
  }
};

export const mockMatrix = {
  data: {
    data: {
      employees: [
        mockAdminUser.data.data.user,
        mockUser.data.data.user
      ],
      modules: mockModules.data.data,
      assignments: []
    }
  }
};

export const mockEmployees = {
  data: {
    data: [
      mockAdminUser.data.data.user,
      mockUser.data.data.user
    ]
  }
};
