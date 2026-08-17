import { computed } from 'vue';
import { authStore } from '../state/authStore.js';
import { cartSlice } from '../state/slices/cartSlice.js';
import { taskSlice } from '../state/slices/taskSlice.js';
import { useRouter } from 'vue-router';
import { SessionInspector } from '../components/SessionInspector.js';

export const DashboardView = {
  name: 'DashboardView',
  components: {
    SessionInspector
  },
  setup() {
    const router = useRouter();

    const cartCount = computed(() => cartSlice.itemCount.value);
    const activeTasksCount = computed(() => taskSlice.stats.value.active);
    const completedTasksCount = computed(() => taskSlice.stats.value.completed);

    const handleLogout = () => {
      authStore.logout('İdarəetmə panelindən çıxış edildi.');
      router.push('/login');
    };

    return { 
      authStore, 
      cartCount, 
      activeTasksCount, 
      completedTasksCount, 
      handleLogout 
    };
  },
  template: `
    <section class="dashboard-view">
      <div class="view-top">
        <div class="view-top__left">
          <div class="view-top__badge">
            <span class="pulse-dot"></span>
            <span>Qorunan Marşrut · Global State Connected</span>
          </div>
          <h1 class="view-top__title">İdarəetmə Paneli</h1>
          <p class="view-top__sub">
            Qlobal vəziyyət (Redux/Context Store) real-vaxt rejimində bütün komponentlərlə sinxronlaşır.
          </p>
        </div>
        <button class="btn btn--danger-ghost btn--sm" @click="handleLogout">
          Təhlükəsiz Çıxış →
        </button>
      </div>

      <!-- User Profile summary card -->
      <div class="session-card">
        <div class="session-card__avatar">
          {{ authStore.user.value?.displayName?.charAt(0).toUpperCase() || 'U' }}
        </div>
        <div class="session-card__info">
          <div class="session-card__name-row">
            <p class="session-card__name">{{ authStore.user.value?.displayName || 'İstifadəçi' }}</p>
            <span class="badge badge--protected">{{ authStore.user.value?.role || 'Frontend Architect' }}</span>
          </div>
          <p class="session-card__email">{{ authStore.user.value?.username }}</p>
          <p class="session-card__sub">Daxil olma vaxtı: {{ authStore.user.value?.loginAt }}</p>
        </div>
      </div>

      <!-- Token & Session Live Inspector -->
      <SessionInspector />

      <!-- Real-time Stats Grid from Global Slices -->
      <div class="stats-grid">
        <div class="stat-block">
          <span class="stat-block__num">{{ activeTasksCount }}</span>
          <span class="stat-block__label">Gözləyən Tapşırıq</span>
        </div>
        <div class="stat-block">
          <span class="stat-block__num">{{ cartCount }}</span>
          <span class="stat-block__label">Səbətdəki Məhsul</span>
        </div>
        <div class="stat-block stat-block--accent">
          <span class="stat-block__num">{{ completedTasksCount }}</span>
          <span class="stat-block__label">Tamamlanmış İş</span>
        </div>
      </div>

      <!-- Quick nav to other protected sections -->
      <div class="quick-nav">
        <h3 class="quick-nav__title">Qorunan Digər Bölmələr</h3>
        <div class="quick-nav__list">
          <router-link to="/tasks" class="quick-nav__item">
            <div class="quick-nav__info">
              <span class="quick-nav__label">/tasks ({{ activeTasksCount }} gözləyir)</span>
              <span class="quick-nav__desc">Tapşırıqlar Lövhəsi və Stale Closure Testi</span>
            </div>
            <span class="quick-nav__arrow">→</span>
          </router-link>
          <router-link to="/cart" class="quick-nav__item">
            <div class="quick-nav__info">
              <span class="quick-nav__label">/cart ({{ cartCount }} məhsul)</span>
              <span class="quick-nav__desc">Səbət, Promo Kod və Faktura</span>
            </div>
            <span class="quick-nav__arrow">→</span>
          </router-link>
          <router-link to="/profile" class="quick-nav__item">
            <div class="quick-nav__info">
              <span class="quick-nav__label">/profile</span>
              <span class="quick-nav__desc">İstifadəçi Profili və Təhlükəsizlik</span>
            </div>
            <span class="quick-nav__arrow">→</span>
          </router-link>
        </div>
      </div>
    </section>
  `
};
