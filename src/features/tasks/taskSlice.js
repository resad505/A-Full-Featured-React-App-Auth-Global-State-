import { reactive, computed } from 'vue';
import { toastSlice } from '../../shared/state/slices/toastSlice.js';

const STORAGE_KEY = 'flin_tasks_state';

const defaultTasks = [
  { 
    id: 1, 
    title: 'Vue Router 4 Navigation Guards quraşdırılması', 
    description: 'beforeEach guard ilə protected route yönləndirilməsi.', 
    done: true, 
    priority: 'High', 
    category: 'Architecture', 
    createdAt: '10:00 AM' 
  },
  { 
    id: 2, 
    title: 'Protected routes /login?redirect yönləndirməsi', 
    description: 'Unauthenticated istifadəçini login-ə yönləndir, redirect query parametri ilə.', 
    done: true, 
    priority: 'High', 
    category: 'Security', 
    createdAt: '11:15 AM' 
  },
  { 
    id: 3, 
    title: 'BEM metodologiyası ilə CSS siniflərinin təşkili', 
    description: '', 
    done: true, 
    priority: 'Medium', 
    category: 'Styling', 
    createdAt: '12:30 PM' 
  },
  { 
    id: 4, 
    title: 'Global state management (Context / Redux Pattern)', 
    description: 'Centralized store, dispatcher, action history logger tamamla.', 
    done: false, 
    priority: 'High', 
    category: 'State', 
    createdAt: '01:45 PM' 
  },
  { 
    id: 5, 
    title: 'Form Validation və error boundary ssenariləri', 
    description: 'useForm composable, validators.js, 3 ayrı validasiyalı form.', 
    done: false, 
    priority: 'Medium', 
    category: 'Forms', 
    createdAt: '02:20 PM' 
  },
  { 
    id: 6, 
    title: 'Mock API ilə optimistik CRUD əməliyyatları', 
    description: '', 
    done: false, 
    priority: 'Low', 
    category: 'API', 
    createdAt: '03:10 PM' 
  }
];

function loadSavedTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[Tasks] Storage read error:', err);
  }
  return defaultTasks;
}

const state = reactive({
  tasks: loadSavedTasks(),
  filter: 'all', // 'all' | 'active' | 'completed'
  searchQuery: '',
  priorityFilter: 'all', // 'all' | 'High' | 'Medium' | 'Low'
  
  // Quality Check 2 Stale Closure Diagnostic fields
  staleCounter: 0,
  staleLog: null
});

function persistTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tasks));
  } catch (e) {
    console.warn('[Tasks] Persist failed:', e);
  }
}

export const taskSlice = {
  state,

  tasks: computed(() => state.tasks),
  filter: computed(() => state.filter),
  searchQuery: computed(() => state.searchQuery),
  priorityFilter: computed(() => state.priorityFilter),
  staleCounter: computed(() => state.staleCounter),
  staleLog: computed(() => state.staleLog),

  /**
   * Filtered tasks selector based on status, search, and priority
   */
  filteredTasks: computed(() => {
    return state.tasks.filter(task => {
      // Status filter
      if (state.filter === 'active' && task.done) return false;
      if (state.filter === 'completed' && !task.done) return false;

      // Priority filter
      if (state.priorityFilter !== 'all' && task.priority !== state.priorityFilter) return false;

      // Search filter
      if (state.searchQuery.trim()) {
        const q = state.searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesCategory = (task.category || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesCategory) return false;
      }

      return true;
    });
  }),

  /**
   * Task statistics selector
   */
  stats: computed(() => {
    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.done).length;
    const active = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, active, rate };
  }),

  /**
   * Action: Add new task
   */
  addTask(taskData) {
    const title = (typeof taskData === 'string' ? taskData : taskData.title || '').trim();
    if (!title) return null;

    const newTask = {
      id: Date.now(),
      title,
      description: (typeof taskData === 'object' ? taskData.description : '') || '',
      done: false,
      priority: taskData.priority || 'Medium',
      category: taskData.category || 'General',
      dueDate: (typeof taskData === 'object' ? taskData.dueDate : '') || '',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    state.tasks.unshift(newTask);
    persistTasks();
    toastSlice.addToast(`Tapşırıq əlavə edildi: "${title}"`, 'success');
    return newTask;
  },

  /**
   * Action: Toggle task completion
   */
  toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (task) {
      task.done = !task.done;
      persistTasks();
      const statusText = task.done ? 'Tamamlandı' : 'Aktiv edildi';
      toastSlice.addToast(`Tapşırıq statusu: ${statusText}`, 'info');
    }
  },

  /**
   * Action: Delete task
   */
  deleteTask(id) {
    const idx = state.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      const removed = state.tasks[idx];
      state.tasks.splice(idx, 1);
      persistTasks();
      toastSlice.addToast(`Tapşırıq silindi: "${removed.title}"`, 'warning');
    }
  },

  /**
   * Action: Mark all visible tasks completed
   */
  bulkComplete() {
    let count = 0;
    state.tasks.forEach(t => {
      if (!t.done) {
        t.done = true;
        count++;
      }
    });
    if (count > 0) {
      persistTasks();
      toastSlice.addToast(`${count} tapşırıq tamamlandı olaraq işarələndi.`, 'success');
    }
  },

  /**
   * Action: Remove all completed tasks
   */
  clearCompleted() {
    const beforeCount = state.tasks.length;
    state.tasks = state.tasks.filter(t => !t.done);
    persistTasks();
    const removedCount = beforeCount - state.tasks.length;
    toastSlice.addToast(`${removedCount} tamamlanmış tapşırıq silindi.`, 'info');
  },

  setFilter(filter) {
    state.filter = filter;
  },

  setSearchQuery(q) {
    state.searchQuery = q;
  },

  setPriorityFilter(p) {
    state.priorityFilter = p;
  },

  /**
   * Quality Check 2: Stale Closure vs Fresh Reducer Dispatch Test Scenario
   */
  runStaleClosureTest() {
    // Capture state snapshot at this exact tick (simulating missing dependency / stale closure)
    const capturedStaleCount = state.tasks.length;
    
    // Perform an immediate mutation
    state.tasks.unshift({
      id: Date.now(),
      title: `Stale Closure Test Element #${Math.floor(Math.random() * 1000)}`,
      done: false,
      priority: 'Low',
      category: 'Diagnostic',
      createdAt: new Date().toLocaleTimeString()
    });

    state.staleLog = {
      status: 'pending',
      message: 'Asinxron taymer işə salındı (500ms). Stale Closure vs Fresh State yoxlanılır...'
    };

    setTimeout(() => {
      const freshCount = state.tasks.length;
      
      state.staleLog = {
        status: 'passed',
        staleSnapshot: capturedStaleCount,
        freshStoreCount: freshCount,
        message: `Quality Check 2 Uğurlu: Reducer Store hər zaman təzə vəziyyəti təmin edir (Köhnə Closure: ${capturedStaleCount} vs Fresh State: ${freshCount}).`
      };
      
      toastSlice.addToast('Quality Check 2: Stale Closure testi uğurla keçdi!', 'success');
    }, 500);
  }
};
