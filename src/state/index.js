import { reactive, computed } from 'vue';
import { authStore } from './authStore.js';
import { cartSlice } from './slices/cartSlice.js';
import { taskSlice } from './slices/taskSlice.js';
import { toastSlice } from './slices/toastSlice.js';
import { profileSlice } from './slices/profileSlice.js';

/**
 * Global Store Architecture implementing Redux Toolkit / Context + Reducer Dispatch Pattern
 */

const actionHistory = reactive([]);
const MAX_HISTORY = 30;

function logAction(action, prevState, nextState) {
  const entry = {
    id: Date.now() + Math.random().toString(36).substring(2, 5),
    timestamp: new Date().toLocaleTimeString(),
    action: { ...action },
    stateSnapshot: {
      auth: { isAuthenticated: authStore.isAuthenticated.value, user: authStore.user.value?.displayName },
      cart: { itemCount: cartSlice.itemCount.value, grandTotal: cartSlice.grandTotal.value },
      tasks: { total: taskSlice.tasks.value.length, completed: taskSlice.stats.value.completed },
      profile: { displayName: profileSlice.profile.value.displayName, role: profileSlice.profile.value.role }
    }
  };

  actionHistory.unshift(entry);
  if (actionHistory.length > MAX_HISTORY) {
    actionHistory.pop();
  }
}

export const globalStore = {
  // Slices
  auth: authStore,
  cart: cartSlice,
  tasks: taskSlice,
  toasts: toastSlice,
  profile: profileSlice,

  // DevTools action history
  actionHistory: computed(() => actionHistory),

  /**
   * Central Redux-style Dispatcher
   * Routes actions to appropriate slice reducers with middleware logging
   */
  dispatch(action) {
    if (!action || !action.type) {
      console.error('[Store] Invalid action passed to dispatch:', action);
      return;
    }

    const { type, payload } = action;
    const [sliceName, actionName] = type.split('/');

    // Middleware pre-hook
    const prevState = this.getState();

    // Reducer router
    switch (type) {
      // Cart Actions
      case 'cart/addItem':
        cartSlice.addItem(payload);
        break;
      case 'cart/removeItem':
        cartSlice.removeItem(payload);
        break;
      case 'cart/updateQuantity':
        cartSlice.updateQuantity(payload.id, payload.qty);
        break;
      case 'cart/applyCoupon':
        cartSlice.applyCoupon(payload);
        break;
      case 'cart/removeCoupon':
        cartSlice.removeCoupon();
        break;
      case 'cart/clearCart':
        cartSlice.clearCart();
        break;

      // Tasks Actions
      case 'tasks/addTask':
        taskSlice.addTask(payload);
        break;
      case 'tasks/toggleTask':
        taskSlice.toggleTask(payload);
        break;
      case 'tasks/deleteTask':
        taskSlice.deleteTask(payload);
        break;
      case 'tasks/bulkComplete':
        taskSlice.bulkComplete();
        break;
      case 'tasks/clearCompleted':
        taskSlice.clearCompleted();
        break;
      case 'tasks/setFilter':
        taskSlice.setFilter(payload);
        break;
      case 'tasks/setSearch':
        taskSlice.setSearchQuery(payload);
        break;
      case 'tasks/setPriority':
        taskSlice.setPriorityFilter(payload);
        break;
      case 'tasks/testStaleClosure':
        taskSlice.runStaleClosureTest();
        break;

      // Toast Actions
      case 'toasts/add':
        toastSlice.addToast(payload.message, payload.type, payload.duration);
        break;
      case 'toasts/remove':
        toastSlice.removeToast(payload);
        break;

      // Profile Actions (Checkpoint 4)
      case 'profile/update':
        profileSlice.updateProfile(payload);
        break;
      case 'profile/reload':
        profileSlice.reloadProfile();
        break;

      // Auth Actions
      case 'auth/login':
        authStore.login(payload.email, payload.password, payload.role, payload.rememberMe);
        break;
      case 'auth/logout':
        authStore.logout(payload);
        break;
      case 'auth/refreshToken':
        authStore.refreshToken();
        break;

      default:
        console.warn(`[Store] Unknown action type "${type}"`);
    }

    // Middleware post-hook (Logging)
    const nextState = this.getState();
    logAction(action, prevState, nextState);
  },

  /**
   * Returns current global state tree snapshot
   */
  getState() {
    return {
      auth: {
        isAuthenticated: authStore.isAuthenticated.value,
        user: authStore.user.value,
        token: authStore.state.token ? `${authStore.state.token.substring(0, 16)}...` : null
      },
      cart: {
        items: cartSlice.items.value,
        itemCount: cartSlice.itemCount.value,
        subtotal: cartSlice.subtotal.value,
        grandTotal: cartSlice.grandTotal.value,
        coupon: cartSlice.coupon.value
      },
      tasks: {
        total: taskSlice.tasks.value.length,
        filter: taskSlice.filter.value,
        stats: taskSlice.stats.value
      },
      toasts: {
        count: toastSlice.toasts.value.length
      },
      profile: {
        displayName: profileSlice.profile.value.displayName,
        bio: profileSlice.profile.value.bio,
        role: profileSlice.profile.value.role,
        website: profileSlice.profile.value.website,
        lastUpdated: profileSlice.lastUpdated.value
      }
    };
  },

  clearActionHistory() {
    actionHistory.length = 0;
  }
};

// Initial system action
globalStore.dispatch({ type: 'store/init', payload: { timestamp: Date.now() } });
