import { createRouter, createWebHistory } from 'vue-router';
import { authStore } from '../state/authStore.js';
import { isTokenExpired } from '../utils/token.js';
import { HomeView } from '../views/HomeView.js';
import { CatalogView } from '../views/CatalogView.js';
import { LoginView } from '../views/LoginView.js';
import { DashboardView } from '../views/DashboardView.js';
import { TasksView } from '../views/TasksView.js';
import { CartView } from '../views/CartView.js';
import { ProfileView } from '../views/ProfileView.js';
import { NotFoundView } from '../views/NotFoundView.js';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
    meta: {
      title: 'Ana Səhifə',
      isPublic: true
    }
  },
  {
    path: '/catalog',
    name: 'Catalog',
    component: CatalogView,
    meta: {
      title: 'Məhsul Kataloqu',
      isPublic: true
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: {
      title: 'Giriş Portalı',
      requiresGuest: true
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: {
      title: 'İdarəetmə Paneli',
      requiresAuth: true
    }
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: TasksView,
    meta: {
      title: 'Tapşırıqlar Lövhəsi',
      requiresAuth: true
    }
  },
  {
    path: '/cart',
    name: 'Cart',
    component: CartView,
    meta: {
      title: 'Səbət & Sifariş',
      requiresAuth: true
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfileView,
    meta: {
      title: 'İstifadəçi Profili',
      requiresAuth: true
    }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: NotFoundView,
    meta: {
      title: 'Səhifə Tapılmadı',
      isPublic: true
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404'
  }
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0, behavior: 'smooth' };
  }
});

// CHECKPOINT 1 & 2: Navigation Guard & Token Validity Guard
router.beforeEach((to, from, next) => {
  // Update document title for SEO & UX
  const appName = 'Flin';
  document.title = to.meta.title ? `${to.meta.title} · ${appName}` : appName;

  const rawToken = localStorage.getItem('flin_auth_token') || authStore.state.token;
  const tokenValid = rawToken && !isTokenExpired(rawToken);
  const isAuth = authStore.isAuthenticated.value && tokenValid;

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const requiresGuest = to.matched.some(record => record.meta.requiresGuest);

  // If token is found expired during navigation, clean it up
  if (rawToken && isTokenExpired(rawToken) && requiresAuth) {
    authStore.logout('🔒 Sessiyanızın vaxtı bitdi. Zəhmət olmasa yenidən daxil olun.');
    return next({
      path: '/login',
      query: { 
        redirect: to.fullPath,
        reason: '401_expired'
      }
    });
  }

  // Scenario 1: Protected Route accessed without authentication
  if (requiresAuth && !isAuth) {
    authStore.setNotice(
      `🔒 Giriş Tələb Olunur: "${to.meta.title || to.path}" səhifəsinə daxil olmaq üçün zəhmət olmasa daxil olun.`,
      'warning'
    );
    return next({
      path: '/login',
      query: { redirect: to.fullPath }
    });
  }

  // Scenario 2: Guest-only Route (like /login) accessed by authenticated user
  if (requiresGuest && isAuth) {
    authStore.setNotice('Siz artıq daxil olmusunuz. İdarəetmə panelinə yönləndirildiniz.', 'info');
    return next({ path: '/dashboard' });
  }

  // Clear transient notice when navigating between normal pages
  if (!requiresAuth && to.path !== '/login' && from.path !== to.path) {
    authStore.clearNotice();
  }

  next();
});
