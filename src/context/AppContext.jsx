import { createContext, useContext, useReducer, useMemo } from 'react';
import { users, modules, initialProgress } from '../data/mockData';

const AppContext = createContext(null);

// ── Reducer ───────────────────────────────────────────────
function appReducer(state, action) {
  switch (action.type) {
    case 'SET_CURRENT_USER': {
      return { ...state, currentUserId: action.payload };
    }

    case 'MARK_COMPLETE': {
      const { userId, moduleId } = action.payload;
      const existing = state.progress.find(
        (p) => p.userId === userId && p.moduleId === moduleId
      );
      if (existing) {
        return {
          ...state,
          progress: state.progress.map((p) =>
            p.userId === userId && p.moduleId === moduleId
              ? { ...p, status: 'completed', resumeTime: 0 }
              : p
          ),
        };
      }
      return {
        ...state,
        progress: [
          ...state.progress,
          { userId, moduleId, status: 'completed', resumeTime: 0 },
        ],
      };
    }

    case 'UPDATE_RESUME_TIME': {
      const { userId, moduleId, resumeTime } = action.payload;
      const existing = state.progress.find(
        (p) => p.userId === userId && p.moduleId === moduleId
      );
      if (existing) {
        return {
          ...state,
          progress: state.progress.map((p) =>
            p.userId === userId && p.moduleId === moduleId
              ? { ...p, resumeTime }
              : p
          ),
        };
      }
      return {
        ...state,
        progress: [
          ...state.progress,
          { userId, moduleId, status: 'pending', resumeTime },
        ],
      };
    }

    case 'SHOW_TOAST': {
      return {
        ...state,
        toast: { message: action.payload.message, type: action.payload.toastType || 'success' },
      };
    }

    case 'HIDE_TOAST': {
      return { ...state, toast: null };
    }

    default:
      return state;
  }
}

// ── Initial State ─────────────────────────────────────────
const initialState = {
  currentUserId: 'u1',
  users,
  modules,
  progress: initialProgress,
  toast: null,
};

// ── Provider ──────────────────────────────────────────────
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const value = useMemo(() => {
    // ─── Derived helpers ───
    const currentUser = state.users.find((u) => u.id === state.currentUserId);

    const getUserProgress = (userId) =>
      state.progress.filter((p) => p.userId === userId);

    const getModuleProgress = (userId, moduleId) =>
      state.progress.find((p) => p.userId === userId && p.moduleId === moduleId);

    const getMandatoryModules = () => state.modules.filter((m) => m.required);

    const getUserMandatoryCompletion = (userId) => {
      const mandatory = getMandatoryModules();
      const completed = mandatory.filter((m) => {
        const p = getModuleProgress(userId, m.id);
        return p && p.status === 'completed';
      });
      return { completed: completed.length, total: mandatory.length };
    };

    const getComplianceRate = () => {
      const employees = state.users.filter((u) => u.role === 'employee');
      const mandatory = getMandatoryModules();
      if (employees.length === 0 || mandatory.length === 0) return 0;

      const compliant = employees.filter((user) => {
        const { completed, total } = getUserMandatoryCompletion(user.id);
        return completed === total;
      });
      return Math.round((compliant.length / employees.length) * 100);
    };

    const getPendingTrainings = () => {
      const employees = state.users.filter((u) => u.role === 'employee');
      const mandatory = getMandatoryModules();
      let count = 0;
      employees.forEach((user) => {
        mandatory.forEach((mod) => {
          const p = getModuleProgress(user.id, mod.id);
          if (!p || p.status !== 'completed') count++;
        });
      });
      return count;
    };

    const getUserVideoStats = (userId) => {
      const videos = state.modules.filter((m) => m.type === 'video');
      const completed = videos.filter((m) => {
        const p = getModuleProgress(userId, m.id);
        return p && p.status === 'completed';
      });
      return { completed: completed.length, total: videos.length };
    };

    const getUserPdfStats = (userId) => {
      const pdfs = state.modules.filter((m) => m.type === 'pdf');
      const completed = pdfs.filter((m) => {
        const p = getModuleProgress(userId, m.id);
        return p && p.status === 'completed';
      });
      return { completed: completed.length, total: pdfs.length };
    };

    const isUserCompliant = (userId) => {
      const { completed, total } = getUserMandatoryCompletion(userId);
      return completed === total;
    };

    return {
      state,
      dispatch,
      currentUser,
      getUserProgress,
      getModuleProgress,
      getMandatoryModules,
      getUserMandatoryCompletion,
      getComplianceRate,
      getPendingTrainings,
      getUserVideoStats,
      getUserPdfStats,
      isUserCompliant,
    };
  }, [state]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────
export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside <AppProvider>');
  return context;
}
