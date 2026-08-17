import { authStore } from '../state/authStore.js';
import { useRouter } from 'vue-router';
import { SessionInspector } from '../components/SessionInspector.js';

export const DashboardView = {
  name: 'DashboardView',
  components: {
    SessionInspector
  },
  setup() {
    const router = useRouter();

    const handleLogout = () => {
      authStore.logout('İdarəetmə panelindən çıxış edildi.');
      router.push('/login');
    };

    return { authStore, handleLogout };
  },
  template: `
    <section class="dashboard-view">
      <div class="view-top">
        <div class="view-top__left">
          <div class="view-top__badge">
            <span class="pulse-dot"></span>
            <span>Qorunan Marşrut · Authenticated</span>
          </div>
          <h1 class="view-top__title">İdarəetmə Paneli</h1>
          <p class="view-top__sub">
            Sessiya aktivdir. Səhifəni yenilədikdə (F5) sessiya <code>localStorage</code> vasitəsilə bərpa olunur.
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

      <!-- Stats Grid -->
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
          <span class="stat-block__label">Session Guard Aktiv</span>
        </div>
      </div>

      <!-- Quick nav to other protected sections -->
      <div class="quick-nav">
        <h3 class="quick-nav__title">Qorunan Digər Bölmələr</h3>
        <div class="quick-nav__list">
          <router-link to="/tasks" class="quick-nav__item">
            <div class="quick-nav__info">
              <span class="quick-nav__label">/tasks</span>
              <span class="quick-nav__desc">Tapşırıqlar Lövhəsi</span>
            </div>
            <span class="quick-nav__arrow">→</span>
          </router-link>
          <router-link to="/cart" class="quick-nav__item">
            <div class="quick-nav__info">
              <span class="quick-nav__label">/cart</span>
              <span class="quick-nav__desc">Səbət və Ödəniş</span>
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
