import { ref, computed } from 'vue';
import { globalStore } from '../state/index.js';
import { taskSlice } from '../state/slices/taskSlice.js';

export const TasksView = {
  name: 'TasksView',
  setup() {
    const newTaskTitle = ref('');
    const newTaskPriority = ref('Medium');
    const newTaskCategory = ref('Engineering');

    const tasks = computed(() => taskSlice.filteredTasks.value);
    const stats = computed(() => taskSlice.stats.value);
    const currentFilter = computed(() => taskSlice.filter.value);
    const searchQuery = computed({
      get: () => taskSlice.searchQuery.value,
      set: (val) => globalStore.dispatch({ type: 'tasks/setSearch', payload: val })
    });
    const priorityFilter = computed({
      get: () => taskSlice.priorityFilter.value,
      set: (val) => globalStore.dispatch({ type: 'tasks/setPriority', payload: val })
    });
    const staleLog = computed(() => taskSlice.staleLog.value);

    const handleCreateTask = () => {
      if (!newTaskTitle.value.trim()) return;
      globalStore.dispatch({
        type: 'tasks/addTask',
        payload: {
          title: newTaskTitle.value.trim(),
          priority: newTaskPriority.value,
          category: newTaskCategory.value
        }
      });
      newTaskTitle.value = '';
    };

    const handleToggle = (id) => {
      globalStore.dispatch({ type: 'tasks/toggleTask', payload: id });
    };

    const handleDelete = (id) => {
      globalStore.dispatch({ type: 'tasks/deleteTask', payload: id });
    };

    const setFilter = (filter) => {
      globalStore.dispatch({ type: 'tasks/setFilter', payload: filter });
    };

    const handleBulkComplete = () => {
      globalStore.dispatch({ type: 'tasks/bulkComplete' });
    };

    const handleClearCompleted = () => {
      globalStore.dispatch({ type: 'tasks/clearCompleted' });
    };

    const runStaleTest = () => {
      globalStore.dispatch({ type: 'tasks/testStaleClosure' });
    };

    return {
      newTaskTitle,
      newTaskPriority,
      newTaskCategory,
      tasks,
      stats,
      currentFilter,
      searchQuery,
      priorityFilter,
      staleLog,
      handleCreateTask,
      handleToggle,
      handleDelete,
      setFilter,
      handleBulkComplete,
      handleClearCompleted,
      runStaleTest
    };
  },
  template: `
    <section class="tasks-view">
      <div class="view-top">
        <div class="view-top__left">
          <div class="view-top__badge">
            <span class="pulse-dot"></span>
            <span>Qorunan Bölmə · Redux/Context Task Slice</span>
          </div>
          <h1 class="view-top__title">Tapşırıqlar İdarəetməsi</h1>
          <p class="view-top__sub">
            Qlobal vəziyyət (Global State) üzərindən idarə olunan asinxron CRUD və filtrləmə mərkəzi.
          </p>
        </div>

        <div class="tasks-actions-top">
          <button class="btn btn--sm btn--solid" @click="handleBulkComplete">
            Hamısını Tamamla ({{ stats.active }})
          </button>
          <button class="btn btn--sm btn--ghost" @click="handleClearCompleted">
            Tamamlananları Təmizlə
          </button>
        </div>
      </div>

      <!-- Stats Bar -->
      <div class="task-stats-bar">
        <div class="stat-card">
          <span class="stat-card__num">{{ stats.total }}</span>
          <span class="stat-card__label">Ümumi</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__num stat-card__num--ok">{{ stats.completed }}</span>
          <span class="stat-card__label">Tamamlandı</span>
        </div>
        <div class="stat-card">
          <span class="stat-card__num stat-card__num--warn">{{ stats.active }}</span>
          <span class="stat-card__label">Gözləyir</span>
        </div>
        <div class="stat-card stat-card--progress">
          <div class="stat-card__progress-header">
            <span class="stat-card__label">İcra Faizi</span>
            <span class="stat-card__rate">{{ stats.rate }}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-bar__fill" :style="{ width: stats.rate + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Create task input card -->
      <div class="task-create-card">
        <form class="task-create-form" @submit.prevent="handleCreateTask">
          <input 
            v-model="newTaskTitle" 
            type="text" 
            class="task-create-form__input" 
            placeholder="Yeni tapşırıq əlavə edin (məs: JWT interceptor testlərini tamamla)..." 
            required 
          />
          <select v-model="newTaskPriority" class="task-create-form__select">
            <option value="High">🔴 High Priority</option>
            <option value="Medium">🟡 Medium Priority</option>
            <option value="Low">🟢 Low Priority</option>
          </select>
          <select v-model="newTaskCategory" class="task-create-form__select">
            <option value="Engineering">Engineering</option>
            <option value="Architecture">Architecture</option>
            <option value="Security">Security</option>
            <option value="DevTools">DevTools</option>
          </select>
          <button type="submit" class="btn btn--solid btn--md task-create-form__btn">
            + Əlavə Et
          </button>
        </form>
      </div>

      <!-- Filters and Search Bar -->
      <div class="task-filter-bar">
        <div class="task-tabs">
          <button 
            class="task-tab" 
            :class="{ 'task-tab--active': currentFilter === 'all' }"
            @click="setFilter('all')"
          >
            Hamısı ({{ stats.total }})
          </button>
          <button 
            class="task-tab" 
            :class="{ 'task-tab--active': currentFilter === 'active' }"
            @click="setFilter('active')"
          >
            Aktiv ({{ stats.active }})
          </button>
          <button 
            class="task-tab" 
            :class="{ 'task-tab--active': currentFilter === 'completed' }"
            @click="setFilter('completed')"
          >
            Tamamlanan ({{ stats.completed }})
          </button>
        </div>

        <div class="task-search-group">
          <input 
            v-model="searchQuery" 
            type="text" 
            class="task-search-input" 
            placeholder="Axtarış..." 
          />
          <select v-model="priorityFilter" class="task-priority-filter">
            <option value="all">Bütün Prioritetlər</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      <!-- Task Items List -->
      <div class="task-list">
        <div 
          v-for="task in tasks" 
          :key="task.id" 
          class="task-item" 
          :class="{ 'task-item--done': task.done }"
        >
          <button class="task-item__check-btn" @click="handleToggle(task.id)">
            <span class="task-item__check-box">
              <span v-if="task.done">✓</span>
            </span>
          </button>

          <div class="task-item__body">
            <span class="task-item__title">{{ task.title }}</span>
            <div class="task-item__meta">
              <span class="badge badge--dim">{{ task.category }}</span>
              <span class="task-item__time">{{ task.createdAt }}</span>
            </div>
          </div>

          <div class="task-item__actions">
            <span 
              class="badge"
              :class="{
                'badge--protected': task.priority === 'High',
                'badge--warning': task.priority === 'Medium',
                'badge--public': task.priority === 'Low'
              }"
            >
              {{ task.priority }}
            </span>
            <button class="task-item__del-btn" @click="handleDelete(task.id)" title="Tapşırığı sil">
              ✕
            </button>
          </div>
        </div>

        <div v-if="tasks.length === 0" class="task-empty-state">
          <p class="task-empty-state__msg">Seçilmiş filtrə uyğun tapşırıq tapılmadı.</p>
        </div>
      </div>

      <!-- Quality Check 2: Stale Closure Diagnostic Module -->
      <div class="stale-closure-card">
        <div class="stale-closure-card__top">
          <div class="stale-closure-card__title-row">
            <span class="badge badge--warning">Quality Check 2 Test Scenario</span>
            <h3 class="stale-closure-card__title">Stale Closure vs Fresh Reducer Dispatch</h3>
          </div>
          <button class="btn btn--sm btn--solid" @click="runStaleTest">
            ⚡ Stale Closure Testini İcra Et
          </button>
        </div>

        <p class="stale-closure-card__desc">
          React/Vue-da callback və asinxron funksiyalar zamanı yaranan klassik "Stale Closure" tələsi (köhnə state dəyərini yadda saxlaması) və Reducer store-un hər zaman ən son, təzə vəziyyəti təmin etməsi testi.
        </p>

        <div v-if="staleLog" class="stale-closure-card__result" :class="'stale-closure-card__result--' + staleLog.status">
          <p class="stale-closure-card__msg">{{ staleLog.message }}</p>
          <div class="stale-closure-card__data" v-if="staleLog.status === 'passed'">
            <span class="stale-badge stale-badge--old">Old Closure Snapshot: {{ staleLog.staleSnapshot }} elements</span>
            <span class="stale-badge stale-badge--fresh">Fresh Store State: {{ staleLog.freshStoreCount }} elements (Updated)</span>
          </div>
        </div>
      </div>
    </section>
  `
};
