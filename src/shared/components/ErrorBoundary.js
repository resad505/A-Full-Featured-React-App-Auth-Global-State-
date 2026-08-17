import { ref, onErrorCaptured, h } from 'vue';
import { toastSlice } from '../state/slices/toastSlice.js';

/**
 * Checkpoint 6: Error Boundary Component
 * Catches rendering / lifecycle errors in child components using onErrorCaptured hook.
 * Prevents failure of tested component from crashing the entire application.
 */

export const ErrorBoundary = {
  name: 'ErrorBoundary',
  props: {
    name: {
      type: String,
      default: 'Bölmə'
    }
  },
  setup(props, { slots }) {
    const hasError = ref(false);
    const errorInfo = ref(null);
    const errorTime = ref(null);

    onErrorCaptured((err, instance, info) => {
      console.warn(`[ErrorBoundary:${props.name}] Caught error:`, err, info);
      hasError.value = true;
      errorInfo.value = {
        message: err?.message || String(err),
        stack: err?.stack || 'No stack trace available',
        componentInfo: info
      };
      errorTime.value = new Date().toLocaleTimeString();

      // Show floating notification so user/tester immediately sees the boundary intervened
      toastSlice.addToast(
        `🛡️ [ErrorBoundary]: "${props.name}" daxilində xəta tutuldu. Tətbiq çökmədi!`,
        'danger',
        5000
      );

      // Return false to prevent error from propagating further up the component tree
      return false;
    });

    const resetError = () => {
      hasError.value = false;
      errorInfo.value = null;
      errorTime.value = null;
      toastSlice.addToast(`🔄 [ErrorBoundary]: "${props.name}" yenidən başladıldı.`, 'info', 2500);
    };

    return {
      hasError,
      errorInfo,
      errorTime,
      resetError,
      props,
      slots
    };
  },
  template: `
    <div class="error-boundary">
      <!-- Fallback Error UI when an unhandled component exception is captured -->
      <div v-if="hasError" class="error-fallback-card">
        <div class="error-fallback-card__header">
          <div class="error-fallback-card__icon-wrap">
            <span class="error-fallback-card__icon">🛡️</span>
          </div>
          <div class="error-fallback-card__meta">
            <span class="badge badge--danger">Checkpoint 6 · Error Boundary Tutdu</span>
            <h3 class="error-fallback-card__title">Komponent Xətası Baş Verdi</h3>
            <p class="error-fallback-card__sub">
              <strong>{{ props.name }}</strong> daxilində gözlənilməz xəta baş verdi. ErrorBoundary sayəsində qalan bütün naviqasiya və tətbiq işlək vəziyyətdədir.
            </p>
          </div>
        </div>

        <div class="error-fallback-card__details">
          <div class="error-fallback-card__row">
            <span class="error-fallback-card__label">Xəta Mesajı:</span>
            <code class="error-fallback-card__msg">{{ errorInfo.message }}</code>
          </div>
          <div class="error-fallback-card__row">
            <span class="error-fallback-card__label">Tutulma Vaxtı:</span>
            <span class="error-fallback-card__time">{{ errorTime }}</span>
          </div>
          <details class="error-fallback-card__stack-toggle">
            <summary class="error-fallback-card__stack-summary">Ətraflı Stack Trace & Komponent Məlumatı</summary>
            <pre class="error-fallback-card__stack">{{ errorInfo.stack }}</pre>
          </details>
        </div>

        <div class="error-fallback-card__actions">
          <button type="button" class="btn btn--solid btn--md" @click="resetError">
            🔄 Komponenti Yenidən Başlat (Reset)
          </button>
          <router-link to="/dashboard" class="btn btn--ghost btn--md">
            İdarəetmə Panelinə Keç →
          </router-link>
        </div>
      </div>

      <!-- Normal component render when healthy -->
      <slot v-else></slot>
    </div>
  `
};
