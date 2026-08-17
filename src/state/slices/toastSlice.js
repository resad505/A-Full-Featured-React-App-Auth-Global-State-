import { reactive, computed } from 'vue';

const state = reactive({
  toasts: []
});

let toastIdCounter = 0;

export const toastSlice = {
  state,
  toasts: computed(() => state.toasts),

  addToast(message, type = 'info', duration = 3500) {
    const id = ++toastIdCounter;
    const toast = {
      id,
      message,
      type, // 'success' | 'warning' | 'info' | 'danger'
      timestamp: new Date().toLocaleTimeString()
    };

    state.toasts.push(toast);

    if (duration > 0) {
      setTimeout(() => {
        this.removeToast(id);
      }, duration);
    }

    return id;
  },

  removeToast(id) {
    const index = state.toasts.findIndex(t => t.id === id);
    if (index !== -1) {
      state.toasts.splice(index, 1);
    }
  },

  clearToasts() {
    state.toasts = [];
  }
};
