import { computed } from 'vue';
import { toastSlice } from '../state/slices/toastSlice.js';

export const ToastContainer = {
  name: 'ToastContainer',
  setup() {
    const toasts = computed(() => toastSlice.toasts.value);
    const removeToast = (id) => toastSlice.removeToast(id);

    return { toasts, removeToast };
  },
  template: `
    <div class="toast-container" aria-live="polite">
      <transition-group name="toast-anim">
        <div 
          v-for="toast in toasts" 
          :key="toast.id" 
          class="toast-item"
          :class="'toast-item--' + toast.type"
        >
          <div class="toast-item__content">
            <span class="toast-item__icon">
              <span v-if="toast.type === 'success'">✓</span>
              <span v-else-if="toast.type === 'warning'">⚠️</span>
              <span v-else-if="toast.type === 'danger'">✕</span>
              <span v-else>ℹ</span>
            </span>
            <div class="toast-item__body">
              <p class="toast-item__msg">{{ toast.message }}</p>
              <span class="toast-item__time">{{ toast.timestamp }}</span>
            </div>
          </div>
          <button class="toast-item__close" @click="removeToast(toast.id)">×</button>
        </div>
      </transition-group>
    </div>
  `
};
