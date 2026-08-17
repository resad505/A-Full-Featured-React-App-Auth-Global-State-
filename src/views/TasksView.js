import { ref } from 'vue';

export const TasksView = {
  name: 'TasksView',
  setup() {
    const tasks = ref([
      { id: 1, title: 'Vue Router 4 Navigation Guards quraşdırılması', done: true, priority: 'High' },
      { id: 2, title: 'Protected routes /login?redirect yönləndirməsi', done: true, priority: 'High' },
      { id: 3, title: 'BEM metodologiyası ilə CSS siniflərinin təşkili', done: true, priority: 'Medium' },
      { id: 4, title: 'Global State Management hazırlığı', done: false, priority: 'Medium' },
      { id: 5, title: 'Mock API ilə CRUD əməliyyatları', done: false, priority: 'Low' }
    ]);
    return { tasks };
  },
  template: `
    <section class="tasks-view">
      <div class="view-top">
        <h1 class="view-top__title">Tasks</h1>
        <p class="view-top__sub">Qorunan bölmə.</p>
      </div>

      <div class="task-list">
        <div v-for="task in tasks" :key="task.id" class="task-item" :class="{ 'task-item--done': task.done }">
          <span class="task-item__status">{{ task.done ? '✓' : '○' }}</span>
          <span class="task-item__title">{{ task.title }}</span>
          <span class="badge badge--dim">{{ task.priority }}</span>
        </div>
      </div>
    </section>
  `
};
