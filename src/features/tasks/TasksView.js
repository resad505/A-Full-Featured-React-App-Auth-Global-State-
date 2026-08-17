import { ref, computed } from 'vue';
import { globalStore } from '../../shared/state/index.js';
import { taskSlice } from './taskSlice.js';
import { useForm } from '../../shared/composables/useForm.js';
import {
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateFutureDate,
  validateNoHtml
} from '../../shared/utils/validators.js';

export const TasksView = {
  name: 'TasksView',
  setup() {
    // ── Checkpoint 4: Enhanced Task Create Form ─────────────────────
    const {
      fields: taskFields,
      errors: taskErrors,
      isSubmitting: taskSubmitting,
      touchField: touchTaskField,
      setField: setTaskField,
      validateAll: validateTaskForm,
      resetForm: resetTaskForm,
      getValues: getTaskValues
    } = useForm(
      {
        title: '',
        description: '',
        priority: 'Medium',
        category: 'Engineering',
        dueDate: ''
      },
      {
        title: [
          (v) => validateRequired(v, 'Tapşırıq başlığı'),
          (v) => validateMinLength(v, 5, 'Tapşırıq başlığı'),
          (v) => validateMaxLength(v, 120, 'Tapşırıq başlığı'),
          (v) => validateNoHtml(v)
        ],
        description: [
          (v) => validateMaxLength(v, 300, 'Təsvir'),
          (v) => validateNoHtml(v)
        ],
        priority: [
          (v) => validateRequired(v, 'Prioritet')
        ],
        category: [
          (v) => validateRequired(v, 'Kateqoriya')
        ],
        dueDate: [
          (v) => validateFutureDate(v)
        ]
      }
    );

    const descRemaining = computed(() => 300 - (taskFields.description?.length || 0));

    const handleCreateTask = async () => {
      const valid = validateTaskForm();
      if (!valid) return;

      taskSubmitting.value = true;
      const values = getTaskValues();
      resetTaskForm();
      
      // Dispatch optimistic add
      globalStore.dispatch({
        type: 'tasks/addTask',
        payload: values
      });
      taskSubmitting.value = false;
    };

    // ── Existing task controls & Checkpoint 5 Optimistic features ──
    const tasks = computed(() => taskSlice.filteredTasks.value);
    const stats = computed(() => taskSlice.stats.value);
    const currentFilter = computed(() => taskSlice.filter.value);
    const isForcingFailure = computed(() => taskSlice.isForcingApiFailure.value);
    const pendingOps = computed(() => taskSlice.pendingOperationsCount.value);
    const lastRollback = computed(() => taskSlice.lastRollbackLog.value);

    const searchQuery = computed({
      get: () => taskSlice.searchQuery.value,
      set: (val) => globalStore.dispatch({ type: 'tasks/setSearch', payload: val })
    });
    const priorityFilter = computed({
      get: () => taskSlice.priorityFilter.value,
      set: (val) => globalStore.dispatch({ type: 'tasks/setPriority', payload: val })
    });
    const staleLog = computed(() => taskSlice.staleLog.value);

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

    const toggleFailureMode = () => {
      taskSlice.toggleForceApiFailure();
    };

    // Expanded task detail toggle
    const expandedTaskId = ref(null);
    const toggleExpand = (id) => {
      expandedTaskId.value = expandedTaskId.value === id ? null : id;
    };

    return {
      // form
      taskFields,
      taskErrors,
      taskSubmitting,
      descRemaining,
      touchTaskField,
      setTaskField,
      handleCreateTask,
      // list & stats
      tasks,
      stats,
      currentFilter,
      searchQuery,
      priorityFilter,
      staleLog,
      isForcingFailure,
      pendingOps,
      lastRollback,
      handleToggle,
      handleDelete,
      setFilter,
      handleBulkComplete,
      handleClearCompleted,
      runStaleTest,
      toggleFailureMode,
      expandedTaskId,
      toggleExpand
    };
  },
  template: `
    <section class="tasks-view">
      <div class="view-top">
        <div class="view-top__left">
          <div class="view-top__badge">
            <span class="pulse-dot"></span>
            <span>Qorunan Bölmə · Optimistic UI & Mock CRUD</span>
          </div>
          <h1 class="view-top__title">Tapşırıqlar İdarəetməsi</h1>
          <p class="view-top__sub">
            Optimistik UI (dərhal ekran yeniləməsi), asinxron API sorğuları və şəbəkə xətalarında avtomatik Rollback mexanizmi.
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

      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- CHECKPOINT 5: Optimistic UI & API Rollback Simulator Toolbar  -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div class="api-sim-card" :class="{ 'api-sim-card--failing': isForcingFailure }">
        <div class="api-sim-card__header">
          <div class="api-sim-card__title-col">
            <span class="badge" :class="isForcingFailure ? 'badge--protected' : 'badge--public'">
              {{ isForcingFailure ? '🔴 XƏTA SİMULYASİYASI AKTİV' : '🟢 NORMAL APİ REJİMİ' }}
            </span>
            <h3 class="api-sim-card__title">Checkpoint 5 · Optimistic UI & Rollback Ssenarisi</h3>
          </div>
          <button 
            type="button" 
            class="btn btn--sm" 
            :class="isForcingFailure ? 'btn--solid' : 'btn--danger-ghost'"
            @click="toggleFailureMode"
          >
            {{ isForcingFailure ? '✓ Normal Rejimə Keç' : '⚡ 500 Xətası Simulyasiya Et (Rollback Testi)' }}
          </button>
        </div>

        <p class="api-sim-card__desc">
          <template v-if="!isForcingFailure">
            <strong>Optimistik Rejim:</strong> Tapşırıq əlavə etdikdə və ya sildikdə UI dərhal yenilənir, arxa fonda Mock API (250–400ms) sorğusu icra olunur və təsdiqlənir.
          </template>
          <template v-else>
            <strong style="color: var(--color-danger, #ef4444);">Rollback Test Rejimi Aktivdir:</strong> İndi yeni tapşırıq əlavə edin və ya mövcud olanı silin/dəyişin — UI dərhal dəyişəcək (Optimistic), 300ms sonra Mock API 500 xətası qaytaracaq və state əvvəlki dəqiq vəziyyətinə <strong>avtomatik Rollback</strong> edəcək!
          </template>
        </p>

        <!-- Rollback banner -->
        <div v-if="lastRollback" class="rollback-banner">
          <span class="rollback-banner__icon">🔄</span>
          <div class="rollback-banner__text">
            <strong>Son Rollback Hadisəsi ({{ lastRollback.timestamp }}):</strong>
            <span>Əməliyyat: <code>{{ lastRollback.action }}</code> · Səbəb: {{ lastRollback.reason }}</span>
          </div>
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

      <!-- ══════════════════════════════════════════════════════════════ -->
      <!-- CHECKPOINT 4: Enhanced Task Create Form — Manual Validation   -->
      <!-- ══════════════════════════════════════════════════════════════ -->
      <div class="task-create-card task-create-card--enhanced">
        <div class="task-create-card__header">
          <span class="badge badge--warning">Checkpoint 4 · useForm Validation</span>
          <h3 class="task-create-card__title">Yeni Tapşırıq Əlavə Et (Optimistic)</h3>
        </div>

        <form class="task-create-form task-create-form--enhanced" @submit.prevent="handleCreateTask" novalidate>
          <div class="task-create-form__grid">

            <!-- Title -->
            <div class="task-create-form__group task-create-form__group--full" :class="{ 'task-create-form__group--error': taskErrors.title }">
              <label class="task-create-form__label" for="tc-title">
                Tapşırıq Başlığı <span class="profile-edit-form__required">*</span>
              </label>
              <input
                id="tc-title"
                :value="taskFields.title"
                @input="setTaskField('title', $event.target.value)"
                @blur="touchTaskField('title')"
                type="text"
                class="task-create-form__input"
                placeholder="Minimum 5 simvol (məs: JWT interceptor testlərini tamamla)..."
                maxlength="120"
              />
              <div class="task-create-form__feedback">
                <span v-if="taskErrors.title" class="task-create-form__error">{{ taskErrors.title }}</span>
                <span v-else class="field-hint">5 — 120 simvol.</span>
                <span class="task-create-form__char-count">{{ taskFields.title.length }}/120</span>
              </div>
            </div>

            <!-- Description -->
            <div class="task-create-form__group task-create-form__group--full" :class="{ 'task-create-form__group--error': taskErrors.description }">
              <div class="task-create-form__label-row">
                <label class="task-create-form__label" for="tc-desc">
                  Təsvir <span class="field-hint field-hint--inline">(isteğe bağlı)</span>
                </label>
                <span class="profile-edit-form__counter" :class="{ 'profile-edit-form__counter--warn': descRemaining < 50 }">
                  {{ descRemaining }}/300
                </span>
              </div>
              <textarea
                id="tc-desc"
                :value="taskFields.description"
                @input="setTaskField('description', $event.target.value)"
                @blur="touchTaskField('description')"
                class="task-create-form__textarea"
                placeholder="Tapşırıq haqqında əlavə məlumat..."
                rows="2"
                maxlength="300"
              ></textarea>
              <span v-if="taskErrors.description" class="task-create-form__error">{{ taskErrors.description }}</span>
            </div>

            <!-- Priority -->
            <div class="task-create-form__group" :class="{ 'task-create-form__group--error': taskErrors.priority }">
              <label class="task-create-form__label" for="tc-priority">
                Prioritet <span class="profile-edit-form__required">*</span>
              </label>
              <select
                id="tc-priority"
                :value="taskFields.priority"
                @change="setTaskField('priority', $event.target.value)"
                @blur="touchTaskField('priority')"
                class="task-create-form__select"
              >
                <option value="High">🔴 High Priority</option>
                <option value="Medium">🟡 Medium Priority</option>
                <option value="Low">🟢 Low Priority</option>
              </select>
              <span v-if="taskErrors.priority" class="task-create-form__error">{{ taskErrors.priority }}</span>
            </div>

            <!-- Category -->
            <div class="task-create-form__group" :class="{ 'task-create-form__group--error': taskErrors.category }">
              <label class="task-create-form__label" for="tc-category">
                Kateqoriya <span class="profile-edit-form__required">*</span>
              </label>
              <select
                id="tc-category"
                :value="taskFields.category"
                @change="setTaskField('category', $event.target.value)"
                @blur="touchTaskField('category')"
                class="task-create-form__select"
              >
                <option value="Engineering">Engineering</option>
                <option value="Architecture">Architecture</option>
                <option value="Security">Security</option>
                <option value="DevTools">DevTools</option>
                <option value="Styling">Styling</option>
                <option value="Forms">Forms</option>
                <option value="API">API</option>
              </select>
              <span v-if="taskErrors.category" class="task-create-form__error">{{ taskErrors.category }}</span>
            </div>

            <!-- Due Date -->
            <div class="task-create-form__group" :class="{ 'task-create-form__group--error': taskErrors.dueDate }">
              <label class="task-create-form__label" for="tc-due">
                Son Tarix <span class="field-hint field-hint--inline">(isteğe bağlı)</span>
              </label>
              <input
                id="tc-due"
                :value="taskFields.dueDate"
                @input="setTaskField('dueDate', $event.target.value)"
                @blur="touchTaskField('dueDate')"
                type="date"
                class="task-create-form__input"
              />
              <span v-if="taskErrors.dueDate" class="task-create-form__error">{{ taskErrors.dueDate }}</span>
              <span v-else class="field-hint">Keçmiş tarix seçmək olmaz.</span>
            </div>

            <!-- Submit -->
            <div class="task-create-form__group task-create-form__group--submit">
              <button
                type="submit"
                class="btn btn--solid btn--md task-create-form__btn-submit"
                :disabled="taskSubmitting.value"
              >
                <span v-if="taskSubmitting.value" class="spinner"></span>
                <span>{{ taskSubmitting.value ? 'Əlavə edilir...' : '+ Tapşırıq Əlavə Et' }}</span>
              </button>
            </div>

          </div>
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
          :class="{ 
            'task-item--done': task.done,
            'task-item--syncing': task._syncStatus === 'syncing'
          }"
        >
          <button class="task-item__check-btn" @click="handleToggle(task.id)">
            <span class="task-item__check-box">
              <span v-if="task.done">✓</span>
            </span>
          </button>

          <div class="task-item__body">
            <div class="task-item__title-row">
              <span class="task-item__title">{{ task.title }}</span>
              <span v-if="task._syncStatus === 'syncing'" class="badge badge--warning badge--pulse">
                ⏳ API Sync...
              </span>
            </div>
            <div class="task-item__meta">
              <span class="badge badge--dim">{{ task.category }}</span>
              <span class="task-item__time">{{ task.createdAt }}</span>
              <span v-if="task.dueDate" class="task-item__due">📅 {{ task.dueDate }}</span>
            </div>
            <!-- Description expand -->
            <div v-if="task.description" class="task-item__desc-toggle">
              <button type="button" class="task-item__expand-btn" @click="toggleExpand(task.id)">
                {{ expandedTaskId === task.id ? '▲ Gizlət' : '▼ Təsvir' }}
              </button>
              <p v-if="expandedTaskId === task.id" class="task-item__desc">{{ task.description }}</p>
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
            <button class="task-item__del-btn" @click="handleDelete(task.id)" title="Tapşırığı sil (Optimistic)">
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
