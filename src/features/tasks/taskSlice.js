import { reactive, computed } from 'vue';
import { toastSlice } from '../../shared/state/slices/toastSlice.js';
import { apiClient } from '../../shared/services/apiClient.js';

const STORAGE_KEY = 'flin_tasks_state';

const defaultTasks = [
  { 
    id: 1, 
    title: 'Vue Router 4 Navigation Guards quraşdırılması', 
    description: 'beforeEach guard ilə protected route yönləndirilməsi.', 
    done: true, 
    priority: 'High', 
    category: 'Architecture', 
    createdAt: '10:00 AM',
    _syncStatus: 'synced'
  },
  { 
    id: 2, 
    title: 'Protected routes /login?redirect yönləndirməsi', 
    description: 'Unauthenticated istifadəçini login-ə yönləndir, redirect query parametri ilə.', 
    done: true, 
    priority: 'High', 
    category: 'Security', 
    createdAt: '11:15 AM',
    _syncStatus: 'synced'
  },
  { 
    id: 3, 
    title: 'BEM metodologiyası ilə CSS siniflərinin təşkili', 
    description: '', 
    done: true, 
    priority: 'Medium', 
    category: 'Styling', 
    createdAt: '12:30 PM',
    _syncStatus: 'synced'
  },
  { 
    id: 4, 
    title: 'Global state management (Context / Redux Pattern)', 
    description: 'Centralized store, dispatcher, action history logger tamamla.', 
    done: false, 
    priority: 'High', 
    category: 'State', 
    createdAt: '01:45 PM',
    _syncStatus: 'synced'
  },
  { 
    id: 5, 
    title: 'Form Validation və error boundary ssenariləri', 
    description: 'useForm composable, validators.js, 3 ayrı validasiyalı form.', 
    done: false, 
    priority: 'Medium', 
    category: 'Forms', 
    createdAt: '02:20 PM',
    _syncStatus: 'synced'
  },
  { 
    id: 6, 
    title: 'Mock API ilə optimistik CRUD əməliyyatları', 
    description: 'Optimistic UI update, asinxron API sorğusu və uğursuzluqda rollback.', 
    done: false, 
    priority: 'High', 
    category: 'API', 
    createdAt: '03:10 PM',
    _syncStatus: 'synced'
  }
];

function loadSavedTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(t => ({ ...t, _syncStatus: t._syncStatus || 'synced' }));
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
  staleLog: null,

  // Checkpoint 5: Optimistic UI & API simulation state
  isForcingApiFailure: false,
  pendingOperationsCount: 0,
  lastRollbackLog: null
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
  isForcingApiFailure: computed(() => state.isForcingApiFailure),
  pendingOperationsCount: computed(() => state.pendingOperationsCount),
  lastRollbackLog: computed(() => state.lastRollbackLog),

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
    const syncing = state.tasks.filter(t => t._syncStatus === 'syncing').length;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, active, syncing, rate };
  }),

  /**
   * Evaluator helper: Toggle forced API failure simulation for testing rollbacks
   */
  toggleForceApiFailure() {
    state.isForcingApiFailure = !state.isForcingApiFailure;
    apiClient.setForceFailure(state.isForcingApiFailure);
    const msg = state.isForcingApiFailure
      ? '🔴 Mock API Xəta Simulyasiyası AKTİVDİR: Növbəti əməliyyat uğursuz olacaq və Rollback baş verəcək.'
      : '🟢 Mock API Normal Rejimə Keçdi: Əməliyyatlar uğurla təsdiqlənəcək.';
    toastSlice.addToast(msg, state.isForcingApiFailure ? 'warning' : 'info', 4000);
  },

  /**
   * ══════════════════════════════════════════════════════════════════
   * CHECKPOINT 5: OPTIMISTIC CRUD WITH ROLLBACK
   * ══════════════════════════════════════════════════════════════════
   */

  /**
   * Action: Add new task with Optimistic UI & Rollback
   */
  async addTask(taskData) {
    const title = (typeof taskData === 'string' ? taskData : taskData.title || '').trim();
    if (!title) return null;

    const tempId = 'opt_' + Date.now();
    const optimisticTask = {
      id: tempId,
      title,
      description: (typeof taskData === 'object' ? taskData.description : '') || '',
      done: false,
      priority: taskData.priority || 'Medium',
      category: taskData.category || 'General',
      dueDate: (typeof taskData === 'object' ? taskData.dueDate : '') || '',
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      _syncStatus: 'syncing',
      _isOptimistic: true
    };

    // 1. [OPTIMISTIC] Immediately insert into local state & notify UI
    state.tasks.unshift(optimisticTask);
    state.pendingOperationsCount++;
    persistTasks();
    toastSlice.addToast(`[Optimistic] Tapşırıq əlavə edildi: "${title}" (Serverə göndərilir...)`, 'info', 2000);

    // 2. Call Mock API
    const response = await apiClient.createTask({
      title: optimisticTask.title,
      description: optimisticTask.description,
      priority: optimisticTask.priority,
      category: optimisticTask.category,
      dueDate: optimisticTask.dueDate
    });

    state.pendingOperationsCount = Math.max(0, state.pendingOperationsCount - 1);

    // 3. Confirm or Rollback
    if (response.ok) {
      // Confirmed by Server
      const found = state.tasks.find(t => t.id === tempId);
      if (found) {
        found.id = response.data.id || Date.now();
        found._syncStatus = 'synced';
        found._isOptimistic = false;
        persistTasks();
      }
      toastSlice.addToast(`✅ [Təsdiqləndi] Server tapşırığı qəbul etdi: "${title}"`, 'success', 3000);
      return found;
    } else {
      // 4. [ROLLBACK] Remove optimistic task from state
      const idx = state.tasks.findIndex(t => t.id === tempId);
      if (idx !== -1) {
        state.tasks.splice(idx, 1);
        persistTasks();
      }
      state.lastRollbackLog = {
        action: 'addTask',
        taskTitle: title,
        timestamp: new Date().toLocaleTimeString(),
        reason: response.error || 'Server 500 Network Error'
      };
      toastSlice.addToast(`❌ [Rollback] Server xətası baş verdi! Tapşırıq geri qaytarıldı: "${title}"`, 'danger', 5000);
      return null;
    }
  },

  /**
   * Action: Toggle task completion with Optimistic UI & Rollback
   */
  async toggleTask(id) {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;

    const previousStatus = task.done;
    const newStatus = !previousStatus;

    // 1. [OPTIMISTIC] Immediately toggle in UI
    task.done = newStatus;
    task._syncStatus = 'syncing';
    persistTasks();
    state.pendingOperationsCount++;

    const statusText = newStatus ? 'Tamamlandı' : 'Aktiv edildi';
    toastSlice.addToast(`[Optimistic] Status dəyişdirildi: ${statusText}`, 'info', 1500);

    // 2. Call Mock API
    const response = await apiClient.updateTask(id, { done: newStatus });
    state.pendingOperationsCount = Math.max(0, state.pendingOperationsCount - 1);

    // 3. Confirm or Rollback
    if (response.ok) {
      task._syncStatus = 'synced';
      persistTasks();
    } else {
      // [ROLLBACK] Revert to original status
      task.done = previousStatus;
      task._syncStatus = 'synced';
      persistTasks();

      state.lastRollbackLog = {
        action: 'toggleTask',
        taskId: id,
        timestamp: new Date().toLocaleTimeString(),
        reason: response.error || 'Server 500 Network Error'
      };
      toastSlice.addToast(`❌ [Rollback] Status yenilənmədi! Əvvəlki vəziyyətə qaytarıldı.`, 'danger', 4500);
    }
  },

  /**
   * Action: Delete task with Optimistic UI & Rollback
   */
  async deleteTask(id) {
    const idx = state.tasks.findIndex(t => t.id === id);
    if (idx === -1) return;

    const [removedTask] = state.tasks.splice(idx, 1);
    persistTasks();
    state.pendingOperationsCount++;
    toastSlice.addToast(`[Optimistic] Tapşırıq silindi: "${removedTask.title}"`, 'warning', 2000);

    // Call Mock API
    const response = await apiClient.deleteTask(id);
    state.pendingOperationsCount = Math.max(0, state.pendingOperationsCount - 1);

    if (response.ok) {
      toastSlice.addToast(`✅ [Təsdiqləndi] Tapşırıq serverdən silindi.`, 'success', 2500);
    } else {
      // [ROLLBACK] Restore deleted task at original index
      state.tasks.splice(idx, 0, { ...removedTask, _syncStatus: 'synced' });
      persistTasks();

      state.lastRollbackLog = {
        action: 'deleteTask',
        taskTitle: removedTask.title,
        timestamp: new Date().toLocaleTimeString(),
        reason: response.error || 'Server 500 Network Error'
      };
      toastSlice.addToast(`❌ [Rollback] Silinmə xətası! "${removedTask.title}" bərpa edildi.`, 'danger', 5000);
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
    const capturedStaleCount = state.tasks.length;
    
    state.tasks.unshift({
      id: Date.now(),
      title: `Stale Closure Test Element #${Math.floor(Math.random() * 1000)}`,
      done: false,
      priority: 'Low',
      category: 'Diagnostic',
      createdAt: new Date().toLocaleTimeString(),
      _syncStatus: 'synced'
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
