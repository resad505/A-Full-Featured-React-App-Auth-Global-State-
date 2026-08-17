import { authStore } from '../state/authStore.js';
import { useRouter } from 'vue-router';

export const DashboardView = {
  name: 'DashboardView',
  setup() {
    const router = useRouter();
    const handleLogout = () => {
      authStore.logout();
      router.push('/login');
    };
    return { authStore, handleLogout };
  },
  template: `
    <section class="dashboard-view">
      <div class="view-top">
        <div class="view-top__left">
          <h1 class="view-top__title">Dashboard</h1>
          <p class="view-top__sub">Qorunan bölmə — sessiya aktiv vəziyyətdədir.</p>
        </div>
        <button class="btn btn--ghost btn--sm" @click="handleLogout">Çıxış →</button>
      </div>

      <!-- Session card -->
      <div class="session-card">
        <div class="session-card__avatar">{{ authStore.user.value?.displayName?.charAt(0).toUpperCase() || 'U' }}</div>
        <div class="session-card__info">
          <p class="session-card__name">{{ authStore.user.value?.displayName }}</p>
          <p class="session-card__role">{{ authStore.user.value?.role }}</p>
        </div>
        <div class="session-card__token">
          <span class="session-card__token-label">Token</span>
          <code class="session-card__token-val">{{ authStore.state.token?.substring(0, 24) }}…</code>
        </div>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-block">
          <span class="stat-block__num">12</span>
          <span class="stat-block__label">Aktiv Tapşırıq</span>
        </div>
        <div class="stat-block">
          <span class="stat-block__num">3</span>
          <span class="stat-block__label">Səbət Elementi</span>
        </div>
        <div class="stat-block stat-block--accent">
          <span class="stat-block__num">✓</span>
          <span class="stat-block__label">Guard Aktiv</span>
        </div>
      </div>

      <!-- Quick nav -->
      <div class="quick-nav">
        <h3 class="quick-nav__title">Qorunan Bölmələr</h3>
        <div class="quick-nav__list">
          <router-link to="/tasks" class="quick-nav__item">
            <span class="quick-nav__label">/tasks</span>
            <span class="quick-nav__arrow">→</span>
          </router-link>
          <router-link to="/cart" class="quick-nav__item">
            <span class="quick-nav__label">/cart</span>
            <span class="quick-nav__arrow">→</span>
          </router-link>
          <router-link to="/profile" class="quick-nav__item">
            <span class="quick-nav__label">/profile</span>
            <span class="quick-nav__arrow">→</span>
          </router-link>
        </div>
      </div>
    </section>
  `
};
