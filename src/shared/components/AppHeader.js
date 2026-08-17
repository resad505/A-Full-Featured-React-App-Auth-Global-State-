import { computed } from 'vue';
import { authStore } from '../../features/auth/authStore.js';
import { cartSlice } from '../../features/cart/cartSlice.js';
import { taskSlice } from '../../features/tasks/taskSlice.js';
import { useRouter, useRoute } from 'vue-router';

export const AppHeader = {
  name: 'AppHeader',
  setup() {
    const router = useRouter();
    const route = useRoute();

    const cartCount = computed(() => cartSlice.itemCount.value);
    const activeTasksCount = computed(() => taskSlice.stats.value.active);

    const handleAuthToggle = () => {
      authStore.toggleMockAuth();
      if (!authStore.isAuthenticated.value && route.meta.requiresAuth) {
        router.push({
          path: '/login',
          query: { redirect: route.fullPath }
        });
      }
    };

    return {
      authStore,
      cartCount,
      activeTasksCount,
      handleAuthToggle
    };
  },
  template: `
    <header class="app-header">
      <div class="app-header__container">
        <!-- Brand -->
        <router-link to="/" class="app-header__brand">
          <div class="app-header__logo">
            <span class="app-header__logo-mark">F</span>
          </div>
          <span class="app-header__brand-name">Flin</span>
        </router-link>

        <!-- Navigation -->
        <nav class="app-header__nav">
          <ul class="nav-list">
            <li class="nav-list__item">
              <router-link to="/" class="nav-list__link" active-class="nav-list__link--active" exact>Ana</router-link>
            </li>
            <li class="nav-list__item">
              <router-link to="/catalog" class="nav-list__link" active-class="nav-list__link--active">Kataloq</router-link>
            </li>
            <li class="nav-list__item">
              <router-link to="/dashboard" class="nav-list__link nav-list__link--gated" active-class="nav-list__link--active">
                <svg class="nav-list__gate-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="13" height="13"><rect x="3" y="7" width="10" height="8" rx="1.5"/><path d="M5.5 7V4.5a2.5 2.5 0 015 0V7"/></svg>
                Dashboard
              </router-link>
            </li>
            <li class="nav-list__item">
              <router-link to="/tasks" class="nav-list__link nav-list__link--gated" active-class="nav-list__link--active">
                <svg class="nav-list__gate-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="13" height="13"><rect x="3" y="7" width="10" height="8" rx="1.5"/><path d="M5.5 7V4.5a2.5 2.5 0 015 0V7"/></svg>
                Tasks
                <span class="nav-badge" v-if="activeTasksCount > 0">{{ activeTasksCount }}</span>
              </router-link>
            </li>
            <li class="nav-list__item">
              <router-link to="/cart" class="nav-list__link nav-list__link--gated" active-class="nav-list__link--active">
                <svg class="nav-list__gate-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" width="13" height="13"><rect x="3" y="7" width="10" height="8" rx="1.5"/><path d="M5.5 7V4.5a2.5 2.5 0 015 0V7"/></svg>
                Səbət
                <span class="nav-badge nav-badge--cart" v-if="cartCount > 0">{{ cartCount }}</span>
              </router-link>
            </li>
          </ul>
        </nav>

        <!-- Actions -->
        <div class="app-header__actions">
          <div class="auth-status">
            <span class="auth-status__dot" :class="authStore.isAuthenticated.value ? 'auth-status__dot--live' : 'auth-status__dot--idle'"></span>
            <span class="auth-status__label">{{ authStore.isAuthenticated.value ? authStore.user.value?.displayName : 'Qonaq' }}</span>
          </div>

          <button 
            class="btn btn--ghost btn--sm" 
            @click="handleAuthToggle"
          >
            {{ authStore.isAuthenticated.value ? 'Çıxış' : 'Giriş' }}
          </button>

          <router-link v-if="!authStore.isAuthenticated.value" to="/login" class="btn btn--solid btn--sm">
            Portal →
          </router-link>
          <router-link v-else to="/profile" class="btn btn--ghost btn--sm">
            Profil
          </router-link>
        </div>
      </div>
    </header>
  `
};
